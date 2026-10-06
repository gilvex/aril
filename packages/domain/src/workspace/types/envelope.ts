import type { Workspace } from './workspace.ts'
export type Envelope = {
  workspace: Workspace
  revision: number
  savedAt: string
}
