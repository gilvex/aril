import { Text } from './Text.tsx'
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
      <Text as="span" role="status">
        {label}
      </Text>
    </div>
  )
}
