import { useCallback, useMemo, useRef, type MouseEvent } from 'react'
import { ChevronRight, CircleHelp } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { BoardOverviewActions } from './BoardOverviewActions.tsx'
import type { BlueprintOverviewProps } from '../types/blueprintOverviewProps.ts'
import './boardOverview.css'
export function BlueprintOverview(props: BlueprintOverviewProps) {
  const { board, update, requirements, openRequirement, focusNode } = props
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const title = useRef<HTMLInputElement>(null)
  const rename = useCallback(() => {
    title.current?.focus()
    title.current?.select()
  }, [])
  const questions = useMemo(
    () => board.nodes.filter((node) => node.data.status === 'Question'),
    [board.nodes],
  )
  const linked = useMemo(() => {
    const ids = new Set(board.nodes.flatMap((node) => node.data.requirements))
    return requirements.filter((item) => ids.has(item.id))
  }, [board.nodes, requirements])
  const selectQuestion = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const id = event.currentTarget.dataset.id
      if (id) focusNode(id)
    },
    [focusNode],
  )
  const selectRequirement = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const id = event.currentTarget.dataset.id
      if (id) openRequirement(id)
    },
    [openRequirement],
  )
  return (
    <div className="inspector-body board-overview">
      <label>
        {t('Board name')}
        <input
          ref={title}
          value={board.name}
          readOnly={!canEdit}
          maxLength={100}
          onChange={(event) => {
            if (event.target.value.trim())
              update({ ...board, name: event.target.value })
          }}
        />
      </label>
      <label>
        {t('Description')}
        <textarea
          value={board.description}
          readOnly={!canEdit}
          maxLength={1000}
          rows={3}
          onChange={(event) =>
            update({ ...board, description: event.target.value })
          }
        />
      </label>
      <dl className="board-overview-metrics">
        <div>
          <dd>{board.nodes.length}</dd>
          <dt>{t('Nodes')}</dt>
        </div>
        <div>
          <dd>{board.edges.length}</dd>
          <dt>{t('Connections')}</dt>
        </div>
        <div>
          <dd>
            {
              board.nodes.filter((node) => node.data.status === 'Decided')
                .length
            }
          </dd>
          <dt>{t('Decided')}</dt>
        </div>
      </dl>
      <section className="board-overview-section">
        <h3>
          {t('Open questions')}
          <span>{questions.length}</span>
        </h3>
        <div className="board-overview-list">
          {questions.map((node) => (
            <button key={node.id} data-id={node.id} onClick={selectQuestion}>
              <CircleHelp className="question-indicator" size={14} />
              <span>{node.data.title}</span>
              <ChevronRight size={14} />
            </button>
          ))}
          {!questions.length && <p>{t('No open questions on this board.')}</p>}
        </div>
      </section>
      <section className="board-overview-section">
        <h3>
          {t('Linked requirements')}
          <span>{linked.length}</span>
        </h3>
        <div className="board-overview-list">
          {linked.map((item) => (
            <button key={item.id} data-id={item.id} onClick={selectRequirement}>
              <small>{item.id}</small>
              <span>{item.title}</span>
              <ChevronRight size={14} />
            </button>
          ))}
          {!linked.length && (
            <p>{t('Link requirements from a node’s details.')}</p>
          )}
        </div>
      </section>
      <BoardOverviewActions
        {...props}
        rename={rename}
        canEdit={canEdit}
        titleRef={title}
      />
    </div>
  )
}
