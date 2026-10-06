import type { GuestLink } from './guestLink.ts'
export type GuestLinksState = {
  links: GuestLink[]
  name: string
  duration: number
  unit: number
  busy: boolean
  loading: boolean
  error: string
  copied: boolean
}
