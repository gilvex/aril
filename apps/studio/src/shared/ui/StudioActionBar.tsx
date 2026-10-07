import { ActionBar } from 'vagabond-ui/action-bar'
import type { StudioActionBarProps } from '../types/studioActionBarProps.ts'
import './studioActionBar.css'

/** Keep the library toolbar inside the active canvas, including fullscreen. */
export function StudioActionBar({
  className = '',
  ...props
}: StudioActionBarProps) {
  return (
    <ActionBar
      open
      closeOnEscape={false}
      position="inline"
      portalled={false}
      positionerClassName="studio-action-bar-positioner"
      className={`studio-action-bar ${className}`}
      {...props}
    />
  )
}
