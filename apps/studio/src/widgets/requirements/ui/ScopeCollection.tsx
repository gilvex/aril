import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { Plus } from 'lucide-react'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { useScopeCollection } from '../model/useScopeCollection.ts'
import { RequirementAvatars } from './RequirementAvatars.tsx'
export function ScopeCollection({ model }: RequirementsViewProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { counts, groups, visibleCount } = useScopeCollection(model)
  const { setViewState } = model
  const selectFilter = useCallback(
    (value: string) => {
      if (value === 'all' || value === 'decision' || value === 'unlinked')
        setViewState({ scopeFilter: value })
    },
    [setViewState],
  )
  return (
    <div className="scope-collection">
      <ToggleGroup
        data-studio-toggle-group
        type="single"
        value={model.scopeFilter}
        onValueChange={selectFilter}
        className="scope-quick-filters"
        aria-label={t('Filter scope')}
      >
        {(['all', 'decision', 'unlinked'] as const).map((filter) => (
          <ToggleGroupItem key={filter} value={filter}>
            <Text>
              {t(
                filter === 'all'
                  ? 'All'
                  : filter === 'decision'
                    ? 'Needs a decision'
                    : 'Unlinked',
              )}
            </Text>
            <Text> </Text>
            <Text as="small">{counts[filter]}</Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="scope-groups">
        {groups.map((group) => (
          <details className="scope-group" key={group.id} open>
            <Text as="summary">
              {group.id === 'workspace' || group.id === 'unlinked'
                ? t(group.name)
                : group.name}
              <Text as="small">{group.rows.length}</Text>
            </Text>
            {group.rows.map(({ item, boards }) => (
              <button
                className={
                  'scope-row ' +
                  (model.selected === item.id ? 'is-selected' : '')
                }
                key={item.id}
                aria-pressed={model.selected === item.id}
                onClick={() => model.selectRequirement(item.id)}
              >
                <Text as="span" className="scope-id">
                  {item.id}
                </Text>
                <Text as="span" className="scope-row-title">
                  <Text as="strong">{item.title}</Text>
                  <Text as="small">
                    {boards.length
                      ? boards.map((board) => board.name).join(', ')
                      : t(
                          item.workspaceWide ? 'Workspace-wide' : item.category,
                        )}
                  </Text>
                </Text>
                <RequirementAvatars
                  people={model.peopleFor(item.id)}
                  currentUserId={model.profile.id}
                />
                <Text
                  as="span"
                  className={
                    'scope-decision decision-' +
                    (item.questions?.some((q) => !q.resolved)
                      ? 'question'
                      : (item.decision || 'Proposed').toLowerCase())
                  }
                >
                  {t(
                    item.questions?.some((q) => !q.resolved)
                      ? 'Needs a decision'
                      : item.decision || 'Proposed',
                  )}
                </Text>
              </button>
            ))}
          </details>
        ))}
        {!visibleCount && (
          <div className="empty-message">
            <Text as="h3">
              {t(
                model.workspace.requirements.length
                  ? 'No matching requirements'
                  : 'Define what this project should achieve',
              )}
            </Text>
            <Text as="p">
              {t('Add an outcome, then connect it to your visual work.')}
            </Text>
            <button className="button" onClick={model.clearFilters}>
              <Text>{t('Clear filters')}</Text>
            </button>
          </div>
        )}
        <button
          className="scope-add"
          disabled={readOnly || model.workspace.requirements.length >= 500}
          onClick={() => model.add()}
        >
          <Plus size={16} />
          <Text>{t('Add requirement')}</Text>
        </button>
      </div>
    </div>
  )
}
