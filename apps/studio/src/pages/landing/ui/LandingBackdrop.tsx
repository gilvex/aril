import { LandingWaveField } from './LandingWaveField.tsx'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLandingMotion } from '../model/useLandingMotion.ts'
import './landingMotion.css'

export function LandingBackdrop() {
  const { t } = useTranslation()
  const { surface, paused, reducedMotion, playing, togglePaused } =
    useLandingMotion()
  const label = t(
    paused ? 'Resume background animation' : 'Pause background animation',
  )
  return (
    <>
      <div
        ref={surface}
        className="landing-backdrop"
        data-playing={playing}
        aria-hidden="true"
      >
        <LandingWaveField />
      </div>
      {!reducedMotion && (
        <button
          className="landing-motion-control"
          type="button"
          onClick={togglePaused}
          aria-label={label}
          title={label}
        >
          {paused ? (
            <Play size={15} aria-hidden="true" />
          ) : (
            <Pause size={15} aria-hidden="true" />
          )}
        </button>
      )}
    </>
  )
}
