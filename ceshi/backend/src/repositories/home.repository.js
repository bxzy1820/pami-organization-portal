import { parseJsonArray, parseRecord, text } from '../utils/json.js'

const SETTINGS_ID = 1

export function createHomeRepository(db) {
  /**
   * GET /api/v1/home
   * 只返回 hero 与 statement，栏目目录复用 /site 的 navigation。
   */
  async function getHome() {
    const settings = await db.siteSetting.findUnique({ where: { id: SETTINGS_ID } })
    if (!settings) return null

    const hero = parseRecord(settings.hero)
    const statement = parseRecord(settings.statement)

    return {
      hero: {
        titleLines: parseJsonArray(hero.titleLines).filter((line) => typeof line === 'string')
      },
      statement: {
        eyebrow: text(statement.eyebrow),
        lead: text(statement.lead),
        text: text(statement.text)
      }
    }
  }

  return { getHome }
}
