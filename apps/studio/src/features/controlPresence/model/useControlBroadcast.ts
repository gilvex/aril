import { useEffect } from 'react'
import type { ControlPresence } from '@pomegranate/domain/collaboration'
import type { ControlPresenceProps } from '../types/controlPresenceProps.ts'
import { controlAddress } from '../utils/controlAddress.ts'
import { controlFingerprint } from '../utils/controlFingerprint.ts'
import { resolveControlFocus } from '../utils/resolveControlFocus.ts'
export function useControlBroadcast({
  root,
  active,
  route,
  sendPresence,
}: ControlPresenceProps) {
  useEffect(() => {
    const container = root.current
    if (!active || !container) return
    let pointer: ControlPresence['pointer'] = null
    let frame = 0
    const belongs = (element: Element) =>
      container.contains(element) ||
      (!!element.closest('[data-collaboration-scope]') &&
        !element.closest('[data-collaboration-root]'))
    const publish = () => {
      frame = 0
      if (document.hidden) {
        sendPresence({ controls: null }, true)
        return
      }
      const element = resolveControlFocus(document.activeElement)
      let focus: ControlPresence['focus'] = null
      if (
        element instanceof HTMLElement &&
        belongs(element) &&
        element.closest('[data-collaboration-scope]') &&
        !element.closest('.note-surface') &&
        !element.matches(
          'input[type="password"],input[type="file"],input[type="hidden"]',
        )
      ) {
        const address = controlAddress(element, container)
        if (address) {
          const text =
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
          focus = {
            ...address,
            selection:
              text &&
              element.selectionStart !== null &&
              element.selectionEnd !== null
                ? {
                    start: element.selectionStart,
                    end: element.selectionEnd,
                    fingerprint: controlFingerprint(element.value),
                  }
                : null,
          }
        }
      }
      sendPresence({ controls: { route, pointer, focus } })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(publish)
    }
    const move = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null
      pointer = null
      if (
        element &&
        belongs(element) &&
        !element.closest('.note-surface') &&
        (!element.closest('.react-flow') ||
          element.closest('[data-collaboration-scope]'))
      ) {
        const target =
          element.closest<HTMLElement>(
            'input,textarea,select,button,[role="combobox"],[data-collaboration-scope]',
          ) || container
        const address = controlAddress(target, container)
        const bounds = target.getBoundingClientRect()
        if (address && bounds.width && bounds.height)
          pointer = {
            ...address,
            x: Math.max(
              0,
              Math.min(1, (event.clientX - bounds.left) / bounds.width),
            ),
            y: Math.max(
              0,
              Math.min(1, (event.clientY - bounds.top) / bounds.height),
            ),
          }
      }
      schedule()
    }
    const leave = () => {
      pointer = null
      schedule()
    }
    const visibility = () => {
      if (document.hidden) sendPresence({ controls: null }, true)
      else schedule()
    }
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    for (const event of [
      'focusin',
      'focusout',
      'input',
      'select',
      'selectionchange',
    ])
      document.addEventListener(event, schedule, true)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', leave)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      for (const event of [
        'focusin',
        'focusout',
        'input',
        'select',
        'selectionchange',
      ])
        document.removeEventListener(event, schedule, true)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', leave)
      sendPresence({ controls: null }, true)
    }
  }, [root, active, route, sendPresence])
}
