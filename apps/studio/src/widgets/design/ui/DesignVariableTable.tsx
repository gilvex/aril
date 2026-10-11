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
          {variables.map((v) => (
            <DesignVariableRow
              key={v.id}
              variable={v}
              modes={collection.modes}
              model={model}
            />
          ))}
        </tbody>
      </table>
      {!variables.length && <p>{t('No matching variables')}</p>}
    </div>
  )
}
