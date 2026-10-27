import type { LoadingSkeletonProps } from '../types/loadingSkeletonProps.ts'
import './loadingProgress.css'

export function LoadingSkeleton({
  label,
  variant = 'rows',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`loading-skeleton loading-skeleton-${variant}`}
      role="status"
      aria-label={label}
    >
      {[0, 1, 2].map((item) => (
        <div className="loading-skeleton-item" key={item} aria-hidden="true">
          <span className="loading-skeleton-thumbnail" />
          <span className="loading-skeleton-lines">
            <i />
            <i />
          </span>
        </div>
      ))}
    </div>
  )
}
