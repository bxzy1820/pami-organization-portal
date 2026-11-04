import { BizError, ErrorCode } from '../common/response.js';

// 404：路由不存在
export function notFoundHandler(req, res) {
  res.status(200).json({
    code: ErrorCode.NOT_FOUND,
    message: '接口不存在',
    data: null,
  });
}

// 全局异常处理：捕获 BizError 和未知错误，统一返回 {code,message,data}
// 注意：Express 错误处理中间件必须 4 个参数 (err, req, res, next)
export function errorHandler(err, req, res, next) {
  if (err instanceof BizError) {
    return res.status(200).json({
      code: err.code,
      message: err.message,
      data: null,
    });
  }
  console.error('[Unhandled Error]', err);
  return res.status(200).json({
    code: ErrorCode.INTERNAL_ERROR,
    message: '服务内部异常',
    data: null,
  });
}
