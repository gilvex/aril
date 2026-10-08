import { useMemo, useCallback } from 'react'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
import { scopeTargets } from '../utils/scopeTargets.ts'
import { scopeTargetKey } from '../utils/scopeTargetKey.ts'
export function useScopeLinks({
  workspace,
  current,
  update,
  change,
}: RequirementDetailsProps) {
  const targets = useMemo(() => scopeTargets(workspace), [workspace])
  const linked = useMemo(() => {
    const links = [...(current.links || [])]
    for (const board of workspace.boards)
      if (
        board.nodes.some((node) =>
          node.data.requirements.includes(current.id),
        ) &&
        !links.some(
          (link) => link.kind === 'canvas' && link.boardId === board.id,
        )
      )
        links.push({ kind: 'canvas', boardId: board.id })
    return links.map((link) => ({
      link,
      target: targets.find((target) => target.key === scopeTargetKey(link)),
    }))
  }, [current.links, current.id, workspace.boards, targets])
  const add = useCallback(
    (event: SelectChange) => {
      const target = targets.find((item) => item.key === event.target.value)
      if (
        !target ||
        linked.some(({ link }) => scopeTargetKey(link) === target.key)
      )
        return
      update({
        links: [
          ...(current.links || []),
          { kind: target.kind, boardId: target.boardId, pageId: target.pageId },
        ],
      })
    },
    [targets, current.links, linked, update],
  )
  const remove = useCallback(
    (key: string) => {
      const removed = linked.find(
        ({ link }) => scopeTargetKey(link) === key,
      )?.link
      change((w) => ({
        ...w,
        requirements: w.requirements.map((item) =>
          item.id === current.id
            ? {
                ...item,
                links: item.links?.filter(
                  (link) => scopeTargetKey(link) !== key,
                ),
              }
            : item,
        ),
        boards: w.boards.map((board) =>
          board.id === removed?.boardId && removed.kind === 'canvas'
            ? {
                ...board,
                nodes: board.nodes.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    requirements: node.data.requirements.filter(
                      (id) => id !== current.id,
                    ),
                  },
                })),
              }
            : board,
        ),
      }))
    },
    [change, current.id, linked],
  )
  return { targets, linked, add, remove }
}
