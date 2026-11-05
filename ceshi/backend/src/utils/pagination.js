// 分页归一化（与 API 契约 v1.0 对齐：size 默认 10，最大 50）
// ---------------------------------------------------------------------------

const MAX_SIZE = 50

/** 把入参归一化到 [1, MAX_SIZE] 范围，默认 page=1 size=10 */
export function normalizePagination(rawPage, rawSize) {
  const page = Math.max(1, Number(rawPage) || 1)
  let size = Number(rawSize) || 10
  size = Math.max(1, Math.min(size, MAX_SIZE))
  return { page, size }
}
