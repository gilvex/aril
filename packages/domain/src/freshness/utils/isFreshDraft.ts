import { diffWorkspace } from '../../collaboration/index.ts'
import type { Envelope } from '../../workspace/index.ts'
import { writeVersion } from '../config/writeVersion.ts'
import type { RecoveryDraft } from '../types/recoveryDraft.ts'
export function isFreshDraft(draft: RecoveryDraft, latest: Envelope) {
  return (
    draft.writeVersion === writeVersion &&
    draft.base.revision === latest.revision &&
    diffWorkspace(draft.base.workspace, latest.workspace).length === 0
  )
}
