import type { Workspace, Requirement } from '@pomegranate/domain/workspace'
import { scopeBoards } from './scopeBoards.ts'
import { scopeTargets } from './scopeTargets.ts'
import { scopeTargetKey } from './scopeTargetKey.ts'
export function collectScope(
  workspace: Workspace,
  results: Requirement[],
  boardFilter: string,
  scopeFilter: 'all' | 'decision' | 'unlinked',
) {
  const targets = new Set(scopeTargets(workspace).map((target) => target.key))
  const rows = results
    .map((item) => ({
      item,
      boards: scopeBoards(workspace, item),
      needsDecision:
        !item.decision ||
        item.decision === 'Proposed' ||
        !!item.questions?.some((q) => !q.resolved),
      linked:
        !!item.workspaceWide ||
        workspace.boards.some((board) =>
          board.nodes.some((node) => node.data.requirements.includes(item.id)),
        ) ||
        !!item.links?.some((link) => targets.has(scopeTargetKey(link))),
    }))
    .filter(
      (row) =>
        !boardFilter ||
        (boardFilter === 'workspace'
          ? row.item.workspaceWide || (!row.boards.length && row.linked)
          : row.boards.some((board) => board.id === boardFilter)),
    )
  const counts = {
    all: rows.length,
    decision: rows.filter((row) => row.needsDecision).length,
    unlinked: rows.filter((row) => !row.linked).length,
  }
  const visible = rows.filter(
    (row) =>
      scopeFilter === 'all' ||
      (scopeFilter === 'decision' ? row.needsDecision : !row.linked),
  )
  const groups = workspace.boards.map((board) => ({
    id: board.id,
    name: board.name,
    rows: visible.filter((row) => row.boards.some((b) => b.id === board.id)),
  }))
  groups.push({
    id: 'workspace',
    name: 'Workspace-wide',
    rows: visible.filter(
      (row) => row.item.workspaceWide || (!row.boards.length && row.linked),
    ),
  })
  groups.push({
    id: 'unlinked',
    name: 'Not linked yet',
    rows: visible.filter((row) => !row.linked),
  })
  return {
    counts,
    groups: groups.filter(
      (group) =>
        group.rows.length && (!boardFilter || group.id === boardFilter),
    ),
    visibleCount: visible.length,
  }
}
