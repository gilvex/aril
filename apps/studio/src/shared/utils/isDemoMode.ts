import { isProductSiteEnabled } from '@/shared/deploymentSettings/index.ts'
export function isDemoMode(
  search = (globalThis as { location?: { search: string } }).location?.search ||
    '',
) {
  return (
    isProductSiteEnabled() && new URLSearchParams(search).get('demo') === '1'
  )
}
