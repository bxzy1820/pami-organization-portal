import { text, dateOnly } from '../utils/json.js'

/**
 * 媒体文件元数据（一期预留）
 * 一期图片全部作为前端静态资源，本 Repository 只负责读取元数据，
 * 不参与公开接口，也不返回图片二进制。
 */
function toItem(row) {
  return {
    id: row.id,
    filename: text(row.filename),
    path: text(row.path),
    mimeType: text(row.mimeType),
    sizeBytes: row.sizeBytes ?? 0,
    kind: text(row.kind),
    createdAt: dateOnly(row.createdAt)
  }
}

export function createMediaFileRepository(db) {
  async function list({ kind = null, limit = 20 } = {}) {
    const rows = await db.mediaFile.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { id: 'desc' },
      take: limit
    })
    return rows.map(toItem)
  }

  async function count({ kind = null } = {}) {
    return db.mediaFile.count({ where: kind ? { kind } : undefined })
  }

  return { list, count }
}
