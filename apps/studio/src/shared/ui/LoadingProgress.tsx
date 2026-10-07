import type { LoadingProgressProps } from '../types/loadingProgressProps.ts'
import './loadingProgress.css'

export function LoadingProgress({
  label,
  completed,
  total,
}: LoadingProgressProps) {
  const value = Math.max(0, Math.min(total, completed))
  return (
    <div className="loading-steps">
      <progress
        className="loading-progress"
        aria-label={label}
        value={value}
        max={total}
      />
      <span role="status">{label}</span>
    </div>
  )
}
