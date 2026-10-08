import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import type { Workspace } from '@pomegranate/domain/workspace'
import type { LiveFieldPreview } from '../types/liveFieldPreview.ts'
import { projectLiveFields } from './projectLiveFields.ts'
import { keepViews } from './keepViews.ts'
export function editLiveFields(
  current: Workspace,
  previews: Record<string, LiveFieldPreview>,
  update: (value: Workspace) => Workspace,
) {
  const displayed = projectLiveFields(current, previews)
  const next = update(displayed)
  if (displayed === current) return next
  // Persist only this user's edits, never a peer's transient preview or undo history.
  return keepViews(
    applyOperations(current, diffWorkspace(displayed, next), false),
    next,
  )
}
