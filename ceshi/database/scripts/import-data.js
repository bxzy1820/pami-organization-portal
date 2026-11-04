/**
 * 组织门户数据导入脚本
 * 负责人：赵天硕（feature/data-layer）
 *
 * 用法（在 backend 目录执行，或从仓库根目录执行均可）：
 *   node database/scripts/import-data.js --set=mock             # 追加/覆盖模拟数据
 *   node database/scripts/import-data.js --set=initial          # 导入正式初始数据
 *   node database/scripts/import-data.js --set=mock --reset     # 清空后导入模拟数据
 *   node database/scripts/import-data.js --set=initial --reset  # 清空后导入正式数据
 *
 * 约定：
 *   - site_settings 固定 id = 1，使用 upsert，不会产生多行
 *   - business_directions 按 code upsert
 *   - posts 按 slug upsert
 *   - external_links 没有业务唯一键，非 reset 时会先清空再写入，避免重复
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prisma from '../../backend/src/prisma/client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_DIR = path.resolve(__dirname, '../seed')
const SETTINGS_ID = 1

function parseArgs(argv) {
  const options = { set: null, reset: false }
  for (const arg of argv) {
    if (arg.startsWith('--set=')) options.set = arg.slice('--set='.length)
    else if (arg === '--reset') options.reset = true
  }
  return options
}

async function loadSeed(setName) {
  if (setName !== 'mock' && setName !== 'initial') {
    throw new Error('请使用 --set=mock 或 --set=initial 指定数据文件')
  }
  const file = path.join(SEED_DIR, `${setName}-data.json`)
  const raw = await readFile(file, 'utf8')
  return { file, data: JSON.parse(raw) }
}

/** 只挑选 schema 中存在的字段，避免数据文件写错字段名时静默丢数据 */
function toSettingsPayload(source) {
  return {
    name: source.name,
    shortName: source.shortName,
    brandSub: source.brandSub ?? null,
    uscc: source.uscc ?? null,
    region: source.region ?? null,
    park: source.park ?? null,
    address: source.address ?? null,
    addressNote: source.addressNote ?? null,
    slogan: source.slogan ?? null,
    intro: source.intro ?? null,
    contactEmail: source.contactEmail || null,
    logoPath: source.logoPath ?? null,
    heroBgPath: source.heroBgPath ?? null,
    hero: source.hero ?? null,
    statement: source.statement ?? null,
    mission: source.mission ?? null,
    culture: source.culture ?? null,
    values: source.values ?? null,
    collaboration: source.collaboration ?? null,
    cooperation: source.cooperation ?? null,
    team: source.team ?? null,
    teamFunctions: source.teamFunctions ?? null,
    journey: source.journey ?? null,
    place: source.place ?? null,
    navigation: source.navigation ?? null,
    projectsSection: source.projectsSection ?? null,
    recruitmentSection: source.recruitmentSection ?? null
  }
}

function toPostPayload(source) {
  return {
    slug: source.slug,
    type: source.type,
    title: source.title,
    summary: source.summary ?? null,
    content: source.content ?? null,
    coverPath: source.coverPath ?? null,
    tags: source.tags ?? null,
    status: source.status ?? 'draft',
    publishedAt: source.publishedAt ? new Date(source.publishedAt) : null,
    sortOrder: source.sortOrder ?? 0
  }
}

async function clearAll() {
  // 按依赖顺序清理（一期表之间没有外键，顺序仅保证幂等）
  await prisma.mediaFile.deleteMany()
  await prisma.post.deleteMany()
  await prisma.businessDirection.deleteMany()
  await prisma.externalLink.deleteMany()
  await prisma.siteSetting.deleteMany()
}

async function importData(data, { reset }) {
  if (reset) await clearAll()

  const payload = toSettingsPayload(data.siteSettings)
  await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...payload },
    update: payload
  })

  for (const direction of data.businessDirections ?? []) {
    await prisma.businessDirection.upsert({
      where: { code: direction.code },
      create: {
        code: direction.code,
        title: direction.title,
        summary: direction.summary ?? null,
        points: direction.points ?? null,
        sortOrder: direction.sortOrder ?? 0,
        isActive: direction.isActive ?? true
      },
      update: {
        title: direction.title,
        summary: direction.summary ?? null,
        points: direction.points ?? null,
        sortOrder: direction.sortOrder ?? 0,
        isActive: direction.isActive ?? true
      }
    })
  }

  // 外部链接无业务唯一键，先清空再写入，保证与数据文件一致
  await prisma.externalLink.deleteMany()
  for (const link of data.externalLinks ?? []) {
    await prisma.externalLink.create({
      data: {
        label: link.label,
        description: link.description ?? null,
        url: link.url,
        isPrimary: link.isPrimary ?? false,
        sortOrder: link.sortOrder ?? 0,
        isActive: link.isActive ?? true
      }
    })
  }

  for (const post of data.posts ?? []) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      create: toPostPayload(post),
      update: toPostPayload(post)
    })
  }

  for (const media of data.mediaFiles ?? []) {
    await prisma.mediaFile.create({
      data: {
        filename: media.filename,
        path: media.path,
        mimeType: media.mimeType ?? null,
        sizeBytes: media.sizeBytes ?? null,
        kind: media.kind ?? null
      }
    })
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const { file, data } = await loadSeed(options.set)

  console.log(`数据文件：${file}`)
  console.log(`模式：${options.reset ? '清空后导入' : '增量导入'}`)

  if (data.meta?.isMock) {
    console.log('⚠ 当前导入的是模拟数据，仅用于开发联调，不要用于正式环境。')
  }

  await importData(data, options)

  const [settings, directions, links, posts, media] = await Promise.all([
    prisma.siteSetting.count(),
    prisma.businessDirection.count(),
    prisma.externalLink.count(),
    prisma.post.count(),
    prisma.mediaFile.count()
  ])

  console.log('导入完成：')
  console.log(`  site_settings        ${settings} 行`)
  console.log(`  business_directions  ${directions} 行`)
  console.log(`  external_links       ${links} 行`)
  console.log(`  posts                ${posts} 行`)
  console.log(`  media_files          ${media} 行`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('导入失败：', error.message)
    await prisma.$disconnect()
    process.exit(1)
  })
