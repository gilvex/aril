import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignVariableRow } from './DesignVariableRow.tsx'
import type { DesignVariableTableProps } from '../types/designVariableTableProps.ts'
export function DesignVariableTable({
  model,
  collection,
}: DesignVariableTableProps) {
  const { t } = useTranslation()
  const { library } = model
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
          {Object.values(library.variables)
            .filter((v) => v.collectionId === collection.id)
            .map((v) => (
              <DesignVariableRow
                key={v.id}
                variable={v}
                modes={collection.modes}
                model={model}
              />
            ))}
        </tbody>
      </table>
    </div>
  )
}
