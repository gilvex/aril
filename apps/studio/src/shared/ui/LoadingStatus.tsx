import type { LoadingStatusProps } from '../types/loadingStatusProps.ts'
import './loadingProgress.css'

export function LoadingStatus({ label, centered = false }: LoadingStatusProps) {
  return (
    <div
      className={'loading-status' + (centered ? ' is-centered' : '')}
      role="status"
    >
      <div className="loading-progress" role="progressbar" aria-label={label}>
        <span />
      </div>
      <span>{label}</span>
    </div>
  )
}
