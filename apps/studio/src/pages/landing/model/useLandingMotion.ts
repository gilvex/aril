import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createLandingMotionModel } from './createLandingMotionModel.ts'

export function useLandingMotion() {
  const surface = useRef<HTMLDivElement>(null)
  const modelRef = useRef<ReturnType<typeof createLandingMotionModel> | null>(
    null,
  )
  if (!modelRef.current) {
    modelRef.current = createLandingMotionModel({
      paused: false,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      pageVisible: document.visibilityState === 'visible',
      inView: true,
    })
  }
  const model = modelRef.current
  const state = useSyncExternalStore(model.subscribe, model.getSnapshot)
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () =>
      model.updateEnvironment({ reducedMotion: preference.matches })
    const updateVisibility = () =>
      model.updateEnvironment({
        pageVisible: document.visibilityState === 'visible',
      })
    const observer = new IntersectionObserver(([entry]) =>
      model.updateEnvironment({ inView: entry.isIntersecting }),
    )
    if (surface.current) observer.observe(surface.current)
    preference.addEventListener('change', updatePreference)
    document.addEventListener('visibilitychange', updateVisibility)
    updatePreference()
    updateVisibility()
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [model])
  return {
    surface,
    paused: state.paused,
    reducedMotion: state.reducedMotion,
    playing:
      !state.paused &&
      !state.reducedMotion &&
      state.inView &&
      state.pageVisible,
    togglePaused: model.togglePaused,
  }
}
