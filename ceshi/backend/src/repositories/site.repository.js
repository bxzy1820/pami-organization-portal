import { parseJsonArray, text } from '../utils/json.js'

const SETTINGS_ID = 1

/** 外部链接行 -> 接口结构 */
function toLinkItem(row) {
  return {
    label: text(row.label),
    desc: text(row.description),
    url: text(row.url),
    primary: Boolean(row.isPrimary)
  }
}

/** 导航项只保留合法结构，避免脏数据进入前端 */
function toNavItem(row) {
  if (!row || typeof row !== 'object') return null
  const label = text(row.label).trim()
  const to = text(row.to).trim()
  if (!label || !to) return null
  return { label, to }
}

export function createSiteRepository(db) {
  /** 原始站点配置行，供其他 Repository / 后台复用 */
  async function getSettings() {
    return db.siteSetting.findUnique({ where: { id: SETTINGS_ID } })
  }

  async function listActiveLinks() {
    return db.externalLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
    })
  }

  /**
   * GET /api/v1/site
   * 无配置行时返回 null，由 Controller 统一返回 40401 或空结构。
   */
  async function getSite() {
    const [settings, links] = await Promise.all([getSettings(), listActiveLinks()])
    if (!settings) return null

    return {
      name: text(settings.name),
      shortName: text(settings.shortName),
      brandSub: text(settings.brandSub),
      uscc: text(settings.uscc),
      region: text(settings.region),
      park: text(settings.park),
      address: text(settings.address),
      addressNote: text(settings.addressNote),
      slogan: text(settings.slogan),
      intro: text(settings.intro),
      contact: { email: text(settings.contactEmail) },
      navigation: parseJsonArray(settings.navigation).map(toNavItem).filter(Boolean),
      externalLinks: links.map(toLinkItem)
    }
  }

  return { getSettings, getSite, listActiveLinks }
}
