import type { LoadingStatusProps } from '../types/loadingStatusProps.ts'
import { Spinner } from './Spinner.tsx'
import './loadingProgress.css'

export function LoadingStatus({ label, centered = false }: LoadingStatusProps) {
  return (
    <div
      className={'loading-status' + (centered ? ' is-centered' : '')}
      role="status"
    >
      <Spinner />
      <span>{label}</span>
    </div>
  )
}
