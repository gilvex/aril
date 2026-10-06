import { useTranslation } from '@/shared/i18n/index.ts'
import { RequirementPeople } from '@/widgets/requirements/ui/RequirementPeople.tsx'
import { ArrowUpRight, Trash2, X } from 'lucide-react'
import { useRequirementDetailsHandlers } from '../model/useRequirementDetailsHandlers.tsx'

import { RequirementClassification } from './RequirementClassification.tsx'

import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
export function RequirementDetails({
  current,
  selectRequirement,
  peopleFor,
  profile,
  fieldProps,
  update,
  fieldHint,
  workspace,
  openBoard,
  change,
}: RequirementDetailsProps) {
  const { t } = useTranslation()

  const { handleRequirementAreaChange, handleClick } =
    useRequirementDetailsHandlers({
      update,
      change,
      current,
      selectRequirement,
    })
  return (
    <aside className="requirement-detail">
      <div className="inspector-heading">
        <span>{current.id}</span>
        <button
          className="icon-button"
          aria-label={t('Close requirement')}
          onClick={() => selectRequirement(null)}
        >
          <X size={16} />
        </button>
      </div>
      <div className="inspector-body">
        <RequirementPeople
          people={peopleFor(current.id)}
          currentUserId={profile.id}
        />
        <label>
          {t('Requirement')}
          <input
            aria-label={t('Requirement title')}
            {...fieldProps('title')}
            value={current.title}
            maxLength={160}
            onChange={(e) =>
              update({ title: e.target.value || 'Untitled requirement' })
            }
          />
          {fieldHint('title')}
        </label>
        <label>
          {t('The problem')}
          <textarea
            aria-label={t('Requirement description')}
            {...fieldProps('description')}
            rows={5}
            maxLength={5000}
            value={current.description}
            onChange={(e) => update({ description: e.target.value })}
          />
          {fieldHint('description')}
        </label>
        <RequirementClassification
          fieldProps={fieldProps}
          current={current}
          update={update}
          fieldHint={fieldHint}
        />
        <label>
          {t('Area')}
          <select
            {...fieldProps('category')}
            aria-label={t('Requirement area')}
            value={current.category}
            onChange={handleRequirementAreaChange}
          >
            {['Deployment', 'Access', 'Operations', 'Experience'].map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
          {fieldHint('category')}
        </label>
        <label>
          {t('What does success look like?')}
          <textarea
            aria-label={t('Acceptance criteria')}
            {...fieldProps('acceptance')}
            rows={5}
            maxLength={5000}
            value={current.acceptance}
            onChange={(e) => update({ acceptance: e.target.value })}
          />
          {fieldHint('acceptance')}
        </label>
        <div className="field-label">{t('Connected boards')}</div>
        {workspace.boards
          .filter((b) =>
            b.nodes.some((n) => n.data.requirements.includes(current.id)),
          )
          .map((b) => (
            <button
              className="board-link"
              key={b.id}
              onClick={() => openBoard(b.id)}
            >
              {b.name}
              <ArrowUpRight size={14} />
            </button>
          ))}
        <button className="button danger" onClick={handleClick}>
          <Trash2 size={14} />
          {t('Delete requirement')}
        </button>
      </div>
    </aside>
  )
}
