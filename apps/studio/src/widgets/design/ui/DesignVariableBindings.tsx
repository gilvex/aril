import { useCallback } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignVariableBindings({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const { edit } = model
  const bind = useCallback(
    (e: SelectChange) => {
      const bindings = {
        ...node?.bindings,
        [e.target.name]: e.target.value || undefined,
      }
      edit({ bindings })
    },
    [node?.bindings, edit],
  )
  if (!node || !Object.keys(model.library.variables).length) return null
  return (
    <details className="design-variable-bindings">
      <summary>{t('Variable bindings')}</summary>
      {Object.entries({
        fill: 'color',
        stroke: 'color',
        color: 'color',
        radius: 'number',
        width: 'number',
        height: 'number',
        fontSize: 'number',
        text: 'string',
        hidden: 'boolean',
      }).map(([property, type]) => (
        <label key={property}>
          {t(
            (
              {
                fill: 'Fill',
                stroke: 'Stroke',
                color: 'Text color',
                radius: 'Corner radius',
                width: 'Width',
                height: 'Height',
                fontSize: 'Font size',
                text: 'Text content',
                hidden: 'Hidden',
              } as Record<string, string>
            )[property],
          )}
          <StudioSelect
            name={property}
            value={
              node.bindings?.[property as keyof typeof node.bindings] || ''
            }
            onChange={bind}
          >
            <option value="">{t('Not bound')}</option>
            {Object.values(model.library.variables)
              .filter((v) => v.type === type)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
          </StudioSelect>
        </label>
      ))}
    </details>
  )
}
