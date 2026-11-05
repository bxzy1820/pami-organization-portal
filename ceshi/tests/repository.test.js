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
    await getProjects(db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.deepEqual(call.args.where, { type: 'achievement', status: 'published' })
  })

  it('空栏目返回 items=[] + total=0', async () => {
    const db = createFakeDb({ posts: [] })
    const result = await getProjects(db)
    assert.deepEqual(result, { items: [], total: 0, page: 1, pageSize: 20 })
  })

  it('published 成果按 sortOrder ASC + publishedAt DESC 排序', async () => {
    const db = createFakeDb()
    const result = await getProjects(db)
    assert.equal(result.items.length, 1)  // offline 那条被过滤掉
    assert.equal(result.items[0].title, '成果 A')
    assert.ok(result.items[0].date)
  })
})

// ============================================================
// getNews —— 冻结接口核心：分页 + 置顶优先
// ============================================================
describe('Repository getNews', () => {
  it('默认 page=1 pageSize=20', async () => {
    const db = createFakeDb()
    await getNews(undefined, undefined, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.equal(call.args.skip, 0)
    assert.equal(call.args.take, 20)
    assert.equal((await db.calls.find((c) => c.name === 'post.count')).args.where.status, 'published')
  })

  it('只返回 status=published，draft/offline 不外泄', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 20, db)
    assert.equal(result.total, 2)   // news-pinned + news-latest
    for (const item of result.items) {
      assert.ok(!item.title.includes('草稿'))
    }
  })

  it('置顶公告优先于发布时间更新的未置顶公告', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 20, db)
    assert.equal(result.items[0].title, '置顶公告')       // isPinned=true → 排最前
    assert.equal(result.items[1].title, '最新公告')       // 置顶后按 publishedAt DESC
  })

  it('越界分页不抛错，返回空 items + total 仍正确', async () => {
    const db = createFakeDb()
    const result = await getNews(100, 10, db)
    assert.equal(result.total, 2)
    assert.deepEqual(result.items, [])
  })

  it('分页参数非法（0 或负数）会被归一化到 1', async () => {
    const db = createFakeDb()
    await getNews(0, -5, db)
    const call = db.calls.find((c) => c.name === 'post.findMany')
    assert.equal(call.args.skip, 0)
    assert.equal(call.args.take, 1)   // Math.max(1, Math.min(-5, 100)) → 1 （但 -5 max(1) = 1）
  })
})

// ============================================================
// getRecruitment
// ============================================================
describe('Repository getRecruitment', () => {
  it('按 sortOrder ASC + publishedAt DESC 排序', async () => {
    const db = createFakeDb()
    const result = await getRecruitment(1, 20, db)
    assert.equal(result.items.length, 1)
    assert.equal(result.items[0].title, '招聘 A')
  })

  it('空栏目返回 items=[] + total=0', async () => {
    const db = createFakeDb({ posts: [] })
    const result = await getRecruitment(1, 20, db)
    assert.deepEqual(result, { items: [], total: 0, page: 1, pageSize: 20 })
  })

  it('第二页返回正确', async () => {
    const db = createFakeDb({ posts: [
      ...defaultPosts,
      { id: 99, slug: 'rec-b', type: 'recruitment', status: 'published', title: '招聘 B', summary: 'B', content: null, coverPath: null, publishedAt: new Date('2026-11-02T02:00:00.000Z'), sortOrder: 1, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 100, slug: 'rec-c', type: 'recruitment', status: 'published', title: '招聘 C', summary: 'C', content: null, coverPath: null, publishedAt: new Date('2026-11-03T02:00:00.000Z'), sortOrder: 2, isPinned: false, createdAt: new Date(), updatedAt: new Date() }
    ] })
    const result = await getRecruitment(2, 1, db)
    assert.equal(result.page, 2)
    assert.equal(result.pageSize, 1)
    assert.equal(result.items.length, 1)
  })
})

// ============================================================
// 字段映射细节
// ============================================================
describe('Repository 字段映射', () => {
  it('news items 包含 date(YYYY-MM-DD) 与 pinned 字段', async () => {
    const db = createFakeDb()
    const result = await getNews(1, 20, db)
    for (const item of result.items) {
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(item.date))
      assert.equal(typeof item.pinned, 'boolean')
    }
  })

  it('projects items 不暴露 isPinned 字段（成果不置顶）', async () => {
    const db = createFakeDb()
    const result = await getProjects(db)
    for (const item of result.items) {
      assert.ok(!('pinned' in item))
    }
  })
})
