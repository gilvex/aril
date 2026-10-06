export { workspaceSchema, nodeKinds, statuses } from '@pomegranate/domain/workspace'
export type {
  Workspace,
  Board,
  Idea,
  Requirement,
  Envelope,
} from '@pomegranate/domain/workspace'
import { writeVersion, writeVersionHeader } from '@pomegranate/domain/freshness'
export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}
export const sessionTokenKey = 'pomegranate-studio-session'
export const workspaceHeaders = (id: string) => ({ 'x-workspace-id': id })
export function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem(sessionTokenKey)
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
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
      body.error || `Request failed (${response.status})`,
      response.status,
      body.code,
    )
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>)
}
export function downloadJson(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
