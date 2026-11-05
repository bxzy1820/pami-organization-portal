// 错误类型与工厂
// ---------------------------------------------------------------------------

export const ERROR_CODES = Object.freeze({
  BAD_REQUEST: 40001,
  VALIDATION:  40002,
  NOT_FOUND:   40401,
  SERVER:      50000
})

export class ApiError extends Error {
  constructor({ code, message, status = 500, data = null }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.data = data
  }

  toJSON() {
    return { code: this.code, message: this.message, data: this.data }
  }
}

export const badRequest = (message = '请求参数错误') =>
  new ApiError({ code: ERROR_CODES.BAD_REQUEST, message, status: 400 })

export const notFound = (message = '资源不存在') =>
  new ApiError({ code: ERROR_CODES.NOT_FOUND, message, status: 404 })

export const serverError = (message = '服务器内部错误') =>
  new ApiError({ code: ERROR_CODES.SERVER, message, status: 500 })
