const DEFAULT_ORIGIN = 'http://localhost:5173'

/** 读取 CORS_ORIGIN（逗号分隔），未配置时回退到本地前端地址 */
export function parseOrigins(value = process.env.CORS_ORIGIN) {
  return String(value ?? DEFAULT_ORIGIN)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 跨域中间件（白名单方式）
 * - 只回显白名单内的 Origin，未命中时不返回 Access-Control-Allow-Origin
 * - 无 Origin 的请求（如服务端调用、curl）直接放行
 * - OPTIONS 预检直接返回 204
 */
export function createCorsMiddleware({
  origins = parseOrigins(),
  allowMethods = ['GET', 'POST', 'OPTIONS'],
  allowHeaders = 'Content-Type, Accept, X-Site-Token'
} = {}) {
  const allowList = new Set(origins)

  return function corsMiddleware(req, res, next) {
    const origin = req.headers?.origin

    if (typeof res.setHeader === 'function') {
      res.setHeader('Vary', 'Origin')
      if (origin && allowList.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Methods', allowMethods.join(', '))
        res.setHeader('Access-Control-Allow-Headers', allowHeaders)
        res.setHeader('Access-Control-Max-Age', '600')
      }
    }

    // 预检请求无需继续走业务逻辑
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      if (typeof res.end === 'function') res.end()
      return
    }

    next()
  }
}
