import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { ArrowLeft, Check, Trash2, X } from 'lucide-react'
import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useRequirementDetailsHandlers } from '../model/useRequirementDetailsHandlers.tsx'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
import { RequirementAvatars } from './RequirementAvatars.tsx'
import { RequirementProperties } from './RequirementProperties.tsx'
import { RequirementLinks } from './RequirementLinks.tsx'
export function RequirementDetails(props: RequirementDetailsProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const {
    current,
    selectRequirement,
    peopleFor,
    profile,
    fieldProps,
    fieldHint,
    update,
  } = props
  const { handleClick: remove } = useRequirementDetailsHandlers(props)
  const edit = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      update({
        [event.target.name]:
          event.target.name === 'title'
            ? event.target.value || 'Untitled requirement'
            : event.target.value,
      }),
    [update],
  )
  return (
    <div className="req-document">
      <header className="req-document-header">
        <button
          className="button subtle req-back"
          onClick={() => selectRequirement(null)}
        >
          <ArrowLeft size={16} />
          {t('Back to requirements')}
        </button>
        <span>{current.id}</span>
        <RequirementAvatars
          people={peopleFor(current.id)}
          currentUserId={profile.id}
        />
        <button
          className="icon-button"
          aria-label={t('Close requirement')}
          onClick={() => selectRequirement(null)}
        >
          <X size={17} />
        </button>
      </header>
      <label className="req-document-title">
        <span className="visually-hidden">{t('Requirement title')}</span>
        <textarea
          readOnly={readOnly}
          name="title"
          aria-label={t('Requirement title')}
          {...fieldProps('title')}
          value={current.title}
          maxLength={160}
          rows={2}
          onChange={edit}
        />
        {fieldHint('title')}
      </label>
      <RequirementProperties {...props} />
      <label className="req-document-field">
        <span>{t('Problem')}</span>
        {fieldHint('description')}
        <textarea
          readOnly={readOnly}
          name="description"
          aria-label={t('Requirement description')}
          {...fieldProps('description')}
          value={current.description}
          maxLength={5000}
          rows={4}
          placeholder={t('Describe the problem this solves…')}
          onChange={edit}
        />
      </label>
      <label className="req-document-field">
        <span>{t('Acceptance criteria')}</span>
        {fieldHint('acceptance')}
        <textarea
          readOnly={readOnly}
          name="acceptance"
          aria-label={t('Acceptance criteria')}
          {...fieldProps('acceptance')}
          value={current.acceptance}
          maxLength={5000}
          rows={5}
          placeholder={t('Describe the outcomes needed to call this ready…')}
          onChange={edit}
        />
      </label>
      <RequirementLinks {...props} />
      <footer className="req-document-footer">
        <span>
          <Check size={14} />
          {t('Changes save automatically')}
        </span>
        <button
          className="icon-button"
          aria-label={t('Delete requirement')}
          title={t('Delete requirement')}
          disabled={readOnly}
          onClick={remove}
        >
          <Trash2 size={15} />
        </button>
      </footer>
    </div>
  )
}
