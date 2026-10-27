import { useCallback } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignMachineConditionProps } from '../types/designMachineConditionProps.ts'
import { DesignVariableValue } from './DesignVariableValue.tsx'
export function DesignMachineCondition({
  guard,
  library,
  onChange,
}: DesignMachineConditionProps) {
  const { t } = useTranslation()
  const variable = guard
    ? library.variables[guard.variableId]
    : Object.values(library.variables)[0]
  const toggle = useCallback(
    () =>
      onChange(
        guard
          ? undefined
          : variable
            ? {
                variableId: variable.id,
                operator: 'eq',
                value: Object.values(variable.values)[0],
              }
            : undefined,
      ),
    [guard, variable, onChange],
  )
  const pick = useCallback(
    (e: SelectChange) => {
      const v = library.variables[e.target.value]
      if (v)
        onChange({
          variableId: v.id,
          operator: 'eq',
          value: Object.values(v.values)[0],
        })
    },
    [library, onChange],
  )
  const operator = useCallback(
    (e: SelectChange) => {
      if (guard)
        onChange({
          ...guard,
          operator: e.target.value as typeof guard.operator,
        })
    },
    [guard, onChange],
  )
  const value = useCallback(
    (value: string | number | boolean) => {
      if (guard) onChange({ ...guard, value })
    },
    [guard, onChange],
  )
  return (
    <div className="design-machine-condition">
      <h4>{t('Condition')}</h4>
      {guard && variable && (
        <>
          <StudioSelect
            value={guard.variableId}
            onChange={pick}
            aria-label={t('Variable')}
          >
            {Object.values(library.variables).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </StudioSelect>
          <StudioSelect
            value={guard.operator}
            onChange={operator}
            aria-label={t('Comparison')}
          >
            <option value="eq">{t('Equals')}</option>
            <option value="ne">{t('Does not equal')}</option>
            {variable.type === 'number' && (
              <>
                <option value="gt">{t('Greater than')}</option>
                <option value="lt">{t('Less than')}</option>
              </>
            )}
          </StudioSelect>
          <DesignVariableValue
            type={variable.type}
            value={guard.value}
            label={t('Value')}
            onChange={value}
          />
        </>
      )}
      <button className="button" disabled={!variable} onClick={toggle}>
        {t(guard ? 'Remove condition' : 'Add condition')}
      </button>
    </div>
  )
}
