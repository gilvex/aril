import { ApiError } from '@/shared/api/apiError.ts'
import { apiFetch } from './apiFetch.ts'
import { authHeaders } from '@/shared/api/authHeaders.ts'
import { writeVersion, writeVersionHeader } from '@pomegranate/domain/freshness'
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      [writeVersionHeader]: writeVersion,
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: 'The studio server is unavailable.' }))
    throw new ApiError(
      body &&
        typeof body === 'object' &&
        'error' in body &&
        typeof body.error === 'string'
        ? body.error
        : `Request failed (${response.status})`,
      response.status,
      body &&
        typeof body === 'object' &&
        'code' in body &&
        typeof body.code === 'string'
        ? body.code
        : undefined,
    )
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>)
}
