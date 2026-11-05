// 分页归一化
// ---------------------------------------------------------------------------

const MAX_PAGE_SIZE = 100

/** 把入参归一化到 [1, MAX_PAGE_SIZE] 范围，默认 page=1 pageSize=20 */
export function normalizePagination(rawPage, rawPageSize) {
  const page = Math.max(1, Number(rawPage) || 1)
  let pageSize = Number(rawPageSize) || 20
  pageSize = Math.max(1, Math.min(pageSize, MAX_PAGE_SIZE))
  return { page, pageSize }
}
