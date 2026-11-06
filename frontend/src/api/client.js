const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { code = 500, status = 0 } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function request(path, { query, signal } = {}) {
  const search = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  })

  const queryString = search.toString()
  const response = await fetch(`${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`, {
    headers: { Accept: 'application/json' },
    signal
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('服务器返回了无法解析的数据', { status: response.status })
  }

  if (!response.ok || payload?.code !== 0) {
    throw new ApiError(payload?.message || `请求失败（HTTP ${response.status}）`, {
      code: payload?.code ?? response.status,
      status: response.status
    })
  }

  return payload.data
}

export const portalApi = {
  getSite: (options) => request('/site', options),
  getHome: (options) => request('/home', options),
  getAbout: (options) => request('/about', options),
  getBusiness: (options) => request('/business', options),
  getProjects: (options) => request('/projects', options),
  getNews: (page = 1, pageSize = 20, options = {}) =>
    request('/news', { ...options, query: { page, pageSize } }),
  getRecruitment: (page = 1, pageSize = 20, options = {}) =>
    request('/recruitment', { ...options, query: { page, pageSize } })
}

