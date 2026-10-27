import { Text } from '@/shared/ui/Text.tsx'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { RequirementsCommandsProps } from '../types/requirementsCommandsProps.ts'
import { RequirementsFilters } from './RequirementsFilters.tsx'
export function RequirementsCommands({
  model,
  controls,
}: RequirementsCommandsProps) {
  const { t } = useTranslation()
  return (
    <>
      <button
        className={'req-command ' + (model.query ? 'is-active' : '')}
        aria-label={t('Search requirements')}
        aria-expanded={model.panel === 'search'}
        aria-controls={model.panel === 'search' ? controls.id : undefined}
        onClick={(event) => controls.toggle('search', event.currentTarget)}
      >
        <Search size={17} />
        {model.query && <i />}
      </button>
      <button
        className={'req-command ' + (controls.activeCount ? 'is-active' : '')}
        aria-label={t('Filters')}
        aria-expanded={model.panel === 'filters'}
        aria-controls={model.panel === 'filters' ? controls.id : undefined}
        onClick={(event) => controls.toggle('filters', event.currentTarget)}
      >
        <SlidersHorizontal size={16} />
        <Text as="span">{t('Filters')}</Text>
        {!!controls.activeCount && (
          <Text as="small">{controls.activeCount}</Text>
        )}
      </button>
      {model.panel && (
        <div
          id={controls.id}
          ref={controls.popup}
          className={'requirements-popover panel-' + model.panel}
          role="dialog"
          aria-label={t(
            model.panel === 'filters' ? 'Filters' : 'Search requirements',
          )}
        >
          <header>
            <Text as="strong">
              {t(model.panel === 'filters' ? 'Filters' : 'Search requirements')}
            </Text>
            <button
              className="icon-button"
              aria-label={t('Close')}
              onClick={controls.close}
            >
              <X size={16} />
            </button>
          </header>
          {model.panel === 'filters' ? (
            <RequirementsFilters model={model} />
          ) : (
            <Text as="label" className="requirements-search">
              <Search size={16} />
              <input
                aria-label={t('Search requirements')}
                placeholder={t('Search requirements…')}
                value={model.query}
                onChange={(event) => model.setQuery(event.target.value)}
              />
              {model.query && (
                <button
                  className="icon-button"
                  aria-label={t('Clear search')}
                  onClick={() => model.setQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </Text>
          )}
          <footer>
            <Text as="span" role="status">
              {t('requirementCount', { count: model.results.length })}
            </Text>
            <button className="button subtle" onClick={controls.close}>
              <Text>{t('Done')}</Text>
            </button>
          </footer>
        </div>
      )}
    </>
  )
}
