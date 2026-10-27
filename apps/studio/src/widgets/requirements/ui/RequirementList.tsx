import { Text } from '@/shared/ui/Text.tsx'
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
        <Text as="span">{t('Requirement')}</Text>
        <Text as="span">{t('Priority')}</Text>
        <Text as="span">{t('Status')}</Text>
      </div>
      {results.map((r) => (
        <button
          key={r.id}
          className={`requirement-row ${r.id === selected ? 'active' : ''}`}
          aria-label={`${r.id} ${r.title}`}
          aria-pressed={r.id === selected}
          onClick={() => selectRequirement(r.id)}
        >
          <Text as="span" className="requirement-main">
            <Text as="span" className="requirement-id">
              {r.id}
            </Text>
            <Text as="span">
              <Text as="strong">{r.title}</Text>
              <Text as="small">{t(r.category)}</Text>
            </Text>
          </Text>
          <Text
            as="span"
            className={`priority ${r.priority === 'Must have' ? 'must' : ''}`}
          >
            <span />
            {t(r.priority)}
          </Text>
          <Text
            as="span"
            className={`requirement-status ${r.status.toLowerCase()}`}
          >
            {r.status === 'Ready' ? (
              <Check size={13} />
            ) : (
              <span className="small-dot" />
            )}
            {t(r.status)}
          </Text>
          <RequirementPeople
            people={peopleFor(r.id)}
            currentUserId={profile.id}
          />
        </button>
      ))}
      {!results.length && (
        <div className="empty-message">
          <Search size={28} />
          <Text as="h3">{t('No matching requirements')}</Text>
          <Text as="p">
            {t('Try another search or add a new requirement.')}
          </Text>
        </div>
      )}
    </div>
  )
}
