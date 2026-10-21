import type { Requirement, Workspace } from '@aril/domain/workspace'
import { activeBoardSections } from '@aril/domain/workspace'
export function scopeBoards(workspace: Workspace, requirement: Requirement) {
  return workspace.boards.filter(
    (board) =>
      board.nodes.some((node) =>
        node.data.requirements.includes(requirement.id),
      ) ||
      requirement.links?.some(
        (link) =>
          link.boardId === board.id &&
          activeBoardSections(board).includes(
            link.kind === 'wireframes' ? 'design' : link.kind,
          ) &&
          (link.kind !== 'design' ||
            !link.pageId ||
            board.design?.pages?.some((page) => page.id === link.pageId)),
      ),
  )
}
