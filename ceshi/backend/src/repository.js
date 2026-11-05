// 数据访问层 —— 冻结接口（v1.1）
// ---------------------------------------------------------------------------
// 本文件是服务层唯一的 Repository 引入点，函数签名与返回结构与后端冻结的
// mockRepository.js 完全一致。验收时只需把服务层的 import 从 mock 改到
// 这里即可，业务代码不需要任何改动。
//
// 所有查询在数据库侧完成过滤、排序与分页，不允许查全表后内存处理。

import { parseText, dateOnly } from './utils/json.js'
import { normalizePagination } from './utils/pagination.js'

// ============================================================
// 排序规则（数据层完成，不允许内存排序）
// ============================================================

const ORDER_BY = Object.freeze({
  announcement: [
    { isPinned: 'desc' },
    { publishedAt: 'desc' },
    { sortOrder: 'asc' },
    { id: 'desc' }
  ],
  achievement: [
    { sortOrder: 'asc' },
    { publishedAt: 'desc' },
    { id: 'desc' }
  ],
  recruitment: [
    { sortOrder: 'asc' },
    { publishedAt: 'desc' },
    { id: 'desc' }
  ]
})

// ============================================================
// 内部工具
// ============================================================

// 动态懒加载 Prisma 单例——ESM 不允许 require，且顶层 import 会在测试里触发
// @prisma/client 模块缺失错误。测试环境全注入 fake-db 时永远不会进入这里。
async function pickDb(db) {
  if (db) return db
  const mod = await import('./prisma/client.js')
  return mod.getPrisma()
}

function buildContact(site) {
  return {
    email: site.contactEmail || '',
    // 地址字段在 Prisma 存的是 region/park/address 三栏，对外按 mock 冻结接口返回单一 address 字符串
    address: site.address || ''
  }
}

function pickMissionText(missionJson) {
  if (!missionJson) return ''
  if (typeof missionJson === 'string') {
    try { missionJson = JSON.parse(missionJson) } catch { return missionJson }
  }
  if (missionJson && typeof missionJson === 'object') {
    if (typeof missionJson.text === 'string') return missionJson.text
    if (Array.isArray(missionJson.lines)) return missionJson.lines.join('')
  }
  return ''
}

function pickTeamIntro(teamJson) {
  if (!teamJson) return ''
  if (typeof teamJson === 'string') {
    try { teamJson = JSON.parse(teamJson) } catch { return teamJson }
  }
  if (teamJson && typeof teamJson === 'object' && typeof teamJson.intro === 'string') {
    return teamJson.intro
  }
  return ''
}

function pickBriefIntro(statementJson, siteIntro) {
  const fromStmt = parseText(statementJson, 'text')
  if (fromStmt) return fromStmt
  return siteIntro || ''
}

// ============================================================
// Repository 接口（v1.1 冻结签名）
// ============================================================

/**
 * 获取站点基础信息
 * 对应表：site_settings + external_links
 */
export async function getSite(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  if (!site) return null

  const links = await prisma.externalLink.findMany({
    where: { isActive: true },
    orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    select: { name: true, url: true }
  })

  return {
    orgName: site.name,
    orgShortName: site.shortName || '',
    intro: site.intro || '',
    mission: pickMissionText(site.mission),
    teamIntro: pickTeamIntro(site.team),
    contact: buildContact(site),
    externalLinks: links
  }
}

/**
 * 获取首页内容
 * 对应表：site_settings + business_directions
 */
export async function getHome(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  const directions = await prisma.businessDirection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { title: true, summary: true }
  })

  return {
    orgName: site?.name || '',
    slogan: site?.slogan || '',
    briefIntro: pickBriefIntro(site?.statement, site?.intro),
    directions: directions.map((d) => ({ title: d.title, desc: d.summary || '' }))
  }
}

/**
 * 获取关于我们
 * 对应表：site_settings
 */
export async function getAbout(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  if (!site) return { intro: '', mission: '', teamIntro: '', contact: { email: '', address: '' } }

  return {
    intro: site.intro || '',
    mission: pickMissionText(site.mission),
    teamIntro: pickTeamIntro(site.team),
    contact: buildContact(site)
  }
}

/**
 * 获取研究方向列表
 * 对应表：business_directions
 */
export async function getBusiness(db) {
  const prisma = await pickDb(db)
  const directions = await prisma.businessDirection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { title: true, summary: true }
  })

  return {
    list: directions.map((d) => ({ title: d.title, desc: d.summary || '' }))
  }
}

/**
 * 获取项目成果列表
 * 对应表：posts (type = achievement, status = published)
 * 排序：sort_order 优先，发布时间倒序
 */
export async function getProjects(db) {
  const prisma = await pickDb(db)
  const list = await prisma.post.findMany({
    where: { type: 'achievement', status: 'published' },
    orderBy: ORDER_BY.achievement,
    select: { title: true, summary: true, slug: true, publishedAt: true }
  })

  const items = list.map((p) => ({
    title: p.title,
    desc: p.summary || '',
    date: dateOnly(p.publishedAt),
    slug: p.slug
  }))

  return {
    items,
    total: items.length,
    page: 1,
    pageSize: 20
  }
}

/**
 * 获取公告动态列表（分页）
 * 对应表：posts (type = announcement, status = published)
 * 排序：置顶优先，发布时间倒序
 * 分页在数据库侧完成，不允许查全表后内存分页
 */
export async function getNews(page = 1, pageSize = 20, db) {
  const prisma = await pickDb(db)
  const { page: p, pageSize: ps } = normalizePagination(page, pageSize)

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { type: 'announcement', status: 'published' } }),
    prisma.post.findMany({
      where: { type: 'announcement', status: 'published' },
      orderBy: ORDER_BY.announcement,
      skip: (p - 1) * ps,
      take: ps,
      select: { title: true, summary: true, slug: true, publishedAt: true, isPinned: true }
    })
  ])

  const items = rows.map((r) => ({
    title: r.title,
    desc: r.summary || '',
    date: dateOnly(r.publishedAt),
    slug: r.slug,
    pinned: r.isPinned
  }))

  return { items, total, page: p, pageSize: ps }
}

/**
 * 获取招聘列表（分页）
 * 对应表：posts (type = recruitment, status = published)
 * 排序：sort_order 优先，发布时间倒序
 * 分页在数据库侧完成
 */
export async function getRecruitment(page = 1, pageSize = 20, db) {
  const prisma = await pickDb(db)
  const { page: p, pageSize: ps } = normalizePagination(page, pageSize)

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { type: 'recruitment', status: 'published' } }),
    prisma.post.findMany({
      where: { type: 'recruitment', status: 'published' },
      orderBy: ORDER_BY.recruitment,
      skip: (p - 1) * ps,
      take: ps,
      select: { title: true, summary: true, slug: true, publishedAt: true }
    })
  ])

  const items = rows.map((r) => ({
    title: r.title,
    desc: r.summary || '',
    date: dateOnly(r.publishedAt),
    slug: r.slug
  }))

  return { items, total, page: p, pageSize: ps }
}
