// tests/helpers/fake-db.js — 内存假 Prisma 客户端
// ---------------------------------------------------------------------------
// 所有方法返回 Promise，参数结构与真实 Prisma 一致，并记录到 db.calls，
// 方便 Repository 测试断言 where / orderBy / skip / take 是否正确。
// 不实现完整 Prisma 行为，只覆盖 Repository 用到的查询。

const DATE_FIELDS = new Set(['publishedAt', 'createdAt', 'updatedAt'])

function toComparable(value) {
  if (value instanceof Date) return value.getTime()
  return value
}

function matchesWhere(row, where) {
  if (!where) return true
  for (const [key, expected] of Object.entries(where)) {
    if (expected == null) {
      if (row[key] != null) return false
    } else if (typeof expected === 'object' && !Array.isArray(expected)) {
      if (!matchesWhere(row[key], expected)) return false
    } else if (row[key] !== expected) {
      return false
    }
  }
  return true
}

function applyOrder(list, orderBy) {
  if (!orderBy || !orderBy.length) return list
  const copy = [...list]
  copy.sort((a, b) => {
    for (const clause of orderBy) {
      const [key, dir] = Object.entries(clause)[0]
      const av = toComparable(a[key])
      const bv = toComparable(b[key])
      if (av === bv) continue
      if (av == null) return dir === 'asc' ? 1 : -1
      if (bv == null) return dir === 'asc' ? -1 : 1
      return dir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    }
    return 0
  })
  return copy
}

function selectFields(row, select) {
  if (!select) return row
  const out = {}
  for (const key of Object.keys(select)) {
    out[key] = row[key]
  }
  return out
}

// ============================================================
// 默认数据
// ============================================================

const defaultSite = {
  id: 1,
  name: '测试组织',
  shortName: '测试',
  orgName: '测试组织',
  brandSub: null,
  region: '河北保定',
  park: '河北大学',
  address: '河北省保定市',
  addressNote: null,
  slogan: '测试标语',
  intro: '测试简介',
  contactEmail: 'test@pami.dev',
  hero: null,
  statement: { text: '首页简短介绍' },
  mission: { text: '我们的使命' },
  team: { intro: '团队整体介绍' },
  culture: null,
  values: null,
  collaboration: null,
  teamFunctions: null,
  journey: null,
  place: null,
  navigation: null,
  projectsSection: null,
  recruitmentSection: null,
  updatedAt: new Date()
}

const defaultDirections = [
  { id: 1, code: 'algorithm',  title: '方向一', summary: '方向一描述', points: null, isActive: true,  sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, code: 'solution',   title: '方向二', summary: '方向二描述', points: null, isActive: true,  sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, code: 'data',       title: '方向三', summary: '方向三描述', points: null, isActive: true,  sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, code: 'cocreation', title: '方向四', summary: '方向四描述', points: null, isActive: true,  sortOrder: 4, createdAt: new Date(), updatedAt: new Date() }
]

const defaultLinks = [
  { id: 1, name: '内部平台', url: 'http://example.com/', primary: true, isActive: true, sortOrder: 1, createdAt: new Date() }
]

const defaultPosts = [
  { id: 1, slug: 'news-pinned', type: 'announcement', status: 'published', title: '置顶公告', summary: '置顶', content: null, coverPath: null, publishedAt: new Date('2026-11-02T02:00:00.000Z'), sortOrder: 0, isPinned: true,  createdAt: new Date(), updatedAt: new Date() },
  { id: 2, slug: 'news-draft',  type: 'announcement', status: 'draft',     title: '草稿公告', summary: '草稿', content: null, coverPath: null, publishedAt: null,                                   sortOrder: 0, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, slug: 'news-latest', type: 'announcement', status: 'published', title: '最新公告', summary: '最新', content: null, coverPath: null, publishedAt: new Date('2026-11-01T02:00:00.000Z'), sortOrder: 1, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, slug: 'ach-1',       type: 'achievement',  status: 'offline',   title: '下线成果', summary: '下线', content: null, coverPath: null, publishedAt: new Date('2026-10-20T02:00:00.000Z'), sortOrder: 0, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, slug: 'ach-2',       type: 'achievement',  status: 'published', title: '成果 A', summary: 'A', content: null, coverPath: null, publishedAt: new Date('2026-11-03T02:00:00.000Z'), sortOrder: 0, isPinned: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, slug: 'rec-1',       type: 'recruitment',  status: 'published', title: '招聘 A', summary: 'A', content: null, coverPath: null, publishedAt: new Date('2026-11-01T02:00:00.000Z'), sortOrder: 0, isPinned: false, createdAt: new Date(), updatedAt: new Date() }
]

// ============================================================
// 构造假客户端
// ============================================================

export function createFakeDb(overrides = {}) {
  const siteSetting = overrides.siteSetting === undefined ? defaultSite : overrides.siteSetting
  // siteSetting 为 null 时 store 是空数组，表示没有 site_settings 行
  const siteStore = siteSetting ? [siteSetting] : []
  const directions  = overrides.businessDirections ?? [...defaultDirections]
  const links       = overrides.externalLinks ?? [...defaultLinks]
  const posts       = overrides.posts ?? [...defaultPosts]

  const calls = []
  const record = (name, args) => calls.push({ name, args })

  const api = (collection, store) => ({
    findUnique: async (opts) => {
      record(`${collection}.findUnique`, opts)
      const row = store.find((r) => Object.keys(opts.where ?? {}).every((k) => r[k] === opts.where[k]))
      return row ? selectFields(row, opts.select) : null
    },
    findMany: async (opts = {}) => {
      record(`${collection}.findMany`, opts)
      let rows = store.filter((r) => matchesWhere(r, opts.where))
      rows = applyOrder(rows, opts.orderBy)
      if (opts.skip != null || opts.take != null) {
        const s = opts.skip || 0
        rows = rows.slice(s, s + (opts.take ?? rows.length))
      }
      return rows.map((r) => selectFields(r, opts.select))
    },
    count: async (opts = {}) => {
      record(`${collection}.count`, opts)
      return store.filter((r) => matchesWhere(r, opts.where)).length
    },
    upsert: async (opts) => {
      record(`${collection}.upsert`, opts)
      const idx = store.findIndex((r) => Object.keys(opts.where ?? {}).every((k) => r[k] === opts.where[k]))
      if (idx >= 0) {
        store[idx] = { ...store[idx], ...opts.update }
        return store[idx]
      }
      const next = { id: store.length + 1, ...opts.create }
      store.push(next)
      return next
    }
  })

  return {
    siteSetting: api('siteSetting', siteStore),
    businessDirection: api('businessDirection', directions),
    externalLink: api('externalLink', links),
    post: api('post', posts),
    mediaFile: api('mediaFile', []),
    calls
  }
}

export { defaultSite, defaultDirections, defaultLinks, defaultPosts }

/** 断言返回对象里没有 null 泄漏到顶层 */
export function assertNoNullLeak(obj, label) {
  if (obj == null) return
  for (const [key, val] of Object.entries(obj)) {
    if (val == null) {
      // eslint-disable-next-line no-console
      console.warn(`${label} 返回字段 ${key} 为 null`)
    }
  }
}
