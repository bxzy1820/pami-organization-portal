// JSON 字段归一化
// ---------------------------------------------------------------------------
// MySQL 的 JSON 字段在 Prisma 下通常返回对象，但某些连接串/驱动配置
// 可能返回原始字符串。所有读取都应走这里以保证拿到可用的对象。

/** 解析 JSON 字段；已是对象/数组则直接返回 */
export function parseJson(value) {
  if (value == null) return null
  if (typeof value === 'string') {
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return value
}

export function parseJsonArray(value) {
  const parsed = parseJson(value)
  return Array.isArray(parsed) ? parsed : []
}

/** 从可能为 JSON 的值里取给定 key 的字符串；不存在或类型不符返回 null */
export function parseText(value, key) {
  const obj = parseJson(value)
  if (obj && typeof obj === 'object' && typeof obj[key] === 'string') {
    return obj[key]
  }
  return null
}

/** 把 Date/ISO 字符串格式化为 YYYY-MM-DD；无效日期返回 null */
export function dateOnly(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 把 Date/ISO 字符串格式化为契约约定的 YYYY-MM-DD HH:mm:ss；无效日期返回空字符串 */
export function formatDateTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
         `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
