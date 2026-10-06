import { createCollaborationBarState } from '@/widgets/collaboration/model/createCollaborationBarState.ts'
import { useCollaborationBarModel } from '@/widgets/collaboration/model/useCollaborationBarModel.ts'
import { useCallback, useEffect, useRef } from 'react'
import type { UseCollaborationControllerProps } from '../types/useCollaborationControllerProps.ts'
export function useCollaborationController({
  profile,
  peers,
  panel,
  setPanel,
}: UseCollaborationControllerProps) {
  const {
    name,
    setName,
    avatar,
    setAvatar,
    busy,
    setBusy,
    error,
    setError,
    invite,
    setInvite,
    copied,
    setCopied,
  } = useCollaborationBarModel(() => createCollaborationBarState(profile))

  const root = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const people = [
    ...new Map(
      [{ profile, clientId: 'self', view: 'canvas' }, ...peers].map((p) => [
        p.profile.id,
        p,
      ]),
    ).values(),
  ]
  useEffect(() => {
    if (!panel) return
    opener.current = document.activeElement as HTMLElement
    const dialog = root.current?.querySelector<HTMLElement>('[role="dialog"]')
    dialog?.querySelector<HTMLElement>('input,button')?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanel(null)
        opener.current?.focus()
      }
      if (event.key === 'Tab' && dialog) {
        const fields = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input,textarea',
          ),
        )
        if (event.shiftKey && document.activeElement === fields[0]) {
          event.preventDefault()
          fields.at(-1)?.focus()
        } else if (
          !event.shiftKey &&
          document.activeElement === fields.at(-1)
        ) {
          event.preventDefault()
          fields[0]?.focus()
        }
      }
    }
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setPanel(null)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', outside)
    }
  }, [panel, setPanel])
  const open = useCallback(
    (next: typeof panel) => {
      opener.current = document.activeElement as HTMLElement
      setError('')
      setCopied(false)
      if (next === 'profile') {
        setName(profile.name)
        setAvatar(profile.avatar)
      }
      setPanel(panel === next ? null : next)
    },
    [panel, opener, setError, setCopied, setName, profile, setAvatar, setPanel],
  )
  return {
    root,
    people,
    open,
    opener,
    setBusy,
    setError,
    name,
    setAvatar,
    avatar,
    setName,
    busy,
    setInvite,
    setCopied,
    invite,
    copied,
    error,
  }
}
