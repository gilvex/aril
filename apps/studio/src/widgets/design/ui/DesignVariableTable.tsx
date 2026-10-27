import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignVariableRow } from './DesignVariableRow.tsx'
import type { DesignVariableTableProps } from '../types/designVariableTableProps.ts'
export function DesignVariableTable({
  model,
  collection,
}: DesignVariableTableProps) {
  const { t } = useTranslation()
  const { library } = model
  const used = new Set(
    model.usage.filter((u) => u.assetKind === 'variable').map((u) => u.assetId),
  )
  const query = model.variableQuery.trim().toLocaleLowerCase()
  const variables = Object.values(library.variables).filter(
    (v) =>
      v.collectionId === collection.id &&
      v.name.toLocaleLowerCase().includes(query) &&
      (model.variableType === 'all' || v.type === model.variableType) &&
      (model.variableUsage === 'all' ||
        used.has(v.id) === (model.variableUsage === 'used')),
  )
  const { patch, variableLimit } = model
  const more = useCallback(
    () => patch({ variableLimit: variableLimit + 50 }),
    [patch, variableLimit],
  )
  return (
    <div className="design-variable-table">
      <table>
        <thead>
          <tr>
            <th>{t('Name')}</th>
            <th>{t('Type')}</th>
            {collection.modes.map((m) => (
              <th key={m}>{m}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {variables.slice(0, variableLimit).map((v) => (
            <DesignVariableRow
              key={v.id}
              variable={v}
              modes={collection.modes}
              model={model}
            />
          ))}
        </tbody>
      </table>
      <p>
        {t('Showing {{start}}–{{end}} of {{total}} items', {
          start: variables.length ? 1 : 0,
          end: Math.min(variableLimit, variables.length),
          total: variables.length,
        })}
      </p>
      {variables.length > variableLimit && (
        <Button variant="outline" size="sm" onClick={more}>
          {t('Show more')}
        </Button>
      )}
      {!variables.length && <p>{t('No matching variables')}</p>}
    </div>
  )
}
