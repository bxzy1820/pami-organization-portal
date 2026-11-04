import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { POST_TYPES, POST_STATUSES } from '../backend/src/repositories/post.repository.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (...segments) => readFileSync(path.join(ROOT, ...segments), 'utf8')

const prismaSchema = read('backend', 'prisma', 'schema.prisma')
const migrationSql = read('backend', 'prisma', 'migrations', '20261104000000_init', 'migration.sql')
const schemaSql = read('database', 'schema.sql')
const importScript = read('database', 'scripts', 'import-data.js')
const mockData = JSON.parse(read('database', 'seed', 'mock-data.json'))
const initialData = JSON.parse(read('database', 'seed', 'initial-data.json'))

/** 解析 Prisma model：字段名、列名、类型、是否可空、是否 @id */
function parsePrismaModels(source) {
  const models = {}
  const modelPattern = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g

  for (const match of source.matchAll(modelPattern)) {
    const [, name, body] = match
    const tableMatch = body.match(/@@map\("(\w+)"\)/)
    const fields = []

    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('//') || line.startsWith('@@') || line.startsWith('///')) continue

      const [field, type] = line.split(/\s+/)
      if (!field || !type) continue

      const mapMatch = line.match(/@map\("([^"]+)"\)/)
      fields.push({
        field,
        column: mapMatch ? mapMatch[1] : field,
        type: type.replace('?', '').replace('[]', ''),
        optional: type.endsWith('?'),
        id: /@id/.test(line)
      })
    }

    models[name] = { table: tableMatch ? tableMatch[1] : name, fields }
  }

  return models
}

function parsePrismaEnums(source) {
  const enums = {}
  for (const match of source.matchAll(/enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g)) {
    enums[match[1]] = match[2]
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('//'))
  }
  return enums
}

/** 解析 SQL 建表语句中的表名与列名（忽略索引定义） */
function parseSqlTables(source) {
  const tables = {}
  for (const match of source.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?`(\w+)` \(([\s\S]*?)\n\) (?:ENGINE=|DEFAULT CHARACTER SET)/g)) {
    const [, table, body] = match
    const columns = []
    for (const rawLine of body.split('\n')) {
      const columnMatch = rawLine.trim().match(/^`(\w+)`\s+(.*)$/)
      if (columnMatch) columns.push({ name: columnMatch[1], definition: columnMatch[2] })
    }
    tables[table] = columns
  }
  return tables
}

const models = parsePrismaModels(prismaSchema)
const enums = parsePrismaEnums(prismaSchema)
const migrationTables = parseSqlTables(migrationSql)
const schemaTables = parseSqlTables(schemaSql)

const EXPECTED_TABLES = ['site_settings', 'business_directions', 'posts', 'external_links', 'media_files']

describe('Schema: Prisma 与 SQL 建表脚本一致', () => {
  it('schema.prisma 定义了 5 张一期表，且均映射到约定表名', () => {
    assert.deepEqual(
      Object.values(models).map((model) => model.table).sort(),
      [...EXPECTED_TABLES].sort()
    )
  })

  it('迁移脚本与 schema.sql 的表、列完全一致', () => {
    assert.deepEqual(Object.keys(migrationTables).sort(), [...EXPECTED_TABLES].sort())
    assert.deepEqual(Object.keys(schemaTables).sort(), [...EXPECTED_TABLES].sort())

    for (const table of EXPECTED_TABLES) {
      const migrationColumns = migrationTables[table].map((column) => column.name).sort()
      const schemaColumns = schemaTables[table].map((column) => column.name).sort()
      assert.deepEqual(migrationColumns, schemaColumns, `${table} 迁移与建表脚本列不一致`)
    }
  })

  it('Prisma 字段映射到 SQL 列名，两边列集合一致', () => {
    for (const model of Object.values(models)) {
      const prismaColumns = model.fields.map((field) => field.column).sort()
      const sqlColumns = schemaTables[model.table].map((column) => column.name).sort()
      assert.deepEqual(prismaColumns, sqlColumns, `${model.table} Prisma 字段与 SQL 列不一致`)
    }
  })

  it('JSON 字段在 MySQL 中均为 JSON 类型，规避旧版本兼容问题', () => {
    for (const model of Object.values(models)) {
      for (const field of model.fields.filter((item) => item.type === 'Json')) {
        const column = schemaTables[model.table].find((item) => item.name === field.column)
        assert.ok(column, `${model.table}.${field.column} 在 SQL 中不存在`)
        assert.match(column.definition, /^JSON/i, `${model.table}.${field.column} 必须是 JSON 类型`)
      }
    }
  })

  it('主键、唯一键与索引在 SQL 中声明', () => {
    assert.match(schemaSql, /`id` INT NOT NULL DEFAULT 1,/)
    assert.match(schemaSql, /PRIMARY KEY \(`id`\)/)
    assert.match(schemaSql, /UNIQUE KEY `business_directions_code_key` \(`code`\)/)
    assert.match(schemaSql, /UNIQUE KEY `posts_slug_key` \(`slug`\)/)
    assert.match(schemaSql, /KEY `posts_type_status_published_at_idx` \(`type`, `status`, `published_at`\)/)
    assert.match(schemaSql, /KEY `external_links_is_active_sort_order_idx` \(`is_active`, `sort_order`\)/)
  })

  it('必填列 NOT NULL，可空文本列允许 NULL', () => {
    const siteColumns = schemaTables.site_settings
    const column = (name) => siteColumns.find((item) => item.name === name)
    assert.match(column('name').definition, /NOT NULL/)
    assert.match(column('short_name').definition, /NOT NULL/)
    assert.match(column('intro').definition, /^TEXT NULL/)
    assert.match(column('contact_email').definition, /NULL/)
  })
})

describe('Schema: 枚举与文章类型一致', () => {
  it('PostType / PostStatus 与 Repository 常量一致', () => {
    assert.deepEqual(enums.PostType, [...POST_TYPES])
    assert.deepEqual(enums.PostStatus, [...POST_STATUSES])
  })
})

describe('Schema: 种子数据字段覆盖 Prisma 模型', () => {
  const MODEL_BY_TABLE = Object.fromEntries(Object.entries(models).map(([name, model]) => [model.table, { name, ...model }]))
  const fieldSet = (modelName) => new Set(models[modelName].fields.map((field) => field.field))

  it('site_settings 种子字段全部存在于 Prisma 模型', () => {
    const allowed = fieldSet('SiteSetting')
    for (const data of [mockData, initialData]) {
      for (const key of Object.keys(data.siteSettings)) {
        assert.ok(allowed.has(key), `siteSettings.${key} 在 Prisma 模型中不存在`)
      }
    }

    // 必填字段不能漏
    for (const required of ['name', 'shortName']) {
      assert.ok(Object.keys(initialData.siteSettings).includes(required))
    }
  })

  it('研究方向 / 文章 / 外链种子字段全部存在于 Prisma 模型', () => {
    const directionFields = fieldSet('BusinessDirection')
    for (const row of [...mockData.businessDirections, ...initialData.businessDirections]) {
      for (const key of Object.keys(row)) assert.ok(directionFields.has(key), `businessDirections.${key} 不存在`)
    }

    const postFields = fieldSet('Post')
    for (const row of [...mockData.posts, ...initialData.posts]) {
      for (const key of Object.keys(row)) assert.ok(postFields.has(key), `posts.${key} 不存在`)
    }

    const linkFields = fieldSet('ExternalLink')
    for (const row of [...mockData.externalLinks, ...initialData.externalLinks]) {
      for (const key of Object.keys(row)) assert.ok(linkFields.has(key), `externalLinks.${key} 不存在`)
    }
  })

  it('导入脚本的字段白名单与 Prisma 模型一致，避免静默丢字段', () => {
    const payloadBlock = (startMarker, endMarker) => {
      const start = importScript.indexOf(startMarker)
      const end = importScript.indexOf(endMarker)
      assert.ok(start >= 0 && end > start, `找不到 ${startMarker}`)
      const block = importScript.slice(start, end)
      return block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^\w+:\s/.test(line))
        .map((line) => line.split(':')[0])
    }

    const settingsKeys = payloadBlock('function toSettingsPayload', 'function toPostPayload')
    const settingsFields = fieldSet('SiteSetting')
    for (const key of settingsKeys) {
      assert.ok(settingsFields.has(key), `导入脚本 siteSettings 字段 ${key} 不在模型中`)
    }
    assert.deepEqual([...settingsKeys].sort(), [...Object.keys(mockData.siteSettings)].sort())

    const postKeys = payloadBlock('function toPostPayload', 'async function clearAll')
    const postFields = fieldSet('Post')
    for (const key of postKeys) assert.ok(postFields.has(key), `导入脚本 posts 字段 ${key} 不在模型中`)
  })

  it('五张表都有对应的 Prisma 模型，防止新增表只改 SQL', () => {
    for (const table of EXPECTED_TABLES) {
      const model = MODEL_BY_TABLE[table]
      assert.ok(model, `${table} 缺少 Prisma 模型`)
      assert.ok(model.fields.length >= 6, `${table} 字段数量异常`)
    }
  })
})
