import type { StudioMobileMenuProps } from './studioMobileMenuProps.ts'
import type { useStudioMobileMenuHandlers } from '../model/useStudioMobileMenuHandlers.tsx'

export interface StudioMobileToolsProps {
  state: StudioMobileMenuProps['state']
  handlers: ReturnType<typeof useStudioMobileMenuHandlers>
}
