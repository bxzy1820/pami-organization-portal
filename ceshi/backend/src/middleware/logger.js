// 单行 JSON 访问日志（stdout）
// ---------------------------------------------------------------------------
// /health 或 /healthz 会被跳过，避免轮询污染日志。

function ms(start) {
  const diff = process.hrtime(start)
  return (diff[0] * 1000 + diff[1] / 1e6).toFixed(2)
}

function levelForStatus(status) {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

export function loggerMiddleware() {
  return function logger(req, res, next) {
    const start = process.hrtime()
    const url = req.url || req.originalUrl || '/'

    if (/^\/healthz?$/i.test(url)) return next()

    res.on('finish', () => {
      const level = levelForStatus(res.statusCode)
      const line = JSON.stringify({
        ts: new Date().toISOString(),
        level,
        method: req.method,
        url,
        status: res.statusCode,
        ms: ms(start)
      })
      // eslint-disable-next-line no-console
      console.log(line)
    })

    next()
  }
}

export default loggerMiddleware
