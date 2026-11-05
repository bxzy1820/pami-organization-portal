// logger.js — 请求日志中间件
// 记录每个请求的方法、路径、状态码、耗时

export function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
