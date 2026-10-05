import { useCallback, useEffect, useRef, useState } from 'react'
import {
  request,
  authHeaders,
  workspaceHeaders,
  type Envelope,
} from '../../../shared/api/workspace'
import type {
  Activity,
  Presence,
  Profile,
  DragPosition,
  RequirementPresence,
} from '../../../../domain/collaboration'

export function useMultiplayer(
  initialProfile: Profile,
  receive: (value: Envelope) => void,
  workspaceId: string,
) {
  const [profile, setProfile] = useState(initialProfile)
  const [peers, setPeers] = useState<Presence[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [connected, setConnected] = useState(false)
  const [clientId] = useState(() => crypto.randomUUID())
  const latest = useRef({
    clientId,
    boardId: null as string | null,
    view: 'canvas',
    cursor: null as { x: number; y: number } | null,
    selected: [] as string[],
    selectedEdges: [] as string[],
    dragging: [] as DragPosition[],
    sequence: 0,
    requirement: null as RequirementPresence | null,
  })
  const lastSent = useRef(0)
  const pendingPresence = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const sendPresence = useCallback(
    (changes: Partial<typeof latest.current>, force = false) => {
      latest.current = { ...latest.current, ...changes }
      clearTimeout(pendingPresence.current)
      if (!force && Date.now() - lastSent.current < 90) {
        pendingPresence.current = setTimeout(
          () => {
            lastSent.current = Date.now()
            latest.current.sequence++
            void request('/api/presence', {
              method: 'POST',
              headers: {
                ...workspaceHeaders(workspaceId),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(latest.current),
            }).catch(() => {})
          },
          90 - (Date.now() - lastSent.current),
        )
        return
      }
      lastSent.current = Date.now()
      latest.current.sequence++
      void request('/api/presence', {
        method: 'POST',
        headers: {
          ...workspaceHeaders(workspaceId),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(latest.current),
      }).catch(() => {})
    },
    [workspaceId],
  )
  useEffect(() => {
    const controller = new AbortController()
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const handle = (event: string, raw: string) => {
      if (event === 'workspace') receive(JSON.parse(raw))
      if (event === 'activity') setActivity(JSON.parse(raw))
      if (event === 'presence') {
        const present = JSON.parse(raw) as Presence[]
        setPeers(present.filter((p) => p.clientId !== clientId))
        const me = present.find((p) => p.profile.id === initialProfile.id)
        if (me) setProfile(me.profile)
      }
    }
    const connect = async () => {
      try {
        const response = await fetch(`/api/events?clientId=${clientId}`, {
          headers: { ...authHeaders(), ...workspaceHeaders(workspaceId) },
          signal: controller.signal,
        })
        if (!response.ok || !response.body)
          throw new Error('Live connection unavailable')
        setConnected(true)
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
        setConnected(false)
        setPeers([])
        retryTimer = setTimeout(() => void connect(), 2000)
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
  }, [clientId, initialProfile.id, receive, sendPresence, workspaceId])
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
