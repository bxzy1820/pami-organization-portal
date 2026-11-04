export { createCorsMiddleware, parseOrigins } from './cors.js'
export { createLogger } from './logger.js'
export { rules, paginationSchema, validateQuery, validateParams, validateBody } from './validate.js'
export { errorHandler, notFoundHandler, normalizeError } from './error-handler.js'

import { createCorsMiddleware } from './cors.js'
import { createLogger } from './logger.js'

/**
 * 通用中间件组合（CORS + 访问日志）
 * 用法（由李悦涵在 app.js 中接入）：
 *
 *   import { createCommonMiddleware, errorHandler, notFoundHandler } from './middleware/index.js'
 *   app.use(createCommonMiddleware())
 *   // ... routes ...
 *   app.use(notFoundHandler)
 *   app.use(errorHandler())
 */
export function createCommonMiddleware(options = {}) {
  return [createCorsMiddleware(options.cors), createLogger(options.logger)]
}
