import { apiTransport } from './apiTransport.ts'

export function apiFetch(url: string, init?: RequestInit) {
  return apiTransport.request
    ? apiTransport.request(url, init)
    : fetch(url, init)
}
