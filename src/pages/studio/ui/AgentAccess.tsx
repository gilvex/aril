import { useEffect, useState } from 'react'
import { request, workspaceHeaders } from '../../../shared/api/workspace'
import type { AgentCredential } from '../../../../domain/agent-access'

export function AgentAccess({ workspaceId }: { workspaceId: string }) {
  const [credentials, setCredentials] = useState<AgentCredential[]>([])
  const [name, setName] = useState('Codex')
  const [scope, setScope] = useState<'read' | 'write'>('read')
  const [days, setDays] = useState(30)
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    request<AgentCredential[]>('/api/agent-access', {
      headers: workspaceHeaders(workspaceId),
    })
      .then((value) => {
        if (active) setCredentials(value)
      })
      .catch(() => {
        if (active)
          setError(
            'Could not load agent access. Close this dialog and try again.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [workspaceId])
  return (
    <section className="agent-access">
      <h2 id="modal-title">Agent access</h2>
      <p>
        Connect Codex or another MCP client to this workspace. Edits appear in
        revision history and team activity.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError('')
          setSecret('')
          try {
            const result = await request<{
              credential: AgentCredential
              token: string
            }>('/api/agent-access', {
              method: 'POST',
              headers: {
                ...workspaceHeaders(workspaceId),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, scope, days }),
            })
            setCredentials((items) => [result.credential, ...items])
            setSecret(result.token)
          } catch (e) {
            setError(
              e instanceof Error ? e.message : 'Could not create credential.',
            )
          } finally {
            setBusy(false)
          }
        }}
      >
        <label>
          Connection name
          <input
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="agent-access-options">
          <label>
            Access
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as 'read' | 'write')}
            >
              <option value="read">Read only</option>
              <option value="write">Read and edit</option>
            </select>
          </label>
          <label>
            Expires in
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>
        </div>
        <button
          className="button primary"
          disabled={busy || loading || !name.trim()}
        >
          Create credential
        </button>
      </form>
      {secret && (
        <div className="agent-secret">
          <strong>Save your credential now</strong>
          <p>
            It is shown only here, until this dialog closes. Keep it out of
            chats and Git.
          </p>
          <label>
            Credential
            <input
              type="password"
              readOnly
              value={secret}
              onFocus={(e) => e.target.select()}
              autoComplete="off"
            />
          </label>
          <button
            className="button"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(secret)
                setError('Credential copied.')
              } catch {
                setError('Select the credential field and copy it manually.')
              }
            }}
          >
            Copy credential
          </button>
        </div>
      )}
      <details className="agent-setup">
        <summary>Connect your MCP client</summary>
        <p>
          From your local Pomegranate checkout, run <code>pnpm mcp:setup</code>.
          Paste this studio address and the credential into the terminal
          prompts. The setup stores it in your user configuration folder and
          prints the MCP registration command.
        </p>
        <p>
          Studio address: <code>{location.origin}</code>
        </p>
        <p>
          Install the companion skill with <code>pnpm skill:install</code>, then
          open a new chat. See <code>docs/agent-integration.md</code> for other
          clients.
        </p>
      </details>
      <h3>Your connections</h3>
      {loading ? (
        <p>Loading…</p>
      ) : !credentials.length ? (
        <p>No agent connections yet.</p>
      ) : (
        <ul className="agent-credentials">
          {credentials.map((credential) => (
            <li key={credential.id}>
              <span>
                <strong>{credential.name}</strong>
                <small>
                  {credential.scope === 'write' ? 'Read and edit' : 'Read only'}{' '}
                  · {credential.expiresAt <= Date.now() ? 'Expired' : 'Expires'}{' '}
                  {new Date(credential.expiresAt).toLocaleDateString()}
                </small>
              </span>
              <button
                type="button"
                className="button"
                disabled={busy}
                aria-label={`Revoke ${credential.name}`}
                onClick={async () => {
                  setBusy(true)
                  setError('')
                  try {
                    await request(`/api/agent-access/${credential.id}`, {
                      method: 'DELETE',
                      headers: workspaceHeaders(workspaceId),
                    })
                    setCredentials((items) =>
                      items.filter((item) => item.id !== credential.id),
                    )
                    setSecret('')
                  } catch {
                    setError('Could not revoke this credential. Try again.')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="status">{error}</p>}
    </section>
  )
}
