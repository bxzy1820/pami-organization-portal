import { ApiError, ERROR_CODES } from '../utils/errors.js'

/** 未匹配到任何路由时统一走 40401，而不是 Express 默认 HTML 错误页 */
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`接口不存在：${req.method} ${req.originalUrl ?? req.url ?? ''}`))
}

/** Prisma 常见错误 -> HTTP / 业务错误码 */
const PRISMA_ERROR_MAP = {
  P2000: [400, ERROR_CODES.BAD_REQUEST, '字段内容过长'],
  P2002: [400, ERROR_CODES.BAD_REQUEST, '数据唯一约束冲突'],
  P2003: [400, ERROR_CODES.BAD_REQUEST, '关联数据不存在'],
  P2025: [404, ERROR_CODES.NOT_FOUND, '记录不存在'],
  P1001: [500, ERROR_CODES.SERVER_ERROR, '数据库连接失败'],
  P1017: [500, ERROR_CODES.SERVER_ERROR, '数据库连接已断开']
}

/**
 * 把任意异常归一化为 ApiError
 * - 业务异常：原样返回
 * - Prisma 异常：按错误码映射
 * - JSON 解析失败：40001
 * - 其他：50000，且不把内部堆栈返回给调用方
 */
export function normalizeError(err) {
  if (err instanceof ApiError) return err

  if (typeof err?.code === 'string' && PRISMA_ERROR_MAP[err.code]) {
    const [status, code, message] = PRISMA_ERROR_MAP[err.code]
    return new ApiError(status, code, message, { prismaCode: err.code })
  }

  if (err?.type === 'entity.parse.failed') {
    return ApiError.badRequest('请求体不是合法的 JSON')
  }

  return ApiError.serverError()
}

/**
 * 统一错误处理中间件
 * 返回格式：{ code, message, data: null }（与 API 契约一致）
 */
export function errorHandler({ logger = console } = {}) {
  return function handleError(err, req, res, next) {
    const normalized = normalizeError(err)

    if (normalized.status >= 500) {
      logger.error?.(`[${req.method ?? ''} ${req.originalUrl ?? req.url ?? ''}]`, err)
    }

    if (res.headersSent) return next(err)

    const body = { code: normalized.code, message: normalized.message, data: null }
    if (normalized.details) body.details = normalized.details
    res.status(normalized.status).json(body)
  }
}
