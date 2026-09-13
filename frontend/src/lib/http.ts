export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string | null

  constructor(message: string, status: number, code: string | null = null) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

export async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (isStateChangingMethod(init?.method)) {
    const csrfToken = readCookie('XSRF-TOKEN')
    if (csrfToken && !headers.has('X-XSRF-TOKEN')) {
      headers.set('X-XSRF-TOKEN', csrfToken)
    }
  }
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'same-origin',
    headers,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string; code?: string } | null
    throw new ApiRequestError(body?.message ?? '요청을 처리하지 못했습니다.', response.status, body?.code ?? null)
  }
  if (response.status === 204) return null as T
  return response.json() as Promise<T>
}

function isStateChangingMethod(method: string | undefined) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method?.toUpperCase() ?? 'GET')
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  if (!cookie) return null
  return decodeURIComponent(cookie.slice(name.length + 1))
}
