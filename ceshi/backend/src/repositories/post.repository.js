import { parseStringArray, parseRecord, text, dateOnly } from '../utils/json.js'
import { normalizePagination } from '../utils/pagination.js'
import { ApiError } from '../utils/errors.js'

const SETTINGS_ID = 1

export const POST_TYPES = Object.freeze(['announcement', 'achievement', 'recruitment'])
export const POST_STATUSES = Object.freeze(['draft', 'published', 'offline'])

/** 公开接口只允许查询这三种文章类型，避免拼错类型时静默返回空列表 */
function assertPostType(type) {
  if (!POST_TYPES.includes(type)) {
    throw ApiError.badRequest(`不支持的文章类型：${type}`, { field: 'type', allowed: [...POST_TYPES] })
  }
}

function toListItem(row) {
  return {
    id: row.id,
    title: text(row.title),
    summary: text(row.summary),
    cover: text(row.coverPath),
    tags: parseStringArray(row.tags),
    date: dateOnly(row.publishedAt)
  }
}

export function createPostRepository(db) {
  /**
   * 按类型查询已发布文章（分页）
   * 公开接口固定 status = published，draft / offline 一律不返回。
   */
  async function findPublishedByType(type, options = {}) {
    assertPostType(type)
    const { page, pageSize, skip, take } = normalizePagination(options)
    const where = { type, status: 'published' }

    const [total, rows] = await Promise.all([
      db.post.count({ where }),
      db.post.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { sortOrder: 'asc' }, { id: 'desc' }],
        skip,
        take
      })
    ])

    return { items: rows.map(toListItem), total, page, pageSize }
  }

  /** GET /api/v1/news */
  async function getNews(options = {}) {
    return findPublishedByType('announcement', options)
  }

  /**
   * GET /api/v1/projects
   * 有已发布成果时 status = online，否则返回 preparing 占位信息。
   */
  async function getProjects() {
    const [settings, rows] = await Promise.all([
      db.siteSetting.findUnique({ where: { id: SETTINGS_ID } }),
      db.post.findMany({
        where: { type: 'achievement', status: 'published' },
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'desc' }]
      })
    ])

    const section = parseRecord(settings?.projectsSection)

    return {
      status: rows.length > 0 ? 'online' : 'preparing',
      title: text(section.title) || '项目与成果',
      description: text(section.description),
      empty: text(section.empty) || '内容正在整理中，确认后在此发布。',
      plans: parseStringArray(section.plans),
      items: rows.map(toListItem)
    }
  }

  /**
   * GET /api/v1/recruitment
   * 无正式岗位时返回 preparing 与空列表，前端展示“内容正在整理中”。
   */
  async function getRecruitment(options = {}) {
    const [settings, list] = await Promise.all([
      db.siteSetting.findUnique({ where: { id: SETTINGS_ID } }),
      findPublishedByType('recruitment', options)
    ])

    const section = parseRecord(settings?.recruitmentSection)

    return {
      status: list.items.length > 0 ? 'online' : 'preparing',
      title: text(section.title) || '加入我们',
      description: text(section.description),
      empty: text(section.empty) || '内容正在整理中，确认后在此发布。',
      ...list
    }
  }

  return { findPublishedByType, getNews, getProjects, getRecruitment }
}
