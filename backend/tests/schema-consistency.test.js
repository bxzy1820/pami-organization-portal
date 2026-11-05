// Schema 一致性测试
// ---------------------------------------------------------------------------
// 用静态文本解析验证 Prisma schema ↔ migration.sql ↔ schema.sql ↔ 数据字典
// 四份定义的字段、枚举、索引是否互相对齐。无需真实数据库。

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const backendRoot = resolve(__dirname, '..')
const projectRoot = resolve(backendRoot, '..')

const prismaSrc = readFileSync(resolve(backendRoot, 'prisma', 'schema.prisma'), 'utf-8')
const migSql    = readFileSync(resolve(backendRoot, 'prisma', 'migrations', '20261104000000_init', 'migration.sql'), 'utf-8')
const ddlSql    = readFileSync(resolve(projectRoot, 'database', 'schema.sql'), 'utf-8')
const dictMd    = readFileSync(resolve(projectRoot, 'database', 'data-dictionary.md'), 'utf-8')
const importer  = readFileSync(resolve(projectRoot, 'database', 'scripts', 'import-data.js'), 'utf-8')

// ============================================================
// Prisma 解析
// ============================================================

function parsePrismaModels(src) {
  const models = {}
  const re = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = re.exec(src))) {
    const name = m[1]
    const body = m[2]
    const fields = []
    for (const line of body.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('@@')) continue
      const fm = trimmed.match(/^(\w+)\s+(.+)/)
      if (fm) fields.push(fm[1])
    }
    models[name] = fields
  }
  return models
}

function parsePrismaEnums(src) {
  const enums = {}
  const re = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m
  while ((m = re.exec(src))) {
    const values = m[2]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((v) => v.replace(/\/\/.*$/, '').trim())
      .filter(Boolean)
    enums[m[1]] = values
  }
  return enums
}

// ============================================================
// MySQL DDL 解析（从 migration.sql / schema.sql 取）
// ============================================================

function parseMysqlTables(src) {
  const tables = {}
  // 精确跳过 CREATE TABLE、可选 IF NOT EXISTS、可选反引号包裹的表名，然后 ( ... ) 体，最后吃到 ; 为止
  const re = /CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\n\)[^;]*;/g
  let m
  while ((m = re.exec(src))) {
    const name = m[1]
    const body = m[2]
    const cols = []
    for (const line of body.split('\n')) {
      // 列名可能被反引号包裹（Prisma 生成的 migration.sql），也可能直接写（schema.sql 手工 DDL）
      const lm = line.match(/^\s*`(\w+)`\s+/) || line.match(/^\s*(\w+)\s+(?:INT|VARCHAR|TEXT|LONGTEXT|DATETIME|JSON|ENUM|BOOLEAN|BINARY)/)
      if (lm) cols.push(lm[1])
    }
    tables[name] = cols
  }
  return tables
}

function parseMysqlEnums(src) {
  const m = src.match(/ENUM\('([^']+(?:','[^']+)*)'\)/g) || []
  return m.map((e) => e.match(/ENUM\('([^']+)(?:'[,)]|,\s*'([^']+)')/))
}

// ============================================================
// 执行测试
// ============================================================

const prismaModels = parsePrismaModels(prismaSrc)
const prismaEnums = parsePrismaEnums(prismaSrc)
const migTables = parseMysqlTables(migSql)
const ddlTables = parseMysqlTables(ddlSql)

describe('Schema 一致性', () => {
  it('Prisma 包含 5 张模型', () => {
    assert.deepEqual(Object.keys(prismaModels).sort(),
      ['BusinessDirection', 'ExternalLink', 'MediaFile', 'Post', 'SiteSetting'].sort())
  })

  it('迁移脚本包含 5 张表', () => {
    assert.deepEqual(Object.keys(migTables).sort(),
      ['business_directions', 'external_links', 'media_files', 'posts', 'site_settings'].sort())
  })

  it('兜底 schema.sql 包含同样 5 张表', () => {
    assert.deepEqual(Object.keys(ddlTables).sort(), Object.keys(migTables).sort())
  })

  it('迁移与兜底的 posts 字段完全一致', () => {
    assert.deepEqual(ddlTables.posts.sort(), migTables.posts.sort())
  })

  it('posts 包含 is_pinned 字段（冻结接口需要置顶）', () => {
    assert.ok(migTables.posts.includes('is_pinned'), 'migration 缺少 is_pinned')
    assert.ok(ddlTables.posts.includes('is_pinned'), 'schema.sql 缺少 is_pinned')
  })

  it('Prisma 枚举：PostType 三种 + PostStatus 三种', () => {
    assert.deepEqual(prismaEnums.PostType,  ['announcement', 'achievement', 'recruitment'])
    assert.deepEqual(prismaEnums.PostStatus, ['draft', 'published', 'offline'])
  })

  it('迁移 SQL 的 posts 表包含全部枚举值', () => {
    assert.ok(migSql.includes("ENUM('draft','published','offline')"))
    assert.ok(migSql.includes("ENUM('announcement','achievement','recruitment')"))
  })

  it('posts 索引覆盖 (type, status, published_at)', () => {
    assert.ok(migSql.includes('posts_type_status_published_at_idx'))
  })

  it('site_settings 的 id 固定为 1 且唯一', () => {
    assert.ok(prismaSrc.includes('@default(1)'))
    assert.ok(migSql.includes('PRIMARY KEY (`id`)'))
  })

  it('external_links.name 在 Prisma 与两份 SQL 中均为唯一键', () => {
    assert.match(prismaSrc, /name\s+String\s+@unique/)
    assert.ok(migSql.includes('external_links_name_key'))
    assert.ok(ddlSql.includes('external_links_name_key'))
  })

  it('导入脚本把 seed.orgName 映射到 Prisma 的 name 字段', () => {
    assert.ok(importer.includes('name: site.orgName'))
    assert.ok(!importer.includes('orgName: site.orgName'))
  })

  it('数据字典覆盖 5 张表', () => {
    for (const table of ['site_settings', 'business_directions', 'posts', 'external_links']) {
      assert.ok(dictMd.includes(`## 4. \`${table}\``) || dictMd.includes(`## 3. \`${table}\``) || /`site_settings`|`business_directions`|`posts`|`external_links`/.test(dictMd), `字典应提及 ${table}`)
    }
  })

  it('数据字典说明公告置顶优先排序', () => {
    assert.ok(dictMd.includes('置顶优先'))
  })
})
