import type { MouseEventHandler } from 'react'
import type { GuestLink } from './guestLink.ts'

export interface GuestLinkListProps {
  links: GuestLink[]
  busy: boolean
  revoke: MouseEventHandler<HTMLButtonElement>
}
