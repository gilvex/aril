import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from 'vagabond-ui/drawer'
import { Fridge, FridgeContent } from 'vagabond-ui/fridge'
import type { StudioDrawerProps } from '../types/studioDrawerProps.ts'
import './studioDrawer.css'
import { useCallback } from 'react'

/** Vagabond owns gestures, animation, focus, scroll locking and dismissal. */
export function StudioDrawer({
  open,
  onOpenChange,
  title,
  children,
  trigger,
  className = '',
  side = false,
  modal = true,
  keepOpenOnInteract = false,
}: StudioDrawerProps) {
  const Root = side ? Fridge : Drawer
  const Content = side ? FridgeContent : DrawerContent
  const interactOutside = useCallback(
    (event: Event) => {
      const target = (event as CustomEvent<{ originalEvent: Event }>).detail
        ?.originalEvent.target
      if (target instanceof Element && target.closest('[data-drawer-dismiss]'))
        return
      if (keepOpenOnInteract) event.preventDefault()
    },
    [keepOpenOnInteract],
  )
  return (
    <Root open={open} onOpenChange={onOpenChange} modal={modal}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <Content
        container={(document.fullscreenElement as HTMLElement) || undefined}
        className={`studio-drawer ${className}`}
        overlayClassName="studio-drawer-overlay"
        showCloseButton={false}
        onInteractOutside={interactOutside}
        aria-describedby={undefined}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <div className="studio-drawer-body">{children}</div>
      </Content>
    </Root>
  )
}
