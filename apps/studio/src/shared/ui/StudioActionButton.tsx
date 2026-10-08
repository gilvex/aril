import { ActionBarButton } from 'vagabond-ui/action-bar'
import type { ButtonProps } from 'vagabond-ui/button'
import './studioActionButton.css'

export function StudioActionButton({
  className = '',
  variant = 'ghost',
  ...props
}: ButtonProps) {
  return (
    <ActionBarButton
      variant={variant}
      size="icon"
      data-variant={variant}
      className={`studio-action-button ${className}`}
      {...props}
    />
  )
}
