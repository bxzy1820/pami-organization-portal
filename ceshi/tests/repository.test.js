// Repository 单元测试 —— 按冻结接口断言返回结构
// ---------------------------------------------------------------------------
// 所有用例都使用 fake-db，不依赖真实 Prisma 引擎或 MySQL。

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb, defaultPosts } from './helpers/fake-db.js'
import { getSite, getHome, getAbout, getBusiness,
         getProjects, getNews, getRecruitment } from '../backend/src/repository.js'

// ============================================================
// getSite
// ============================================================
describe('Repository getSite', () => {
  it('返回 orgName / orgShortName / intro / mission / teamIntro / contact / externalLinks', async () => {
    const db = createFakeDb()
    const result = await getSite(db)

    assert.equal(result.orgName, '测试组织')
    assert.equal(result.orgShortName, '测试')
    assert.equal(result.intro, '测试简介')
    assert.equal(result.mission, '我们的使命')
    assert.equal(result.teamIntro, '团队整体介绍')
    assert.equal(result.contact.email, 'test@pami.dev')
    assert.equal(result.contact.address, '河北省保定市')
    assert.deepEqual(result.externalLinks, [{ name: '内部平台', url: 'http://example.com/' }])
  })

  it('site_settings 不存在返回 null', async () => {
    const db = createFakeDb({ siteSetting: null })
    const result = await getSite(db)
    assert.equal(result, null)
  })
})

// ============================================================
// getHome
// ============================================================
describe('Repository getHome', () => {
  it('返回 orgName / slogan / briefIntro / directions[]', async () => {
    const db = createFakeDb()
    const result = await getHome(db)

    assert.equal(result.orgName, '测试组织')
    assert.equal(result.slogan, '测试标语')
    assert.equal(result.briefIntro, '首页简短介绍')
    assert.equal(result.directions.length, 4)
    assert.deepEqual(result.directions[0], { title: '方向一', desc: '方向一描述' })
  })

  it('directions 只返回 isActive=true', async () => {
    const db = createFakeDb()
    // 把最后一个方向关掉
    db.businessDirection.findMany = async function (opts) {
      assert.deepEqual(opts.where, { isActive: true })
      return []
    }
    const result = await getHome(db)
    assert.equal(result.directions.length, 0)
  })
})

// ============================================================
// getAbout
// ============================================================
describe('Repository getAbout', () => {
  it('返回 intro / mission / teamIntro / contact', async () => {
    const db = createFakeDb()
    const result = await getAbout(db)
    assert.equal(result.intro, '测试简介')
    assert.equal(result.mission, '我们的使命')
    assert.equal(result.teamIntro, '团队整体介绍')
    assert.equal(result.contact.email, 'test@pami.dev')
  })

  it('site_settings 不存在时返回空字段默认值', async () => {
    const db = createFakeDb({ siteSetting: null })
    const result = await getAbout(db)
    assert.deepEqual(result, { intro: '', mission: '', teamIntro: '', contact: { email: '', address: '' } })
  })
})

// ============================================================
// getBusiness
// ============================================================
describe('Repository getBusiness', () => {
  it('返回 { list:[{title,desc}] } 结构', async () => {
    const db = createFakeDb()
    const result = await getBusiness(db)
    assert.ok(Array.isArray(result.list))
    assert.equal(result.list.length, 4)
    assert.deepEqual(result.list[0], { title: '方向一', desc: '方向一描述' })
  })
})

// ============================================================
// getProjects
// ============================================================
describe('Repository getProjects', () => {
  it('只查 type=achievement + status=published', async () => {
    const db = createFakeDb()
    await getProjects(undefined, undefined, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.deepEqual(call.args.where, { type: 'achievement', status: 'published' })
  })

  it('空栏目返回契约空结构 { list:[], total:0, page:1, size:10 }', async () => {
    const db = createFakeDb({ posts: [] })
    const result = await getProjects(undefined, undefined, db)
    assert.deepEqual(result, { list: [], total: 0, page: 1, size: 10 })
  })

  it('元素字段为契约约定的 id/title/summary/content/publishedAt', async () => {
    const db = createFakeDb()
    const result = await getProjects(undefined, undefined, db)
    assert.equal(result.list.length, 1)  // offline 那条被过滤掉
    assert.deepEqual(Object.keys(result.list[0]).sort(),
      ['content', 'id', 'publishedAt', 'summary', 'title'])
    assert.equal(result.list[0].title, '成果 A')
    assert.equal(result.list[0].summary, 'A')
    assert.equal(result.list[0].content, '')
  })

  it('支持分页参数并回显 page/size', async () => {
    const db = createFakeDb()
    const result = await getProjects(2, 1, db)
    assert.equal(result.page, 2)
    assert.equal(result.size, 1)
  })
})

// ============================================================
// getNews —— 分页 + 置顶优先
// ============================================================
describe('Repository getNews', () => {
  it('默认 page=1 size=10（契约默认值）', async () => {
    const db = createFakeDb()
    await getNews(undefined, undefined, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.equal(call.args.skip, 0)
    assert.equal(call.args.take, 10)
    const countCall = db.calls.find((c) => c.name === 'post.count')
    assert.equal(countCall.args.where.status, 'published')
  })

  it('只返回 status=published，draft/offline 不外泄', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 10, db)
    assert.equal(result.total, 2)   // news-pinned + news-latest
    for (const item of result.list) {
      assert.ok(!item.title.includes('草稿'))
    }
  })

  it('置顶公告优先于发布时间更新的未置顶公告', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 10, db)
    assert.equal(result.list[0].title, '置顶公告')       // isPinned=true → 排最前
    assert.equal(result.list[1].title, '最新公告')       // 置顶后按 publishedAt DESC
  })

  it('越界分页不抛错，返回空 list + total 仍正确', async () => {
    const db = createFakeDb()
    const result = await getNews(100, 10, db)
    assert.equal(result.total, 2)
    assert.deepEqual(result.list, [])
  })

  it('非法分页参数被钳制（page→1，负数 size→1）', async () => {
    const db = createFakeDb()
    await getNews(0, -5, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.equal(call.args.skip, 0)
    assert.equal(call.args.take, 1)
  })

  it('size 超过 50 被钳制到 50（契约上限）', async () => {
    const db = createFakeDb()
    await getNews(1, 200, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.equal(call.args.take, 50)
  })
})

// ============================================================
// getRecruitment
// ============================================================
describe('Repository getRecruitment', () => {
  it('按 sortOrder ASC + publishedAt DESC 排序', async () => {
    const db = createFakeDb()
    const result = await getRecruitment(1, 10, db)
    assert.equal(result.list.length, 1)
    assert.equal(result.list[0].title, '招聘 A')
  })

  it('空栏目返回契约空结构', async () => {
    const db = createFakeDb({ posts: [] })
    const result = await getRecruitment(undefined, undefined, db)
    assert.deepEqual(result, { list: [], total: 0, page: 1, size: 10 })
  })

  it('第二页返回正确并回显 page/size', async () => {
    const db = createFakeDb({ posts: [
      ...defaultPosts,
      { id: 99, slug: 'rec-b', type: 'recruitment', status: 'published', title: '招聘 B', summary: 'B', content: null, coverPath: null, publishedAt: new Date('2026-11-02T02:00:00.000Z'), sortOrder: 1, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 100, slug: 'rec-c', type: 'recruitment', status: 'published', title: '招聘 C', summary: 'C', content: null, coverPath: null, publishedAt: new Date('2026-11-03T02:00:00.000Z'), sortOrder: 2, isPinned: false, createdAt: new Date(), updatedAt: new Date() }
    ] })
    const result = await getRecruitment(2, 1, db)
    assert.equal(result.page, 2)
    assert.equal(result.size, 1)
    assert.equal(result.list.length, 1)
  })
})

// ============================================================
// 字段映射（与 API 契约对齐）
// ============================================================
describe('Repository 字段映射（契约对齐）', () => {
  it('list 元素 publishedAt 格式为 YYYY-MM-DD HH:mm:ss', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 10, db)
    for (const item of result.list) {
      assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(item.publishedAt))
    }
  })

  it('列表元素不包含契约之外的 slug/pinned/desc/date 字段', async () => {
    const db = createFakeDb()
    const [news, projects, recruitment] = await Promise.all([
      getNews(1, 10, db), getProjects(1, 10, db), getRecruitment(1, 10, db)
    ])
    for (const item of [...news.list, ...projects.list, ...recruitment.list]) {
      assert.ok(!('slug' in item), '不应输出 slug')
      assert.ok(!('pinned' in item), '不应输出 pinned（置顶仅影响排序）')
      assert.ok(!('desc' in item), '不应输出 desc（契约为 summary）')
      assert.ok(!('date' in item), '不应输出 date（契约为 publishedAt）')
    }
  })

  it('getSite/getHome/getAbout/getBusiness 顶层字段名与契约一致', async () => {
    const db = createFakeDb()
    const site = await getSite(db)
    assert.deepEqual(Object.keys(site).sort(),
      ['contact', 'externalLinks', 'intro', 'mission', 'orgName', 'orgShortName', 'teamIntro'])
    const home = await getHome(db)
    assert.deepEqual(Object.keys(home).sort(), ['briefIntro', 'directions', 'orgName', 'slogan'])
    const about = await getAbout(db)
    assert.deepEqual(Object.keys(about).sort(), ['contact', 'intro', 'mission', 'teamIntro'])
    const business = await getBusiness(db)
    assert.deepEqual(Object.keys(business).sort(), ['list'])
  })
})
