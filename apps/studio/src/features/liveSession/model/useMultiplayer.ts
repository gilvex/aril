import { connectLiveSession } from '@/features/liveSession/model/iterators/connectLiveSession.ts'
import { openLiveChannel } from '@/features/liveSession/model/requests/openLiveChannel.ts'
import { useMultiplayerModel } from '@/features/liveSession/model/useMultiplayerModel.ts'
import { authHeaders } from '@/shared/api/authHeaders.ts'
import { apiFetch } from '@/shared/api/apiFetch.ts'
import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import type {
  Activity,
  DragPosition,
  Presence,
  Profile,
  RequirementPresence,
} from '@pomegranate/domain/collaboration'
import type { LiveState } from '@pomegranate/domain/liveSession'
import type { Envelope } from '@pomegranate/domain/workspace'
import { useCallback, useEffect, useRef } from 'react'
import { runSaga } from 'redux-saga'

export function useMultiplayer(
  initialProfile: Profile,
  receive: (value: Envelope) => void,
  workspaceId: string,
) {
  const {
    profile,
    setProfile,
    peers,
    setPeers,
    activity,
    setActivity,
    connected,
    setConnected,
    clientId,
  } = useMultiplayerModel(() => {
    const profile: Profile = initialProfile
    const peers: Presence[] = []
    const activity: Activity[] = []
    const connected: boolean = false
    const clientId: `${string}-${string}-${string}-${string}-${string}` = (() =>
      crypto.randomUUID())()
    return { profile, peers, activity, connected, clientId }
  })

  const latest = useRef<LiveState>({
    clientId,
    camera: null,
    following: null,
    boardId: null as string | null,
    view: 'canvas' as const,
    cursor: null as { x: number; y: number } | null,
    selected: [] as string[],
    selectedEdges: [] as string[],
    dragging: [] as DragPosition[],
    sequence: 0,
    requirement: null as RequirementPresence | null,
  })
  const transport = useRef<'pending' | 'local' | 'websocket'>('pending')
  const streamConnected = useRef(false)
  const live = useRef<Awaited<ReturnType<typeof openLiveChannel>>>(null)
  const lastSent = useRef(0)
  const pendingPresence = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const sendPresence = useCallback(
    (changes: Partial<typeof latest.current>, force = false) => {
      latest.current = { ...latest.current, ...changes }
      clearTimeout(pendingPresence.current)
      const send = () => {
        lastSent.current = Date.now()
        latest.current.sequence = (latest.current.sequence || 0) + 1
        if (transport.current === 'websocket') {
          void live.current?.send(latest.current).catch(() => {})
        } else if (transport.current === 'local') {
          void request('/api/presence', {
            method: 'POST',
            headers: {
              ...workspaceHeaders(workspaceId),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(latest.current),
          }).catch(() => {})
        }
      }
      const delay =
        (transport.current === 'websocket' ? 50 : 90) -
        (Date.now() - lastSent.current)
      if (!force && delay > 0) pendingPresence.current = setTimeout(send, delay)
      else send()
    },
    [workspaceId],
  )
  useEffect(() => {
    const task = runSaga({}, connectLiveSession, {
      workspaceId,
      clientId,
      read: () => latest.current,
      peers: setPeers,
      connected: setConnected,
      ready: (session) => {
        live.current = session
        transport.current = session ? 'websocket' : 'local'
        if (!session) setConnected(streamConnected.current)
        sendPresence({}, true)
      },
    })
    return () => {
      task.cancel()
      live.current = null
      transport.current = 'pending'
    }
  }, [workspaceId, clientId, sendPresence, setPeers, setConnected])
  useEffect(() => {
    // Profile edits receive a fresh server-attested identity, never a claimed
    // name/avatar supplied in an ordinary cursor packet.
    if (profile !== initialProfile) void live.current?.refresh()
  }, [profile, initialProfile])
  useEffect(() => {
    const controller = new AbortController()
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const handle = (event: string, raw: string) => {
      if (event === 'workspace') receive(JSON.parse(raw))
      if (event === 'activity') setActivity(JSON.parse(raw))
      if (event === 'presence' && transport.current === 'local') {
        const present = JSON.parse(raw) as Presence[]
        setPeers(present.filter((p) => p.clientId !== clientId))
        const me = present.find((p) => p.profile.id === initialProfile.id)
        if (me) setProfile(me.profile)
      }
    }
    const connect = async () => {
      try {
        const response = await apiFetch(`/api/events?clientId=${clientId}`, {
          headers: { ...authHeaders(), ...workspaceHeaders(workspaceId) },
          signal: controller.signal,
        })
        if (!response.ok || !response.body)
          throw new Error('Live connection unavailable')
        streamConnected.current = true
        if (transport.current === 'local') setConnected(true)
        sendPresence({}, true)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const chunk = await reader.read()
          if (chunk.done) break
          buffer += decoder.decode(chunk.value, { stream: true })
          let boundary = buffer.indexOf('\n\n')
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            const event = block
              .split('\n')
              .find((line) => line.startsWith('event: '))
              ?.slice(7)
            const data = block
              .split('\n')
              .find((line) => line.startsWith('data: '))
              ?.slice(6)
            if (event && data) handle(event, data)
            boundary = buffer.indexOf('\n\n')
          }
        }
      } catch {
        /* Reconnect and receive a fresh authoritative snapshot. */
      }
      if (!controller.signal.aborted) {
        streamConnected.current = false
        if (transport.current === 'local') {
          setConnected(false)
          setPeers([])
        }
        retryTimer = setTimeout(() => void connect(), 500)
      }
    }
    void connect()
    const heartbeat = setInterval(
      () =>
        sendPresence(
          { cursor: document.hidden ? null : latest.current.cursor },
          true,
        ),
      10000,
    )
    const hide = () => {
      if (document.hidden) sendPresence({ cursor: null }, true)
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      controller.abort()
      clearTimeout(retryTimer)
      clearInterval(heartbeat)
      clearTimeout(pendingPresence.current)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [
    clientId,
    initialProfile.id,
    receive,
    sendPresence,
    setActivity,
    setConnected,
    setPeers,
    setProfile,
    workspaceId,
  ])
  return {
    profile,
    setProfile,
    peers,
    activity,
    connected,
    clientId,
    sendPresence,
  }
}
