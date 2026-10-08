import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { BoardScopeProps } from '../types/boardScopeProps.ts'
export function BoardScope({
  board,
  requirements,
  openRequirement,
}: BoardScopeProps) {
  const { t } = useTranslation()
  const linked = useMemo(() => {
    const ids = new Set(board.nodes.flatMap((node) => node.data.requirements))
    return requirements.filter(
      (item) =>
        ids.has(item.id) ||
        item.workspaceWide ||
        item.links?.some((link) => link.boardId === board.id),
    )
  }, [board.id, board.nodes, requirements])
  return (
    <section className="board-overview-section">
      <h3>
        {t('Scope')}
        <span>{linked.length}</span>
      </h3>
      <div className="board-overview-list">
        {linked.map((item) => (
          <button key={item.id} onClick={() => openRequirement(item.id)}>
            <small>{item.id}</small>
            <span>{item.title}</span>
            <ChevronRight size={14} />
          </button>
        ))}
        {!linked.length && (
          <p>{t('Connect requirements from Scope or a node’s details.')}</p>
        )}
      </div>
    </section>
  )
}
