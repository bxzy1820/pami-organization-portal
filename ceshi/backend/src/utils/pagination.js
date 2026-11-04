/**
 * 分页参数归一化
 * page 默认 1，pageSize 默认 20、最大 100，与 API 契约一致。
 */
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function normalizePagination(input = {}) {
  const page = toPositiveInt(input.page, 1)
  const pageSize = Math.min(toPositiveInt(input.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize
  }
}
