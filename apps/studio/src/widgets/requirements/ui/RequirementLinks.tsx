import { useCallback, useMemo, type ChangeEvent } from 'react'
import { ArrowUpRight, Workflow } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
export function RequirementLinks({
  workspace,
  current,
  openBoard,
  change,
}: RequirementDetailsProps) {
  const { t } = useTranslation()
  const linked = useMemo(
    () =>
      workspace.boards.filter((board) =>
        board.nodes.some((node) => node.data.requirements.includes(current.id)),
      ),
    [workspace.boards, current.id],
  )
  const link = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const [boardId, nodeId] = JSON.parse(event.target.value) as [
        string,
        string,
      ]
      change((w) => ({
        ...w,
        boards: w.boards.map((board) =>
          board.id !== boardId
            ? board
            : {
                ...board,
                nodes: board.nodes.map((node) =>
                  node.id !== nodeId ||
                  node.data.requirements.includes(current.id)
                    ? node
                    : {
                        ...node,
                        data: {
                          ...node.data,
                          requirements: [...node.data.requirements, current.id],
                        },
                      },
                ),
              },
        ),
      }))
    },
    [change, current.id],
  )
  return (
    <section className="req-links">
      <h3>{t('Linked boards')}</h3>
      {linked.map((board) => (
        <button
          className="req-board-link"
          key={board.id}
          onClick={() => openBoard(board.id)}
        >
          <Workflow size={18} />
          <span>
            <strong>{board.name}</strong>
            <small>
              {board.nodes
                .filter((node) => node.data.requirements.includes(current.id))
                .map((node) => node.data.title)
                .join(', ')}
            </small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      ))}
      {!linked.length && <p>{t('No linked boards yet')}</p>}
      <label className="req-link-picker">
        <span>{t('Link to a blueprint node')}</span>
        <select
          aria-label={t('Link to a blueprint node')}
          value=""
          onChange={link}
        >
          <option value="" disabled>
            {t('Choose a node…')}
          </option>
          {workspace.boards.map((board) => (
            <optgroup label={board.name} key={board.id}>
              {board.nodes
                .filter((node) => !node.data.requirements.includes(current.id))
                .map((node) => (
                  <option
                    key={node.id}
                    value={JSON.stringify([board.id, node.id])}
                  >
                    {node.data.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
    </section>
  )
}
