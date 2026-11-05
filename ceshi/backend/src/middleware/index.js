// 公共中间件集合
// ---------------------------------------------------------------------------
// createCommonMiddleware() 返回一个串联好的中间件，可直接 app.use()。

import corsMiddleware from './cors.js'
import loggerMiddleware from './logger.js'

/** 返回 CORS + 访问日志，不含 body parser（由服务层自行加 express.json()） */
export function createCommonMiddleware(options = {}) {
  return [
    corsMiddleware(options.cors),
    loggerMiddleware(options.logger)
  ]
}

export { default as corsMiddleware } from './cors.js'
export { default as loggerMiddleware } from './logger.js'
export { validateQuery, validateParams, validateBody, paginationSchema } from './validate.js'
export { errorHandler, notFoundHandler } from './error-handler.js'
