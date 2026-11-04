import assert from 'node:assert/strict'

/** 站点配置行（贴近真实字段，值为测试用简化文案） */
export function createSettings(overrides = {}) {
  return {
    id: 1,
    name: '雄安葩米科技有限公司',
    shortName: '葩米科技',
    brandSub: '雄安新区 · 人工智能产业园',
    uscc: '91133100MAE65PXG4Q',
    region: '河北雄安新区',
    park: '雄安新区 · 人工智能产业园',
    address: '河北省雄安新区容城县启动区易宁大街164号创智园北区（人工智能产业园）4单元 F2-024',
    addressNote: '自主申报',
    slogan: '以人工智能技术，回应真实的产业问题',
    intro: '组织简介',
    contactEmail: null,
    logoPath: null,
    heroBgPath: '/hero-bg.svg',
    hero: { titleLines: ['让人工智能', '在真实的产业里生长'] },
    statement: { eyebrow: '关于葩米', lead: '首句', text: '正文' },
    mission: { title: '我们的使命', lines: ['第一行', '第二行'], text: '使命正文' },
    culture: {
      title: '我们的文化',
      intro: '文化介绍',
      quoteLead: ['我们把「', '行事准则', '」作为对每位成员的要求。'],
      quoteTeam: ['「', '协作方式', '」说明我们如何把事做成。']
    },
    values: [{ title: '技术务实', text: '说明', points: ['要点一', '要点二'] }],
    collaboration: [{ title: '明确目标', text: '说明' }],
    cooperation: [{ title: '议题沟通', text: '说明' }],
    team: { title: '团队', intro: '团队介绍' },
    teamFunctions: [{ id: 'research', title: '算法与研究', text: '说明', tags: ['算法研究'] }],
    journey: { titleLines: ['我们的', '路径'], paragraphs: ['第一段', '第二段'] },
    place: { label: '办公地点', value: '雄安新区 · 人工智能产业园' },
    navigation: [
      { label: '首页', to: '/' },
      { label: '关于我们', to: '/about' }
    ],
    projectsSection: { title: '项目与成果', description: '说明', empty: '正在整理中', plans: ['项目案例'] },
    recruitmentSection: { title: '加入我们', description: '说明', empty: '正在整理中' },
    updatedAt: new Date('2026-11-04T00:00:00+08:00'),
    ...overrides
  }
}

export const defaultDirections = [
  {
    id: 1,
    code: 'algorithm',
    title: '人工智能算法研究',
    summary: '摘要一',
    points: ['场景化模型研究', '算法效果评测', '工程化验证'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 2,
    code: 'solution',
    title: '行业智能化方案探索',
    summary: '摘要二',
    points: ['场景与需求梳理', '方案设计与验证', '落地实施与维护'],
    sortOrder: 2,
    isActive: true
  },
  {
    id: 3,
    code: 'hidden',
    title: '隐藏方向',
    summary: '不应返回',
    points: [],
    sortOrder: 3,
    isActive: false
  }
]

export const defaultLinks = [
  {
    id: 1,
    label: 'Skill 平台',
    description: '组织的技能与能力平台',
    url: 'http://124.223.224.129:8080/',
    isPrimary: true,
    sortOrder: 1,
    isActive: true
  },
  {
    id: 2,
    label: '雄安新区官网',
    description: '雄安新区官方信息发布平台',
    url: 'https://www.xiongan.gov.cn/',
    isPrimary: false,
    sortOrder: 2,
    isActive: true
  },
  {
    id: 3,
    label: '隐藏链接',
    description: '不应返回',
    url: 'https://example.invalid/',
    isPrimary: false,
    sortOrder: 3,
    isActive: false
  }
]

export const defaultPosts = [
  {
    id: 1,
    slug: 'news-1',
    type: 'announcement',
    title: '公告一',
    summary: '摘要一',
    content: '正文',
    coverPath: null,
    tags: ['公开'],
    status: 'published',
    publishedAt: new Date('2026-11-02T02:00:00.000Z'),
    sortOrder: 0
  },
  {
    id: 2,
    slug: 'news-2-draft',
    type: 'announcement',
    title: '公告二（草稿）',
    summary: '不应返回',
    content: '正文',
    coverPath: null,
    tags: null,
    status: 'draft',
    publishedAt: null,
    sortOrder: 0
  },
  {
    id: 3,
    slug: 'achievement-1',
    type: 'achievement',
    title: '成果一',
    summary: '摘要',
    content: '正文',
    coverPath: '/assets/projects/p1.webp',
    tags: ['成果'],
    status: 'published',
    publishedAt: new Date('2026-11-01T02:00:00.000Z'),
    sortOrder: 1
  },
  {
    id: 4,
    slug: 'achievement-2-offline',
    type: 'achievement',
    title: '成果二（已下线）',
    summary: '不应返回',
    content: '正文',
    coverPath: null,
    tags: null,
    status: 'offline',
    publishedAt: new Date('2026-10-20T02:00:00.000Z'),
    sortOrder: 0
  },
  {
    id: 5,
    slug: 'recruitment-1',
    type: 'recruitment',
    title: '招聘一',
    summary: '摘要',
    content: '正文',
    coverPath: null,
    tags: null,
    status: 'published',
    publishedAt: new Date('2026-11-03T02:00:00.000Z'),
    sortOrder: 0
  },
  {
    id: 6,
    slug: 'news-3',
    type: 'announcement',
    title: '公告三',
    summary: '摘要三',
    content: '正文',
    coverPath: null,
    tags: null,
    status: 'published',
    publishedAt: new Date('2026-11-01T02:00:00.000Z'),
    sortOrder: 0
  }
]

const DATE_FIELDS = new Set(['publishedAt', 'createdAt', 'updatedAt'])

function normalizeOrderBy(orderBy) {
  if (!orderBy) return []
  const list = Array.isArray(orderBy) ? orderBy : [orderBy]
  return list.map((spec) => (typeof spec === 'string' ? [spec, 'asc'] : Object.entries(spec)[0]))
}

function orderRows(rows, orderBy) {
  const specs = normalizeOrderBy(orderBy)
  if (specs.length === 0) return [...rows]

  return [...rows].sort((left, right) => {
    for (const [key, direction] of specs) {
      const a = left[key]
      const b = right[key]
      if (a === b) continue
      if (a === null || a === undefined) return 1
      if (b === null || b === undefined) return -1

      let diff
      if (DATE_FIELDS.has(key) || a instanceof Date || b instanceof Date) diff = new Date(a) - new Date(b)
      else if (typeof a === 'number' && typeof b === 'number') diff = a - b
      else diff = String(a).localeCompare(String(b))

      if (diff !== 0) return direction === 'desc' ? -diff : diff
    }
    return 0
  })
}

function matchesWhere(row, where) {
  if (!where) return true
  return Object.entries(where).every(([key, expected]) => row[key] === expected)
}

/**
 * 内存版 Prisma 客户端：只实现 Repository 用到的方法，
 * 并记录调用参数，便于断言 where / orderBy / 分页是否正确。
 */
export function createFakeDb({
  settings = createSettings(),
  directions = defaultDirections,
  links = defaultLinks,
  posts = defaultPosts,
  mediaFiles = []
} = {}) {
  const calls = []

  function record(name, args) {
    calls.push({ name, args })
  }

  return {
    calls,
    siteSetting: {
      findUnique: async (args) => {
        record('siteSetting.findUnique', args)
        return settings ? { ...settings } : null
      }
    },
    businessDirection: {
      findMany: async (args = {}) => {
        record('businessDirection.findMany', args)
        return orderRows(directions.filter((row) => matchesWhere(row, args.where)), args.orderBy)
      }
    },
    externalLink: {
      findMany: async (args = {}) => {
        record('externalLink.findMany', args)
        return orderRows(links.filter((row) => matchesWhere(row, args.where)), args.orderBy)
      }
    },
    post: {
      count: async (args = {}) => {
        record('post.count', args)
        return posts.filter((row) => matchesWhere(row, args.where)).length
      },
      findMany: async (args = {}) => {
        record('post.findMany', args)
        const rows = orderRows(posts.filter((row) => matchesWhere(row, args.where)), args.orderBy)
        const skip = args.skip ?? 0
        const take = args.take ?? rows.length
        return rows.slice(skip, skip + take)
      }
    },
    mediaFile: {
      findMany: async (args = {}) => {
        record('mediaFile.findMany', args)
        return mediaFiles.filter((row) => matchesWhere(row, args.where)).slice(0, args.take ?? mediaFiles.length)
      },
      count: async (args = {}) => mediaFiles.filter((row) => matchesWhere(row, args.where)).length
    }
  }
}

export function assertNoNullLeak(value, path = 'data') {
  if (value === null) assert.fail(`${path} 不应返回 null`)
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoNullLeak(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) assertNoNullLeak(child, `${path}.${key}`)
  }
}
