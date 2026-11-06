// 数据导入脚本 —— 幂等 upsert
// ---------------------------------------------------------------------------
// 用法：
//   node import-data.js --set=mock       # 导入 mock 数据
//   node import-data.js --set=initial    # 导入正式初始数据
//   node import-data.js --set=mock --reset   # 先清空再导入
//
// 约定：siteSetting 按 id=1 upsert；directions/links 按 code/name upsert；
//       posts 按 slug upsert；reset 模式下先 deleteMany 再逐条 upsert。

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPrisma } from '../../backend/src/prisma/client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      args[key] = value === undefined ? true : value
    }
  }
  return args
}

function loadSeed(setName) {
  const file = setName === 'initial' ? 'initial-data.json' : 'mock-data.json'
  const path = resolve(__dirname, '..', 'seed', file)
  const json = readFileSync(path, 'utf-8')
  return JSON.parse(json)
}

function sitePayload(site) {
  return {
    name: site.orgName,
    shortName: site.shortName || null,
    brandSub: site.brandSub || null,
    region: site.region || null,
    park: site.park || null,
    address: site.address || null,
    addressNote: site.addressNote || null,
    slogan: site.slogan || null,
    intro: site.intro || null,
    contactEmail: site.contactEmail || null,
    hero: site.hero || null,
    statement: site.statement || null,
    mission: site.mission || null,
    team: site.team || null,
    values: null,
    collaboration: null,
    culture: null,
    teamFunctions: null,
    journey: null,
    place: null,
    navigation: null,
    projectsSection: null,
    recruitmentSection: null,
    updatedAt: new Date()
  }
}

function postPayload(source) {
  return {
    slug: source.slug,
    type: source.type,
    status: source.status || 'published',
    title: source.title,
    summary: source.summary || null,
    content: source.content || null,
    publishedAt: source.publishedAt ? new Date(source.publishedAt) : null,
    sortOrder: source.sortOrder ?? 0,
    isPinned: source.isPinned ?? false
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const setName = args.set || 'mock'
  const reset = !!args.reset

  const data = loadSeed(setName)
  const prisma = getPrisma()

  try {
    if (reset) {
      console.log('[import] reset 模式：清空所有数据')
      await prisma.post.deleteMany()
      await prisma.externalLink.deleteMany()
      await prisma.businessDirection.deleteMany()
      await prisma.siteSetting.deleteMany()
    }

    // site_setting：固定 id=1
    await prisma.siteSetting.upsert({
      where: { id: 1 },
      create: { id: 1, ...sitePayload(data.siteSetting) },
      update: sitePayload(data.siteSetting)
    })

    // directions：按 code upsert
    for (const d of data.businessDirections || []) {
      await prisma.businessDirection.upsert({
        where: { code: d.code },
        create: {
          code: d.code,
          title: d.title,
          summary: d.summary || null,
          points: d.points || null,
          sortOrder: d.sortOrder ?? 0
        },
        update: {
          title: d.title,
          summary: d.summary || null,
          points: d.points || null,
          sortOrder: d.sortOrder ?? 0
        }
      })
    }

    // external_links：按 name upsert
    for (const link of data.externalLinks || []) {
      await prisma.externalLink.upsert({
        where: { name: link.name },
        create: {
          name: link.name,
          url: link.url,
          desc: link.desc || null,
          primary: !!link.primary,
          sortOrder: link.sortOrder ?? 0
        },
        update: {
          url: link.url,
          desc: link.desc || null,
          primary: !!link.primary,
          sortOrder: link.sortOrder ?? 0
        }
      })
    }

    // posts：按 slug upsert
    for (const post of data.posts || []) {
      await prisma.post.upsert({
        where: { slug: post.slug },
        create: postPayload(post),
        update: postPayload(post)
      })
    }

    const [settings, directions, links, posts] = await Promise.all([
      prisma.siteSetting.count(),
      prisma.businessDirection.count(),
      prisma.externalLink.count(),
      prisma.post.count()
    ])

    console.log(`[import] done (set=${setName}${reset ? ', reset' : ''})`)
    console.log(`  site_setting            ${settings} 行`)
    console.log(`  business_directions     ${directions} 行`)
    console.log(`  external_links          ${links} 行`)
    console.log(`  posts                   ${posts} 行`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('[import] failed:', err)
  process.exit(1)
})
