// CORS 中间件：白名单 + OPTIONS 204
// ---------------------------------------------------------------------------

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']

export function corsMiddleware(options = {}) {
  const origins = options.origins || DEFAULT_ORIGINS

  const allow = (res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-ID')
    res.setHeader('Access-Control-Max-Age', '86400')
  }

  const match = (origin) => origins.some((o) => o === origin)

  return function cors(req, res, next) {
    const origin = req.headers.origin
    if (origin && match(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }

    if (req.method === 'OPTIONS') {
      allow(res)
      res.statusCode = 204
      res.end()
      return
    }

    allow(res)
    next()
  }
}

export default corsMiddleware
