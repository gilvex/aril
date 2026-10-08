import type { Workspace, RequirementLink } from '@pomegranate/domain/workspace'
import type { ScopeTarget } from '../types/scopeTarget.ts'
import { scopeTargetKey } from './scopeTargetKey.ts'
export function scopeTargets(workspace: Workspace): ScopeTarget[] {
  const targets: ScopeTarget[] = []
  const add = (link: RequirementLink, label: string, context: string) =>
    targets.push({ ...link, key: scopeTargetKey(link), label, context })
  for (const board of workspace.boards) {
    const sections = board.sections || ['canvas', 'wireframes']
    if (sections.includes('canvas'))
      add({ kind: 'canvas', boardId: board.id }, board.name, 'Blueprint')
    if (sections.includes('wireframes'))
      add({ kind: 'wireframes', boardId: board.id }, board.name, 'Wireframes')
    if (sections.includes('design'))
      for (const page of board.design?.pages || [])
        add(
          { kind: 'design', boardId: board.id, pageId: page.id },
          page.name,
          board.name,
        )
  }
  for (const page of workspace.design.pages || [])
    add({ kind: 'design', pageId: page.id }, page.name, 'Design')
  return targets
}
