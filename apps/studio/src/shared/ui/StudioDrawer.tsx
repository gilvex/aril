import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from 'vagabond-ui/drawer'
import { Fridge, FridgeContent } from 'vagabond-ui/fridge'
import type { StudioDrawerProps } from '../types/studioDrawerProps.ts'
import './studioDrawer.css'

/** Vagabond owns gestures, animation, focus, scroll locking and dismissal. */
export function StudioDrawer({
  open,
  onOpenChange,
  title,
  children,
  trigger,
  className = '',
  side = false,
}: StudioDrawerProps) {
  const Root = side ? Fridge : Drawer
  const Content = side ? FridgeContent : DrawerContent
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <Content
        container={(document.fullscreenElement as HTMLElement) || undefined}
        className={`studio-drawer ${className}`}
        overlayClassName="studio-drawer-overlay"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <div className="studio-drawer-body">{children}</div>
      </Content>
    </Root>
  )
}
