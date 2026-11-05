// 统一错误处理
// ---------------------------------------------------------------------------
// 使用：app.use(errorHandler({ logger }))
// 最后一个中间件，捕获所有 throw 和 next(err)。

import { ApiError, ERROR_CODES } from '../utils/errors.js'

function mapPrismaError(err) {
  if (err?.code === 'P2025') {
    return new ApiError({ code: ERROR_CODES.NOT_FOUND, message: '资源不存在', status: 404 })
  }
  if (err?.code === 'P2002') {
    return new ApiError({ code: ERROR_CODES.BAD_REQUEST, message: '数据已存在', status: 400 })
  }
  return null
}

export function errorHandler(options = {}) {
  const logger = options.logger || console
  return function error(err, _req, res, _next) {
    let mapped = err
    if (!(mapped instanceof ApiError)) {
      const prisma = mapPrismaError(err)
      if (prisma) {
        mapped = prisma
      } else {
        logger?.error?.('Unhandled error:', err?.message || err)
        mapped = new ApiError({ code: ERROR_CODES.SERVER, message: '服务器内部错误', status: 500 })
      }
    }

    res.statusCode = mapped.status || 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({
      code: mapped.code,
      message: mapped.message,
      data: null
    }))
  }
}

export function notFoundHandler(req, res) {
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({ code: ERROR_CODES.NOT_FOUND, message: `路径不存在: ${req.method} ${req.url}`, data: null }))
}

export default errorHandler
