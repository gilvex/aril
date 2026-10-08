import { useCallback } from 'react'
import { X } from 'lucide-react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignMachineActionRowProps } from '../types/designMachineActionRowProps.ts'
import { DesignVariableValue } from './DesignVariableValue.tsx'
export function DesignMachineActionRow({
  action,
  index,
  actions,
  library,
  onChange,
}: DesignMachineActionRowProps) {
  const { t } = useTranslation()
  const variable = library.variables[action.variableId]
  const change = useCallback(
    (e: SelectChange) => {
      const v = library.variables[e.target.value]
      if (v)
        onChange(
          actions.map((a, i) =>
            i === index
              ? { variableId: v.id, value: Object.values(v.values)[0] }
              : a,
          ),
        )
    },
    [library, actions, index, onChange],
  )
  const value = useCallback(
    (value: string | number | boolean) =>
      onChange(actions.map((a, i) => (i === index ? { ...action, value } : a))),
    [actions, index, action, onChange],
  )
  const remove = useCallback(
    () => onChange(actions.filter((_a, i) => i !== index)),
    [actions, index, onChange],
  )
  return (
    <div className="design-machine-action-row">
      <StudioSelect
        value={action.variableId}
        onChange={change}
        aria-label={t('Variable')}
      >
        {Object.values(library.variables).map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </StudioSelect>
      <DesignVariableValue
        type={variable?.type || 'string'}
        value={action.value}
        label={t('Value')}
        onChange={value}
      />
      <button
        className="icon-button"
        aria-label={t('Remove action')}
        onClick={remove}
      >
        <X size={14} />
      </button>
    </div>
  )
}
