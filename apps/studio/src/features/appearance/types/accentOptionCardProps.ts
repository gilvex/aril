import type { accentOptions } from '@/shared/config/accentOptions.ts'
export interface AccentOptionCardProps {
  option: (typeof accentOptions)[number]
  selected: boolean
}
