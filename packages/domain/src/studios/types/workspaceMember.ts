import type { Profile } from '../../collaboration/index.ts'
import type { StudioSummary } from './studioSummary.ts'
export type WorkspaceMember = Profile & { role: StudioSummary['role'] }
