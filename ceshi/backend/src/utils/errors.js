/**
 * 通用错误类型与错误码
 * 与 docs/API接口文档.md 的错误码保持一致
 */
export const ERROR_CODES = Object.freeze({
  OK: 0,
  BAD_REQUEST: 40001,
  NOT_FOUND: 40401,
  RATE_LIMITED: 42901,
  SERVER_ERROR: 50000
})

export class ApiError extends Error {
  /**
   * @param {number} status HTTP 状态码
   * @param {number} code 业务错误码
   * @param {string} message 提示信息
   * @param {unknown} [details] 附加信息（字段校验错误等）
   */
  constructor(status, code, message, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static badRequest(message = '参数错误', details = null) {
    return new ApiError(400, ERROR_CODES.BAD_REQUEST, message, details)
  }

  static notFound(message = '资源不存在') {
    return new ApiError(404, ERROR_CODES.NOT_FOUND, message)
  }

  static serverError(message = '服务端异常') {
    return new ApiError(500, ERROR_CODES.SERVER_ERROR, message)
  }
}
