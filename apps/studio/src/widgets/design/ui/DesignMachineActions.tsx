import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignMachineActionsProps } from '../types/designMachineActionsProps.ts'
import { DesignMachineActionRow } from './DesignMachineActionRow.tsx'
export function DesignMachineActions({
  label,
  actions,
  library,
  onChange,
}: DesignMachineActionsProps) {
  const { t } = useTranslation()
  const variable = Object.values(library.variables)[0]
  const add = useCallback(() => {
    if (variable)
      onChange([
        ...actions,
        { variableId: variable.id, value: Object.values(variable.values)[0] },
      ])
  }, [variable, onChange, actions])
  return (
    <div className="design-machine-actions">
      <Text as="h4">{label}</Text>
      {actions.map((action, index) => (
        <DesignMachineActionRow
          key={index}
          action={action}
          index={index}
          actions={actions}
          library={library}
          onChange={onChange}
        />
      ))}
      <button
        className="button"
        disabled={!variable || actions.length >= 30}
        onClick={add}
      >
        <Text>{t('Add action')}</Text>
      </button>
    </div>
  )
}
