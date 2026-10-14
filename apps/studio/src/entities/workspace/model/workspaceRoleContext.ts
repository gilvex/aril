import { createContext } from 'react'
import type { StudioSummary } from '@aril/domain/studios'
export const WorkspaceRoleContext = createContext<StudioSummary['role'] | null>(
  'member',
)
