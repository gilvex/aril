import { useTranslation } from '@/shared/i18n/index.ts'
import { RequirementPeople } from '@/widgets/requirements/ui/RequirementPeople.tsx'
import { Check, Search } from 'lucide-react'

import type { RequirementListProps } from '../types/requirementListProps.ts'
export function RequirementList({
  results,
  selected,
  selectRequirement,
  peopleFor,
  profile,
}: RequirementListProps) {
  const { t } = useTranslation()

  return (
    <div className="requirements-list">
      <div className="requirement-table-head">
        <span>{t('Requirement')}</span>
        <span>{t('Priority')}</span>
        <span>{t('Status')}</span>
      </div>
      {results.map((r) => (
        <button
          key={r.id}
          className={`requirement-row ${r.id === selected ? 'active' : ''}`}
          aria-label={`${r.id} ${r.title}`}
          aria-pressed={r.id === selected}
          onClick={() => selectRequirement(r.id)}
        >
          <span className="requirement-main">
            <span className="requirement-id">{r.id}</span>
            <span>
              <strong>{r.title}</strong>
              <small>{t(r.category)}</small>
            </span>
          </span>
          <span
            className={`priority ${r.priority === 'Must have' ? 'must' : ''}`}
          >
            <span />
            {t(r.priority)}
          </span>
          <span className={`requirement-status ${r.status.toLowerCase()}`}>
            {r.status === 'Ready' ? (
              <Check size={13} />
            ) : (
              <span className="small-dot" />
            )}
            {t(r.status)}
          </span>
          <RequirementPeople
            people={peopleFor(r.id)}
            currentUserId={profile.id}
          />
        </button>
      ))}
      {!results.length && (
        <div className="empty-message">
          <Search size={28} />
          <h3>{t('No matching requirements')}</h3>
          <p>{t('Try another search or add a new requirement.')}</p>
        </div>
      )}
    </div>
  )
}
