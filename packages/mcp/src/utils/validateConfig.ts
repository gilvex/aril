import type { AgentConfig } from '../types/agentConfig.ts'
export function validateConfig(value: AgentConfig): AgentConfig {
  const url = new URL(value.origin)
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      ))
  ) {
    throw new Error(
      'Studio address must be an HTTPS origin, or loopback HTTP for development.',
    )
  }
  if (!/^pome_agent_[\w-]{43}$/.test(value.token))
    throw new Error('A valid studio agent credential is required.')
  return { origin: url.origin, token: value.token }
}
