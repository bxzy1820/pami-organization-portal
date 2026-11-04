import { ApiError } from '../utils/errors.js'

/**
 * 轻量参数校验规则（不引入第三方校验库）
 * 每条规则签名：(value, fieldName) => 归一化后的值，非法时抛 ApiError(40001)
 */
export const rules = {
  string({ required = false, min = 0, max = Infinity, defaultValue = '', trim = true } = {}) {
    return (value, field) => {
      if (value === undefined || value === null || value === '') {
        if (required) throw ApiError.badRequest(`${field} 为必填项`, { field })
        return defaultValue
      }
      if (typeof value !== 'string') throw ApiError.badRequest(`${field} 必须是字符串`, { field })
      const result = trim ? value.trim() : value
      if (result.length < min) throw ApiError.badRequest(`${field} 长度不能小于 ${min}`, { field })
      if (result.length > max) throw ApiError.badRequest(`${field} 长度不能超过 ${max}`, { field })
      return result
    }
  },

  int({ required = false, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, defaultValue = 0 } = {}) {
    return (value, field) => {
      if (value === undefined || value === null || value === '') {
        if (required) throw ApiError.badRequest(`${field} 为必填项`, { field })
        return defaultValue
      }
      const parsed = typeof value === 'number' ? value : Number(String(value).trim())
      if (!Number.isInteger(parsed)) throw ApiError.badRequest(`${field} 必须是整数`, { field })
      if (parsed < min || parsed > max) {
        throw ApiError.badRequest(`${field} 必须在 ${min} 到 ${max} 之间`, { field })
      }
      return parsed
    }
  },

  enum(allowed, { required = false, defaultValue = null } = {}) {
    return (value, field) => {
      if (value === undefined || value === null || value === '') {
        if (required) throw ApiError.badRequest(`${field} 为必填项`, { field })
        return defaultValue
      }
      if (!allowed.includes(value)) {
        throw ApiError.badRequest(`${field} 取值不合法`, { field, allowed: [...allowed] })
      }
      return value
    }
  },

  boolean({ defaultValue = false } = {}) {
    return (value, field) => {
      if (value === undefined || value === null || value === '') return defaultValue
      if (typeof value === 'boolean') return value
      const text = String(value).toLowerCase()
      if (text === 'true' || text === '1') return true
      if (text === 'false' || text === '0') return false
      throw ApiError.badRequest(`${field} 必须是布尔值`, { field })
    }
  }
}

// 分页参数常用组合，可直接用于 route 层
export const paginationSchema = {
  page: rules.int({ min: 1, defaultValue: 1 }),
  pageSize: rules.int({ min: 1, max: 100, defaultValue: 20 })
}


function pick(source, schema) {
  const result = {}
  for (const [field, rule] of Object.entries(schema)) {
    result[field] = rule(source?.[field], field)
  }
  return result
}

/**
 * 校验结果挂到 req.validated.{query|params|body}，
 * 不直接改写 req.query（Express 5 的 req.query 只读）。
 */
export function validateQuery(schema = {}) {
  return function validateQueryMiddleware(req, res, next) {
    try {
      req.validated = { ...(req.validated ?? {}), query: pick(req.query, schema) }
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateParams(schema = {}) {
  return function validateParamsMiddleware(req, res, next) {
    try {
      req.validated = { ...(req.validated ?? {}), params: pick(req.params, schema) }
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function validateBody(schema = {}) {
  return function validateBodyMiddleware(req, res, next) {
    try {
      req.validated = { ...(req.validated ?? {}), body: pick(req.body, schema) }
      next()
    } catch (error) {
      next(error)
    }
  }
}
