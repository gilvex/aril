import { createSelector } from '@reduxjs/toolkit'
import type { AgentAccessState } from '../../types/agentAccessState.ts'

export const selectAgentAccess = createSelector(
  [(state: AgentAccessState) => state],
  (state) => ({ ...state }),
)
