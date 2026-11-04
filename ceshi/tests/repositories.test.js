import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { createSiteRepository } from '../backend/src/repositories/site.repository.js'
import { createHomeRepository } from '../backend/src/repositories/home.repository.js'
import { createAboutRepository } from '../backend/src/repositories/about.repository.js'
import { createBusinessRepository } from '../backend/src/repositories/business.repository.js'
import { createPostRepository } from '../backend/src/repositories/post.repository.js'
import { createExternalLinkRepository } from '../backend/src/repositories/external-link.repository.js'
import { createMediaFileRepository } from '../backend/src/repositories/media-file.repository.js'
import { ApiError } from '../backend/src/utils/errors.js'
import {
  createFakeDb,
  createSettings,
  defaultDirections,
  defaultPosts,
  assertNoNullLeak
} from './helpers/fake-db.js'

describe('Repository: site', () => {
  it('返回契约字段，邮箱为空串，过滤未启用的外部链接', async () => {
    const db = createFakeDb()
    const site = await createSiteRepository(db).getSite()

    assert.equal(site.name, '雄安葩米科技有限公司')
    assert.equal(site.shortName, '葩米科技')
    assert.equal(site.contact.email, '')
    assert.deepEqual(site.navigation, [
      { label: '首页', to: '/' },
      { label: '关于我们', to: '/about' }
    ])

    // 只返回 is_active = true 的两条，且按 sort_order 升序
    assert.equal(site.externalLinks.length, 2)
    assert.equal(site.externalLinks[0].label, 'Skill 平台')
    assert.equal(site.externalLinks[0].primary, true)
    assert.equal(site.externalLinks[1].label, '雄安新区官网')
    assert.equal(site.externalLinks[1].primary, false)

    // 图片路径不进入公开接口（一期图片由前端静态资源管理）
    assert.equal('logoPath' in site, false)
    assert.equal('heroBgPath' in site, false)

    const linkCall = db.calls.find((call) => call.name === 'externalLink.findMany')
    assert.deepEqual(linkCall.args.where, { isActive: true })
    assert.deepEqual(linkCall.args.orderBy, [{ sortOrder: 'asc' }, { id: 'asc' }])
    assertNoNullLeak(site)
  })

  it('没有站点配置行时返回 null，交由图 B 统一处理 40401', async () => {
    const db = createFakeDb({ settings: null })
    assert.equal(await createSiteRepository(db).getSite(), null)
  })

  it('过滤结构不完整的导航项，避免脏数据进入前端', async () => {
    const db = createFakeDb({
      settings: createSettings({
        navigation: [{ label: '首页', to: '/' }, { label: '缺少路由' }, { to: '/empty' }, null]
      })
    })
    const site = await createSiteRepository(db).getSite()
    assert.deepEqual(site.navigation, [{ label: '首页', to: '/' }])
  })
})

describe('Repository: home', () => {
  it('返回 hero 与 statement，支持 MySQL JSON 字段为字符串的情况', async () => {
    const db = createFakeDb({
      settings: createSettings({
        hero: JSON.stringify({ titleLines: ['让人工智能', '在真实的产业里生长'] }),
        statement: JSON.stringify({ eyebrow: '关于葩米', lead: '首句', text: '正文' })
      })
    })
    const home = await createHomeRepository(db).getHome()

    assert.deepEqual(home.hero.titleLines, ['让人工智能', '在真实的产业里生长'])
    assert.deepEqual(home.statement, { eyebrow: '关于葩米', lead: '首句', text: '正文' })
    assertNoNullLeak(home)
  })

  it('JSON 字段损坏时降级为空数组与空串，而不是抛错', async () => {
    const db = createFakeDb({ settings: createSettings({ hero: '{bad json', statement: '[]' }) })
    const home = await createHomeRepository(db).getHome()

    assert.deepEqual(home.hero.titleLines, [])
    assert.deepEqual(home.statement, { eyebrow: '', lead: '', text: '' })
  })
})

describe('Repository: about', () => {
  it('返回关于我们全部结构，且不含成员个人资料', async () => {
    const db = createFakeDb()
    const about = await createAboutRepository(db).getAbout()

    assert.equal(about.mission.title, '我们的使命')
    assert.deepEqual(about.mission.lines, ['第一行', '第二行'])
    assert.equal(about.values.length, 1)
    assert.deepEqual(about.values[0].points, ['要点一', '要点二'])
    assert.equal(about.culture.quoteLead.length, 3)
    assert.equal(about.culture.quoteTeam[1], '协作方式')
    assert.equal(about.team.intro, '团队介绍')
    assert.deepEqual(about.journey.paragraphs, ['第一段', '第二段'])
    assert.deepEqual(about.place, { label: '办公地点', value: '雄安新区 · 人工智能产业园' })

    assert.equal('members' in about, false)
    assert.equal('teamFunctions' in about, false)
    assertNoNullLeak(about)
  })

  it('团队职能只返回 id/title/text/tags', async () => {
    const db = createFakeDb()
    const team = await createAboutRepository(db).getTeam()

    assert.equal(team.items.length, 1)
    assert.deepEqual(Object.keys(team.items[0]).sort(), ['id', 'tags', 'text', 'title'])
    assert.deepEqual(team.items[0].tags, ['算法研究'])
  })

  it('没有配置行时返回 null', async () => {
    const db = createFakeDb({ settings: null })
    assert.equal(await createAboutRepository(db).getAbout(), null)
  })
})

describe('Repository: business', () => {
  it('只返回启用的方向，按 sort_order 升序，并带上合作流程', async () => {
    const db = createFakeDb()
    const business = await createBusinessRepository(db).getBusiness()

    assert.deepEqual(business.items.map((item) => item.id), ['algorithm', 'solution'])
    assert.equal(business.items[0].title, '人工智能算法研究')
    assert.deepEqual(business.items[0].points, ['场景化模型研究', '算法效果评测', '工程化验证'])
    assert.deepEqual(business.cooperation, [{ title: '议题沟通', text: '说明' }])

    const call = db.calls.find((item) => item.name === 'businessDirection.findMany')
    assert.deepEqual(call.args.where, { isActive: true })
    assertNoNullLeak(business)
  })

  it('研究方向为空时返回空数组，合作流程仍可用', async () => {
    const db = createFakeDb({ directions: defaultDirections.filter((row) => !row.isActive) })
    const business = await createBusinessRepository(db).getBusiness()

    assert.deepEqual(business.items, [])
    assert.equal(business.cooperation.length, 1)
  })
})

describe('Repository: posts', () => {
  it('公告只返回 published，按发布时间倒序，日期格式为 YYYY-MM-DD', async () => {
    const db = createFakeDb()
    const news = await createPostRepository(db).getNews()

    assert.equal(news.total, 2)
    assert.equal(news.page, 1)
    assert.equal(news.pageSize, 20)
    assert.deepEqual(news.items.map((item) => item.title), ['公告一', '公告三'])
    assert.equal(news.items[0].date, '2026-11-02')
    assert.equal(news.items[0].cover, '')
    assert.deepEqual(news.items[0].tags, ['公开'])

    const call = db.calls.find((item) => item.name === 'post.findMany')
    assert.deepEqual(call.args.where, { type: 'announcement', status: 'published' })
    assert.equal(call.args.skip, 0)
    assert.equal(call.args.take, 20)
  })

  it('分页参数生效，pageSize 超过 100 时按 100 截断', async () => {
    const db = createFakeDb()
    const repo = createPostRepository(db)

    const second = await repo.getNews({ page: 2, pageSize: 1 })
    assert.equal(second.items.length, 1)
    assert.equal(second.items[0].title, '公告三')
    assert.equal(second.page, 2)

    const oversized = await repo.getNews({ pageSize: 999 })
    const call = db.calls.filter((item) => item.name === 'post.findMany').at(-1)
    assert.equal(call.args.take, 100)
    assert.equal(oversized.pageSize, 100)
  })

  it('非法文章类型抛出 40001，而不是静默返回空列表', async () => {
    const repo = createPostRepository(createFakeDb())
    await assert.rejects(
      () => repo.findPublishedByType('news', {}),
      (error) => error instanceof ApiError && error.code === 40001 && error.status === 400
    )
  })

  it('无已发布成果时返回 preparing 占位与栏目规划', async () => {
    const db = createFakeDb({ posts: defaultPosts.filter((post) => post.type !== 'achievement') })
    const projects = await createPostRepository(db).getProjects()

    assert.equal(projects.status, 'preparing')
    assert.deepEqual(projects.items, [])
    assert.equal(projects.title, '项目与成果')
    assert.equal(projects.empty, '正在整理中')
    assert.deepEqual(projects.plans, ['项目案例'])
  })

  it('有已发布成果时返回 online，并过滤 draft / offline', async () => {
    const db = createFakeDb()
    const projects = await createPostRepository(db).getProjects()

    assert.equal(projects.status, 'online')
    assert.deepEqual(projects.items.map((item) => item.title), ['成果一'])
    assert.equal(projects.items[0].cover, '/assets/projects/p1.webp')
  })

  it('招聘无正式内容时返回 preparing，有内容时返回 online', async () => {
    const emptyDb = createFakeDb({ posts: [] })
    const empty = await createPostRepository(emptyDb).getRecruitment()
    assert.equal(empty.status, 'preparing')
    assert.deepEqual(empty.items, [])
    assert.equal(empty.title, '加入我们')

    const online = await createPostRepository(createFakeDb()).getRecruitment()
    assert.equal(online.status, 'online')
    assert.equal(online.items.length, 1)
    assert.equal(online.total, 1)
  })
})

describe('Repository: external link / media file', () => {
  it('主链接取第一条 primary', async () => {
    const repo = createExternalLinkRepository(createFakeDb())
    const primary = await repo.getPrimary()
    assert.equal(primary.label, 'Skill 平台')
    assert.equal(await createExternalLinkRepository(createFakeDb({ links: [] })).getPrimary(), null)
  })

  it('媒体文件仅提供元数据读取，供后续扩展使用', async () => {
    const db = createFakeDb({
      mediaFiles: [{ id: 1, filename: 'logo.svg', path: '/assets/logo/logo.svg', mimeType: 'image/svg+xml', sizeBytes: 1200, kind: 'logo', createdAt: new Date('2026-11-01T00:00:00Z') }]
    })
    const repo = createMediaFileRepository(db)
    const items = await repo.list({ kind: 'logo' })
    assert.equal(items.length, 1)
    assert.equal(items[0].filename, 'logo.svg')
    assert.equal(items[0].createdAt, '2026-11-01')
    assert.equal(await repo.count(), 1)
  })
})
