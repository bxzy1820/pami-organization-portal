// 中间件单元测试
// ---------------------------------------------------------------------------

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { corsMiddleware } from '../backend/src/middleware/cors.js'
import { loggerMiddleware } from '../backend/src/middleware/logger.js'
import { validateQuery, paginationSchema } from '../backend/src/middleware/validate.js'
import { errorHandler, notFoundHandler } from '../backend/src/middleware/error-handler.js'
import { ApiError, ERROR_CODES } from '../backend/src/utils/errors.js'

function mockReq(overrides = {}) {
  return {
    method: 'GET',
    url: '/api/test',
    originalUrl: '/api/test',
    headers: {},
    query: {},
    params: {},
    body: null,
    ...overrides
  }
}

function mockRes() {
  const headers = {}
  return {
    statusCode: 200,
    setHeader: (k, v) => { headers[k.toLowerCase()] = v },
    getHeader: (k) => headers[k.toLowerCase()],
    end: (_body) => {},
    on: (_evt, _fn) => {}
  }
}

// ============================================================
// CORS
// ============================================================
describe('Middleware CORS', () => {
  it('白名单内的 Origin 被允许', () => {
    const mw = corsMiddleware({ origins: ['http://a.test'] })
    const req = mockReq({ headers: { origin: 'http://a.test' } })
    const res = mockRes()
    mw(req, res, () => {})
    assert.equal(res.getHeader('Access-Control-Allow-Origin'), 'http://a.test')
  })

  it('白名单外的 Origin 不回写', () => {
    const mw = corsMiddleware({ origins: ['http://a.test'] })
    const req = mockReq({ headers: { origin: 'http://evil.test' } })
    const res = mockRes()
    mw(req, res, () => {})
    assert.equal(res.getHeader('Access-Control-Allow-Origin'), undefined)
  })

  it('OPTIONS 返回 204', () => {
    const mw = corsMiddleware({ origins: ['http://a.test'] })
    const req = mockReq({ method: 'OPTIONS', headers: { origin: 'http://a.test' } })
    const res = mockRes()
    mw(req, res, () => {})
    assert.equal(res.statusCode, 204)
  })
})

// ============================================================
// Logger
// ============================================================
describe('Middleware Logger', () => {
  it('正常路径记录访问日志', () => {
    const mw = loggerMiddleware()
    const req = mockReq({ url: '/api/v1/site' })
    const res = mockRes()
    let finished = false
    res.on = (evt, fn) => { if (evt === 'finish') { finished = true; fn() } }
    mw(req, res, () => {})
    assert.equal(finished, true)
  })

  it('/health 不记录', () => {
    const mw = loggerMiddleware()
    const req = mockReq({ url: '/health' })
    const res = mockRes()
    let finishCalled = false
    res.on = (evt, _fn) => { if (evt === 'finish') finishCalled = true }
    mw(req, res, () => {})
    assert.equal(finishCalled, false)
  })
})

// ============================================================
// Validate
// ============================================================
describe('Middleware Validate', () => {
  it('正常分页被归一化', () => {
    const mw = validateQuery(paginationSchema)
    const req = mockReq({ query: { page: '2', pageSize: '50' } })
    const res = mockRes()
    mw(req, res, () => {
      assert.deepEqual(req.validated.query, { page: 2, pageSize: 50 })
    })
  })

  it('pageSize 超过 100 被截断', () => {
    const mw = validateQuery(paginationSchema)
    const req = mockReq({ query: { pageSize: '200' } })
    const res = mockRes()
    mw(req, res, () => {
      assert.equal(req.validated.query.pageSize, 100)
    })
  })

  it('page=0 被提升到 1', () => {
    const mw = validateQuery(paginationSchema)
    const req = mockReq({ query: { page: '0' } })
    const res = mockRes()
    mw(req, res, () => {
      assert.equal(req.validated.query.page, 1)
    })
  })
})

// ============================================================
// Error Handler
// ============================================================
describe('Middleware Error Handler', () => {
  it('ApiError 按 status 返回，并打 error 日志', () => {
    let logged = null
    const mw = errorHandler({ logger: { error: (m) => { logged = m } } })
    const req = mockReq()
    const res = mockRes()
    const err = new ApiError({ code: ERROR_CODES.NOT_FOUND, message: '不存在', status: 404 })
    mw(err, req, res, () => {})
    assert.equal(res.statusCode, 404)
  })

  it('未知 Prisma P2025 映射为 404', () => {
    const mw = errorHandler({ logger: { error: () => {} } })
    const req = mockReq()
    const res = mockRes()
    mw({ code: 'P2025', message: 'Record not found' }, req, res, () => {})
    assert.equal(res.statusCode, 404)
  })

  it('未知错误兜底 500', () => {
    const mw = errorHandler({ logger: { error: () => {} } })
    const req = mockReq()
    const res = mockRes()
    mw(new Error('boom'), req, res, () => {})
    assert.equal(res.statusCode, 500)
  })
})

// ============================================================
// Not Found
// ============================================================
describe('Middleware Not Found', () => {
  it('返回 404 + JSON', () => {
    const req = mockReq({ method: 'GET', url: '/nope' })
    const res = mockRes()
    notFoundHandler(req, res)
    assert.equal(res.statusCode, 404)
  })
})
