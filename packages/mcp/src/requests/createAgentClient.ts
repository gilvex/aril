import { validateConfig, type AgentConfig } from '../config/index.ts'

export function createAgentClient(config: AgentConfig) {
  const { origin, token } = validateConfig(config)
  return async function call<T>(
    path: string,
    method = 'GET',
    body?: unknown,
  ): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${origin}/api/agent/${path}`, {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new Error(
        'Studio connection failed or timed out. Check the configured address and connectivity. If an edit timed out, retry with the same requestId.',
      )
    }
    const result = (await response.json().catch(() => null)) as {
      error?: string
      revision?: number
      details?: unknown
    } | null
    if (!response.ok) {
      const message = result?.error || 'Studio request failed.'
      throw new Error(
        `${response.status}: ${message}${result?.revision ? ` Current revision: ${result.revision}.` : ''}${result?.details ? ` ${JSON.stringify(result.details)}` : ''}`,
      )
    }
    return result as T
  }
}
