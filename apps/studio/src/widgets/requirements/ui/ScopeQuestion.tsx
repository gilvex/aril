import { useCallback, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { ScopeQuestionProps } from '../types/scopeQuestionProps.ts'
export function ScopeQuestion({
  question,
  current,
  update,
}: ScopeQuestionProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const edit = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      update({
        questions: current.questions?.map((item) =>
          item.id === question.id
            ? { ...item, text: event.target.value }
            : item,
        ),
      }),
    [current.questions, question.id, update],
  )
  const resolve = useCallback(
    () =>
      update({
        questions: current.questions?.map((item) =>
          item.id === question.id
            ? { ...item, resolved: !item.resolved }
            : item,
        ),
      }),
    [current.questions, question.id, update],
  )
  const remove = useCallback(
    () =>
      update({
        questions: current.questions?.filter((item) => item.id !== question.id),
      }),
    [current.questions, question.id, update],
  )
  return (
    <div
      className={'scope-question ' + (question.resolved ? 'is-resolved' : '')}
    >
      <textarea
        name={`question:${question.id}`}
        aria-label={t('Question')}
        readOnly={readOnly}
        value={question.text}
        maxLength={2000}
        rows={2}
        onChange={edit}
      />
      <div>
        <button className="button subtle" disabled={readOnly} onClick={resolve}>
          {t(question.resolved ? 'Reopen' : 'Resolve')}
        </button>
        <button
          className="icon-button"
          disabled={readOnly}
          aria-label={t('Delete question')}
          onClick={remove}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
