/**
 * 访问日志中间件（JSON 单行输出）
 * 不依赖第三方库，方便部署时被日志采集直接解析。
 * 可通过 sink 注入自定义输出（测试或接入 winston/pino 时使用）。
 */
export function createLogger({
  sink = (line) => process.stdout.write(`${line}\n`),
  skipPaths = ['/health', '/favicon.ico']
} = {}) {
  return function logger(req, res, next) {
    const path = req.originalUrl ?? req.url ?? ''
    if (skipPaths.some((prefix) => path.startsWith(prefix))) return next()

    const startedAt = Date.now()

    if (typeof res.once === 'function') {
      res.once('finish', () => {
        const payload = {
          time: new Date().toISOString(),
          level: res.statusCode >= 500 ? 'error' : 'info',
          method: req.method ?? '',
          path,
          status: res.statusCode ?? 0,
          durationMs: Date.now() - startedAt,
          ip: req.ip ?? req.socket?.remoteAddress ?? ''
        }
        sink(JSON.stringify(payload))
      })
    }

    next()
  }
}
