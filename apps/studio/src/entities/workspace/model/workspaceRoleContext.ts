import { createContext } from 'react'
import type { StudioSummary } from '@pomegranate/domain/studios'
export const WorkspaceRoleContext = createContext<StudioSummary['role'] | null>(
  'member',
)
