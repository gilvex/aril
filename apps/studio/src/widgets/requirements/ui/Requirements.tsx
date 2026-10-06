import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsProps } from '@/widgets/requirements/types/requirementsProps.ts'
import { ListFilter, Search } from 'lucide-react'
import { useRequirementsController } from '../model/useRequirementsController.tsx'
import { RequirementDetails } from './RequirementDetails.tsx'
import { RequirementList } from './RequirementList.tsx'
import { RequirementsHeader } from './RequirementsHeader.tsx'

export function Requirements(props: RequirementsProps) {
  const { t } = useTranslation()

  const {
    workspace,
    change,
    selected,
    onSelect,
    openBoard,
    profile,
    peers,
    sendPresence,
  } = props

  const {
    add,
    query,
    setQuery,
    category,
    setCategory,
    results,
    selectRequirement,
    peopleFor,
    current,
    fieldProps,
    update,
    fieldHint,
  } = useRequirementsController({
    workspace,
    selected,
    onSelect,
    sendPresence,
    peers,
    profile,
    change,
  })
  return (
    <div className="content-page">
      <RequirementsHeader t={t} add={add} />
      <div className="requirements-summary">
        <div>
          <strong>{workspace.requirements.length}</strong>
          <span>{t('requirements captured')}</span>
        </div>
        <div>
          <strong>
            {
              workspace.requirements.filter((r) => r.priority === 'Must have')
                .length
            }
          </strong>
          <span>{t('must-haves')}</span>
        </div>
        <div>
          <strong>
            {workspace.requirements.filter((r) => r.status === 'Ready').length}
          </strong>
          <span>{t('ready for implementation')}</span>
        </div>
        <p>
          {t('Start with the problems.')}
          <br />
          {t('Connect them to the solution.')}
        </p>
      </div>
      <div className="requirements-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            placeholder={t('Find a requirement…')}
            aria-label={t('Search requirements')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="filter-field">
          <ListFilter size={15} />
          <select
            aria-label={t('Filter requirements by area')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              'All areas',
              'Deployment',
              'Access',
              'Operations',
              'Experience',
            ].map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">
          {results.length} {t('results')}
        </span>
      </div>
      <div className="requirements-layout">
        <RequirementList
          results={results}
          selected={selected}
          selectRequirement={selectRequirement}
          peopleFor={peopleFor}
          profile={profile}
        />
        {current && (
          <RequirementDetails
            current={current}
            selectRequirement={selectRequirement}
            peopleFor={peopleFor}
            profile={profile}
            fieldProps={fieldProps}
            update={update}
            fieldHint={fieldHint}
            workspace={workspace}
            openBoard={openBoard}
            change={change}
          />
        )}
      </div>
    </div>
  )
}
