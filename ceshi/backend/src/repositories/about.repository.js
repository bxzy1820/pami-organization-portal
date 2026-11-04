import { parseJsonArray, parseRecord, parseStringArray, text } from '../utils/json.js'

const SETTINGS_ID = 1

function toValueItem(row) {
  const item = parseRecord(row)
  return {
    title: text(item.title),
    text: text(item.text),
    points: parseStringArray(item.points)
  }
}

function toCollaborationItem(row) {
  const item = parseRecord(row)
  return { title: text(item.title), text: text(item.text) }
}

function toTeamFunction(row) {
  const item = parseRecord(row)
  return {
    id: text(item.id),
    title: text(item.title),
    text: text(item.text),
    tags: parseStringArray(item.tags)
  }
}

export function createAboutRepository(db) {
  async function getSettings() {
    return db.siteSetting.findUnique({ where: { id: SETTINGS_ID } })
  }

  /**
   * GET /api/v1/about
   * 一期只展示组织级信息与团队整体介绍，不返回任何成员个人资料。
   */
  async function getAbout() {
    const settings = await getSettings()
    if (!settings) return null

    const mission = parseRecord(settings.mission)
    const culture = parseRecord(settings.culture)
    const team = parseRecord(settings.team)
    const journey = parseRecord(settings.journey)
    const place = parseRecord(settings.place)

    return {
      mission: {
        title: text(mission.title) || '我们的使命',
        lines: parseStringArray(mission.lines),
        text: text(mission.text)
      },
      culture: {
        title: text(culture.title) || '我们的文化',
        intro: text(culture.intro),
        quoteLead: parseStringArray(culture.quoteLead),
        quoteTeam: parseStringArray(culture.quoteTeam)
      },
      values: parseJsonArray(settings.values).map(toValueItem),
      collaboration: parseJsonArray(settings.collaboration).map(toCollaborationItem),
      team: {
        title: text(team.title) || '团队',
        intro: text(team.intro)
      },
      journey: {
        titleLines: parseStringArray(journey.titleLines),
        paragraphs: parseStringArray(journey.paragraphs)
      },
      place: {
        label: text(place.label),
        value: text(place.value)
      }
    }
  }

  /**
   * GET /api/v1/about/team
   * 仅返回职能维度，不含姓名、头像、个人联系方式。
   */
  async function getTeam() {
    const settings = await getSettings()
    if (!settings) return null
    return {
      items: parseJsonArray(settings.teamFunctions).map(toTeamFunction)
    }
  }

  return { getAbout, getTeam }
}
