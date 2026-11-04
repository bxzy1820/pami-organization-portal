/**
 * JSON 字段读取与归一化
 * MySQL JSON 字段经 Prisma 读取后是对象，但导入手工 SQL 时可能是字符串，
 * 这里统一兜底，保证 Repository 返回值结构稳定。
 */

export function parseJson(value, fallback = null) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') {
    const text = value.trim()
    if (text === '') return fallback
    try {
      const parsed = JSON.parse(text)
      return parsed === null ? fallback : parsed
    } catch {
      return fallback
    }
  }
  return value
}

export function parseJsonArray(value) {
  const parsed = parseJson(value, [])
  return Array.isArray(parsed) ? parsed : []
}

export function parseStringArray(value) {
  return parseJsonArray(value).map((item) => (typeof item === 'string' ? item : String(item ?? '')).trim()).filter(Boolean)
}

export function parseRecord(value) {
  const parsed = parseJson(value, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

/** 统一空值：接口约定可空字段返回 '' 或 []，不返回 null */
export function text(value) {
  return typeof value === 'string' ? value : ''
}

/** 输出 YYYY-MM-DD，无效日期返回 '' */
export function dateOnly(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
