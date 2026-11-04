import { text } from '../utils/json.js'

export function createExternalLinkRepository(db) {
  async function listActive() {
    const rows = await db.externalLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }]
    })

    return rows.map((row) => ({
      label: text(row.label),
      desc: text(row.description),
      url: text(row.url),
      primary: Boolean(row.isPrimary)
    }))
  }

  /** 页头只展示主链接；没有主链接时返回 null */
  async function getPrimary() {
    const links = await listActive()
    return links.find((link) => link.primary) ?? null
  }

  return { listActive, getPrimary }
}
