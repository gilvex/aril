import { request, workspaceHeaders } from '../../../shared/api/workspace'
import { presenceSchema, type Presence } from '@pomegranate/domain/collaboration'
import {
  publicKey,
  encode64,
  signMessage,
  verifyMessage,
  verifyCertificate,
  type Certificate,
  type LiveConfig,
  type LiveState,
  type SignedCertificate,
} from '@pomegranate/domain/live-session'

export async function openLiveChannel(
  workspaceId: string,
  clientId: string,
  latest: () => LiveState,
  onPeers: (peers: Presence[]) => void,
  onConnection: (connected: boolean) => void,
  signal: AbortSignal,
) {
  const keys = (await crypto.subtle.generateKey('Ed25519', true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair
  const key = encode64(await crypto.subtle.exportKey('raw', keys.publicKey))
  const credentials = () =>
    request<LiveConfig | { transport: 'local' }>('/api/realtime', {
      method: 'POST',
      signal,
      headers: {
        ...workspaceHeaders(workspaceId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId, publicKey: key }),
    })
  const config = await credentials()
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  if (config.transport === 'local') return null
  const { RealtimeClient } = await import('@supabase/realtime-js')
  const verifier = await publicKey(config.verificationKey)
  const socket = new RealtimeClient(`${config.url}/realtime/v1`, {
    params: { apikey: config.apiKey },
  })
  await socket.setAuth(config.token)
  let certificate = config.certificate
  let closed = false,
    subscribed = false,
    syncGeneration = 0
  let refreshing: Promise<void> | undefined
  let refreshTimer: ReturnType<typeof setTimeout>
  const identities = new Map<
    string,
    { certificate: Certificate; key: CryptoKey; body: string }
  >()
  const peers = new Map<string, Presence>()
  const pending = new Map<string, { body: string; signature: string }>()
  const channel = socket.channel(config.topic, {
    config: {
      private: true,
      broadcast: { self: false },
      presence: { key: clientId },
    },
  })
  const emit = () => {
    if (!closed) onPeers([...peers.values()])
  }
  const send = async (state: LiveState) => {
    if (!subscribed || closed || !socket.isConnected()) return
    const body = JSON.stringify(state)
    const signature = await signMessage(keys.privateKey, body)
    if (!subscribed || closed || !socket.isConnected()) return
    // Only send through an established socket; never fall back to HTTP/database writes.
    await channel.send({
      type: 'broadcast',
      event: 'state',
      payload: { body, signature },
    })
  }
  const sync = async () => {
    const generation = ++syncGeneration
    const entries = Object.values(
      channel.presenceState<{ certificate: SignedCertificate }>(),
    ).flat()
    const next = new Map<
      string,
      { certificate: Certificate; key: CryptoKey; body: string }
    >()
    for (const entry of entries.slice(0, 64)) {
      const signed = entry.certificate
      const cached = [...identities.values()].find(
        (item) => item.body === signed?.body,
      )
      if (cached && cached.certificate.expiresAt > Date.now()) {
        next.set(cached.certificate.clientId, cached)
        continue
      }
      const identity = await verifyCertificate(signed, verifier, workspaceId)
      if (!identity || identity.clientId === clientId) continue
      next.set(identity.clientId, {
        certificate: identity,
        key: await publicKey(identity.publicKey),
        body: signed.body,
      })
    }
    if (closed || generation !== syncGeneration) return
    identities.clear()
    for (const [id, identity] of next) identities.set(id, identity)
    for (const [id, peer] of peers) {
      const identity = identities.get(id)
      if (!identity) peers.delete(id)
      else peers.set(id, { ...peer, profile: identity.certificate.profile })
    }
    emit()
    for (const [id, packet] of pending) {
      pending.delete(id)
      if (identities.has(id)) void receive(packet).catch(() => {})
    }
    void send(latest()).catch(() => {})
  }
  const receive = async (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return
    const { body, signature } = payload as {
      body?: unknown
      signature?: unknown
    }
    if (
      typeof body !== 'string' ||
      body.length > 200000 ||
      typeof signature !== 'string' ||
      signature.length > 100
    )
      return
    let state: LiveState
    try {
      state = presenceSchema.parse(JSON.parse(body))
    } catch {
      return
    }
    const identity = identities.get(state.clientId)
    // A broadcast can arrive while its join certificate is still being verified.
    // Retain only the latest bounded packet; verify it after presence sync.
    if (!identity && pending.size < 64) {
      pending.set(state.clientId, { body, signature })
      return
    }
    if (
      !identity ||
      identity.certificate.expiresAt <= Date.now() ||
      state.sequence === undefined
    )
      return
    if (
      !(await verifyMessage(identity.key, body, signature)) ||
      closed ||
      !identities.has(state.clientId)
    )
      return
    const previous = peers.get(state.clientId)
    if (previous && (previous.sequence || 0) >= state.sequence) return
    peers.set(state.clientId, {
      ...state,
      profile: identity.certificate.profile,
      seenAt: Date.now(),
    })
    emit()
  }
  const refresh = () => {
    if (closed) return Promise.resolve()
    return (refreshing ??= (async () => {
      clearTimeout(refreshTimer)
      try {
        const next = await credentials()
        if (closed || next.transport !== 'websocket') return
        certificate = next.certificate
        await socket.setAuth(next.token)
        if (subscribed) await channel.track({ certificate })
        refreshTimer = setTimeout(() => void refresh(), 240000)
      } catch {
        if (!closed) refreshTimer = setTimeout(() => void refresh(), 5000)
      } finally {
        refreshing = undefined
      }
    })())
  }
  channel
    .on('presence', { event: 'sync' }, () => void sync().catch(() => {}))
    .on(
      'broadcast',
      { event: 'state' },
      ({ payload }) => void receive(payload).catch(() => {}),
    )
    .subscribe((status) => {
      if (closed) return
      subscribed = status === 'SUBSCRIBED'
      onConnection(subscribed)
      if (subscribed) {
        void channel
          .track({ certificate })
          .then(() => send(latest()))
          .catch(() => {})
      } else {
        peers.clear()
        identities.clear()
        pending.clear()
        emit()
      }
    })
  refreshTimer = setTimeout(() => void refresh(), 240000)
  const staleTimer = setInterval(() => {
    let changed = false
    for (const [id, peer] of peers) {
      if (
        Date.now() - peer.seenAt > 30000 ||
        (identities.get(id)?.certificate.expiresAt || 0) <= Date.now()
      ) {
        peers.delete(id)
        changed = true
      } else if (
        Date.now() - peer.seenAt > 15000 &&
        (peer.cursor || peer.dragging?.length)
      ) {
        peers.set(id, { ...peer, cursor: null, dragging: [] })
        changed = true
      }
    }
    if (changed) emit()
  }, 5000)
  const close = () => {
    if (closed) return
    closed = true
    clearTimeout(refreshTimer)
    clearInterval(staleTimer)
    void socket.removeAllChannels().finally(() => socket.disconnect())
  }
  if (signal.aborted) close()
  else signal.addEventListener('abort', close, { once: true })
  return { send, refresh, close }
}
