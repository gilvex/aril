import { useEffect } from 'react'

/** Native scroll feedback only: no wheel interception or React updates. */
export function useScrollIndicators() {
  useEffect(() => {
    const pending = new Map<Element, ReturnType<typeof setTimeout>>()
    const scrolling = (event: Event) => {
      const target =
        event.target === document ? document.scrollingElement : event.target
      if (!(target instanceof Element)) return
      const previous = pending.get(target)
      if (previous) clearTimeout(previous)
      else target.setAttribute('data-scroll-active', '')
      pending.set(
        target,
        setTimeout(() => {
          target.removeAttribute('data-scroll-active')
          pending.delete(target)
        }, 1000),
      )
    }
    document.addEventListener('scroll', scrolling, {
      capture: true,
      passive: true,
    })
    return () => {
      document.removeEventListener('scroll', scrolling, true)
      for (const [target, timer] of pending) {
        clearTimeout(timer)
        target.removeAttribute('data-scroll-active')
      }
    }
  }, [])
}
