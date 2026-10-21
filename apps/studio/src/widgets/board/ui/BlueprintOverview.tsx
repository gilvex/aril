import { Text } from '@/shared/ui/Text.tsx'
import { BoardScope } from './BoardScope.tsx'
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
  const selectQuestion = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const id = event.currentTarget.dataset.id
      if (id) focusNode(id)
    },
    [focusNode],
  )
  return (
    <div className="inspector-body board-overview">
      <Text as="label">
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
      </Text>
      <Text as="label">
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
      </Text>
      <dl className="board-overview-metrics">
        <div>
          <Text as="dd">{board.nodes.length}</Text>
          <Text as="dt">{t('Nodes')}</Text>
        </div>
        <div>
          <Text as="dd">{board.edges.length}</Text>
          <Text as="dt">{t('Connections')}</Text>
        </div>
        <div>
          <Text as="dd">
            {
              board.nodes.filter((node) => node.data.status === 'Decided')
                .length
            }
          </Text>
          <Text as="dt">{t('Decided')}</Text>
        </div>
      </dl>
      <section className="board-overview-section">
        <Text as="h3">
          {t('Open questions')}
          <Text as="span">{questions.length}</Text>
        </Text>
        <div className="board-overview-list">
          {questions.map((node) => (
            <button key={node.id} data-id={node.id} onClick={selectQuestion}>
              <CircleHelp className="question-indicator" size={14} />
              <Text as="span">{node.data.title}</Text>
              <ChevronRight size={14} />
            </button>
          ))}
          {!questions.length && (
            <Text as="p">{t('No open questions on this board.')}</Text>
          )}
        </div>
      </section>
      <BoardScope
        board={board}
        requirements={requirements}
        openRequirement={openRequirement}
      />
      <BoardOverviewActions
        {...props}
        rename={rename}
        canEdit={canEdit}
        titleRef={title}
      />
    </div>
  )
}
