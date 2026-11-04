import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  createCorsMiddleware,
  parseOrigins,
  createLogger,
  rules,
  paginationSchema,
  validateQuery,
  validateBody,
  validateParams,
  errorHandler,
  notFoundHandler,
  normalizeError
} from '../backend/src/middleware/index.js'
import { ApiError } from '../backend/src/utils/errors.js'

function createRes({ statusCode = 200 } = {}) {
  const headers = {}
  const listeners = {}
  return {
    headers,
    statusCode,
    body: undefined,
    ended: false,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value
    },
    getHeader(name) {
      return headers[name.toLowerCase()]
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
    end() {
      this.ended = true
    },
    once(event, handler) {
      ;(listeners[event] ??= []).push(handler)
    },
    emit(event) {
      for (const handler of listeners[event] ?? []) handler()
    }
  }
}

function createNext() {
  const calls = []
  const next = (error) => {
    calls.push(error)
  }
  next.calls = calls
  return next
}

describe('Middleware: CORS', () => {
  it('白名单内的 Origin 返回 CORS 头，并继续执行', () => {
    const middleware = createCorsMiddleware({ origins: ['http://localhost:5173'] })
    const req = { method: 'GET', headers: { origin: 'http://localhost:5173' } }
    const res = createRes()
    const next = createNext()

    middleware(req, res, next)

    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173')
    assert.equal(res.headers['access-control-allow-methods'], 'GET, POST, OPTIONS')
    assert.equal(res.headers['vary'], 'Origin')
    assert.equal(next.calls.length, 1)
  })

  it('白名单外的 Origin 不回显 CORS 头，但仍继续执行', () => {
    const middleware = createCorsMiddleware({ origins: ['http://localhost:5173'] })
    const req = { method: 'GET', headers: { origin: 'https://evil.example.com' } }
    const res = createRes()
    const next = createNext()

    middleware(req, res, next)

    assert.equal(res.headers['access-control-allow-origin'], undefined)
    assert.equal(res.headers['vary'], 'Origin')
    assert.equal(next.calls.length, 1)
  })

  it('OPTIONS 预检直接 204，不进入业务路由', () => {
    const middleware = createCorsMiddleware({ origins: ['http://localhost:5173'] })
    const req = { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } }
    const res = createRes()
    const next = createNext()

    middleware(req, res, next)

    assert.equal(res.statusCode, 204)
    assert.equal(res.ended, true)
    assert.equal(next.calls.length, 0)
  })

  it('CORS_ORIGIN 支持逗号分隔并去除空格', () => {
    assert.deepEqual(parseOrigins('http://localhost:5173, https://portal.example.com '), [
      'http://localhost:5173',
      'https://portal.example.com'
    ])
    assert.deepEqual(parseOrigins(undefined), ['http://localhost:5173'])
  })
})

describe('Middleware: 访问日志', () => {
  it('请求完成后输出单行 JSON 日志', () => {
    const lines = []
    const middleware = createLogger({ sink: (line) => lines.push(line) })
    const req = { method: 'GET', originalUrl: '/api/v1/site', ip: '127.0.0.1' }
    const res = createRes()
    const next = createNext()

    middleware(req, res, next)
    res.statusCode = 200
    res.emit('finish')

    assert.equal(next.calls.length, 1)
    assert.equal(lines.length, 1)
    const entry = JSON.parse(lines[0])
    assert.equal(entry.method, 'GET')
    assert.equal(entry.path, '/api/v1/site')
    assert.equal(entry.status, 200)
    assert.equal(entry.level, 'info')
    assert.equal(typeof entry.durationMs, 'number')
  })

  it('5xx 记为 error 级别，/health 不记录', () => {
    const lines = []
    const middleware = createLogger({ sink: (line) => lines.push(line) })

    const res = createRes()
    middleware({ method: 'GET', originalUrl: '/api/v1/news' }, res, createNext())
    res.statusCode = 500
    res.emit('finish')

    const res2 = createRes()
    middleware({ method: 'GET', originalUrl: '/health' }, res2, createNext())
    res2.statusCode = 200
    res2.emit('finish')

    assert.equal(lines.length, 1)
    assert.equal(JSON.parse(lines[0]).level, 'error')
  })
})

describe('Middleware: 参数校验', () => {
  it('分页参数归一化后写入 req.validated.query', () => {
    const middleware = validateQuery(paginationSchema)
    const req = { query: { page: '2', pageSize: '5' } }
    const next = createNext()

    middleware(req, createRes(), next)

    assert.deepEqual(req.validated.query, { page: 2, pageSize: 5 })
    assert.equal(next.calls.length, 1)
    assert.equal(next.calls[0], undefined)
  })

  it('缺省分页参数使用默认值 1 / 20', () => {
    const req = { query: {} }
    validateQuery(paginationSchema)(req, createRes(), createNext())
    assert.deepEqual(req.validated.query, { page: 1, pageSize: 20 })
  })

  it('非法分页参数转交错误中间件，错误码 40001', () => {
    const next = createNext()
    validateQuery(paginationSchema)({ query: { pageSize: '0' } }, createRes(), next)

    const error = next.calls[0]
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 40001)
    assert.equal(error.status, 400)
    assert.equal(error.details.field, 'pageSize')
  })

  it('请求体必填字段缺失时报错，并保持统一错误结构', () => {
    const schema = {
      name: rules.string({ required: true, min: 1, max: 30 }),
      message: rules.string({ required: true, min: 10, max: 1000 })
    }
    const next = createNext()
    validateBody(schema)({ body: { message: '太短' } }, createRes(), next)

    const error = next.calls[0]
    assert.equal(error.code, 40001)
    assert.equal(error.details.field, 'name')
  })

  it('路径参数枚举校验', () => {
    const schema = { type: rules.enum(['announcement', 'achievement', 'recruitment'], { required: true }) }
    const req = { params: { type: 'news' } }
    const next = createNext()

    validateParams(schema)(req, createRes(), next)

    const error = next.calls[0]
    assert.equal(error.code, 40001)
    assert.deepEqual(error.details.allowed, ['announcement', 'achievement', 'recruitment'])
  })

  it('合法请求体被裁剪为字符串并去除首尾空格', () => {
    const schema = { name: rules.string({ required: true, trim: true }), company: rules.string({ max: 60 }) }
    const req = { body: { name: '  张三  ', extra: '不应保留' } }
    validateBody(schema)(req, createRes(), createNext())

    assert.deepEqual(req.validated.body, { name: '张三', company: '' })
  })
})

describe('Middleware: 统一错误处理', () => {
  it('业务异常原样输出 { code, message, data: null }', () => {
    const req = { method: 'GET', originalUrl: '/api/v1/about' }
    const res = createRes()
    const handler = errorHandler()

    handler(ApiError.notFound('记录不存在'), req, res, () => {})

    assert.equal(res.statusCode, 404)
    assert.deepEqual(res.body, { code: 40401, message: '记录不存在', data: null })
  })

  it('未知异常统一 50000，不泄漏内部堆栈', () => {
    const errors = []
    const res = createRes()
    const handler = errorHandler({ logger: { error: (...args) => errors.push(args) } })

    handler(new Error('数据库密码错误 len=xxxx'), { method: 'GET', originalUrl: '/api/v1/news' }, res, () => {})

    assert.equal(res.statusCode, 500)
    assert.deepEqual(res.body, { code: 50000, message: '服务端异常', data: null })
    assert.equal(errors.length, 1)
  })

  it('Prisma 记录不存在映射为 40401', () => {
    const error = Object.assign(new Error('not found'), { code: 'P2025' })
    const normalized = normalizeError(error)
    assert.equal(normalized.status, 404)
    assert.equal(normalized.code, 40401)
  })

  it('非法 JSON 请求体映射为 40001', () => {
    const error = Object.assign(new Error('invalid json'), { type: 'entity.parse.failed' })
    const normalized = normalizeError(error)
    assert.equal(normalized.status, 400)
    assert.equal(normalized.code, 40001)
  })

  it('校验错误携带 details，便于前端定位字段', () => {
    const res = createRes()
    errorHandler()(ApiError.badRequest('参数错误', { field: 'page' }), { method: 'GET', originalUrl: '/api/v1/news' }, res, () => {})

    assert.deepEqual(res.body, { code: 40001, message: '参数错误', data: null, details: { field: 'page' } })
  })

  it('响应已发出时交回 Express 默认处理，避免重复写入', () => {
    const res = createRes()
    const nextError = []
    errorHandler({ logger: { error: () => {} } })(
      new Error('late'),
      { method: 'GET' },
      { ...res, headersSent: true },
      (err) => nextError.push(err)
    )

    assert.equal(nextError.length, 1)
    assert.equal(res.body, undefined)
  })

  it('未匹配路由统一 40401', () => {
    const next = createNext()
    notFoundHandler({ method: 'GET', originalUrl: '/api/v1/unknown' }, createRes(), next)

    assert.equal(next.calls[0].code, 40401)
    assert.equal(next.calls[0].status, 404)
  })
})
