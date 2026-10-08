import { useCallback, useSyncExternalStore, type RefObject } from 'react'
export function useNoteGeometry(ref: RefObject<HTMLElement | null>) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const element = ref.current
      if (!element) return () => {}
      const observer = new ResizeObserver(notify)
      observer.observe(element)
      element.addEventListener('scroll', notify)
      return () => {
        observer.disconnect()
        element.removeEventListener('scroll', notify)
      }
    },
    [ref],
  )
  const read = useCallback(() => {
    const element = ref.current
    return element
      ? `${element.clientWidth},${element.scrollHeight},${element.scrollTop}`
      : '0,0,0'
  }, [ref])
  return useSyncExternalStore(subscribe, read).split(',').map(Number)
}
