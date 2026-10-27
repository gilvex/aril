import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
import { ScopeQuestion } from './ScopeQuestion.tsx'
export function ScopeQuestions({ current, update }: RequirementDetailsProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const add = useCallback(
    () =>
      update({
        questions: [
          ...(current.questions || []),
          { id: crypto.randomUUID(), text: t('New question'), resolved: false },
        ],
      }),
    [current.questions, update, t],
  )
  return (
    <section className="scope-questions">
      <header>
        <h3>{t('Open questions')}</h3>
        <button
          className="icon-button"
          disabled={readOnly || (current.questions?.length || 0) >= 50}
          aria-label={t('Add question')}
          onClick={add}
        >
          <Plus size={16} />
        </button>
      </header>
      {!current.questions?.length && (
        <p>{t('Capture anything that still needs a decision.')}</p>
      )}
      {current.questions?.map((question) => (
        <ScopeQuestion
          key={question.id}
          question={question}
          current={current}
          update={update}
        />
      ))}
    </section>
  )
}
