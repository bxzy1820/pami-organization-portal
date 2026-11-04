import { parseJsonArray, parseRecord, parseStringArray, text } from '../utils/json.js'

const SETTINGS_ID = 1

export function createBusinessRepository(db) {
  /**
   * GET /api/v1/business
   * 只返回 is_active = true 的方向，按 sort_order 升序；合作流程来自站点配置。
   */
  async function getBusiness() {
    const [settings, directions] = await Promise.all([
      db.siteSetting.findUnique({ where: { id: SETTINGS_ID } }),
      db.businessDirection.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
      })
    ])

    return {
      items: directions.map((row) => ({
        id: text(row.code),
        title: text(row.title),
        summary: text(row.summary),
        points: parseStringArray(row.points)
      })),
      cooperation: parseJsonArray(settings?.cooperation).map((raw) => {
        const item = parseRecord(raw)
        return { title: text(item.title), text: text(item.text) }
      })
    }
  }

  return { getBusiness }
}
