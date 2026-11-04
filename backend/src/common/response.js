// 统一响应封装：{ code, message, data }
// 成功：success(res, data)
// 失败：fail(res, code, message) 或抛出 BizError 由全局异常处理

export function success(res, data = null) {
  return res.json({ code: 0, message: 'ok', data });
}

export function fail(res, code, message, data = null) {
  return res.status(200).json({ code, message, data });
}

// 业务异常：在 service/controller 里 throw 即可，由 errorHandler 统一捕获
export class BizError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'BizError';
  }
}

// 错误码常量（与契约 §1.3 对齐）
export const ErrorCode = {
  OK: 0,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};
