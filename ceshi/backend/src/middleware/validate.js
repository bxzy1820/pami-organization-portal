// 无第三方依赖的参数校验
// ---------------------------------------------------------------------------
// 校验结果写入 req.validated.{query,params,body}，不要直接读 req.query/body。
// 规则对象形如：{ type:'number', required?:boolean, min?, max?, in? }
// 失败抛出 ApiError(status=400, code=40002)。

import { ApiError, ERROR_CODES } from '../utils/errors.js'

function checkRule(value, rule, field) {
  if (value === undefined || value === null || value === '') {
    if (rule.required) throw new ApiError({ code: ERROR_CODES.VALIDATION, message: `${field} 必填`, status: 400 })
    return null
  }

  switch (rule.type) {
    case 'number': {
      const num = Number(value)
      if (Number.isNaN(num)) throw new ApiError({ code: ERROR_CODES.VALIDATION, message: `${field} 必须是数字`, status: 400 })
      // 钳制到 [min, max] 范围，而不是抛错
      let clamped = num
      if (rule.min != null) clamped = Math.max(clamped, rule.min)
      if (rule.max != null) clamped = Math.min(clamped, rule.max)
      return clamped
    }
    case 'string': {
      const str = String(value).trim()
      if (rule.minLength != null && str.length < rule.minLength) throw new ApiError({ code: ERROR_CODES.VALIDATION, message: `${field} 至少 ${rule.minLength} 个字符`, status: 400 })
      if (rule.maxLength != null && str.length > rule.maxLength) throw new ApiError({ code: ERROR_CODES.VALIDATION, message: `${field} 不能超过 ${rule.maxLength} 个字符`, status: 400 })
      return str
    }
    case 'boolean':
      return value === 'true' || value === true || value === 1
    case 'enum': {
      if (!rule.in.includes(value)) throw new ApiError({ code: ERROR_CODES.VALIDATION, message: `${field} 取值不合法`, status: 400 })
      return value
    }
    default:
      return value
  }
}

export function validateObject(source, rules, target = {}) {
  for (const [field, rule] of Object.entries(rules)) {
    if (!rule) continue
    target[field] = checkRule(source?.[field], rule, field)
  }
  return target
}

/** 常用分页 query 校验（契约参数名 page/size，size 最大 50） */
export const paginationSchema = {
  page: { type: 'number', min: 1, max: 100000 },
  size: { type: 'number', min: 1, max: 50 }
}

export function validateQuery(rules) {
  return function (req, _res, next) {
    req.validated = req.validated || {}
    req.validated.query = validateObject(req.query, rules)
    next()
  }
}

export function validateParams(rules) {
  return function (req, _res, next) {
    req.validated = req.validated || {}
    req.validated.params = validateObject(req.params, rules)
    next()
  }
}

export function validateBody(rules) {
  return function (req, _res, next) {
    req.validated = req.validated || {}
    req.validated.body = validateObject(req.body, rules)
    next()
  }
}

export default validateQuery
