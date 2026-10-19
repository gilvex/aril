import { useCallback } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import { nodeIconOptions } from '../config/nodeIconOptions.ts'
import type { BlueprintIconPickerProps } from '../types/blueprintIconPickerProps.ts'
export function BlueprintIconPicker({
  node,
  readOnly,
  updateNode,
}: BlueprintIconPickerProps) {
  const { t } = useTranslation()
  const change = useCallback(
    (event: SelectChange) =>
      updateNode({
        icon: event.target.value
          ? (event.target.value as keyof typeof nodeIconOptions)
          : undefined,
      }),
    [updateNode],
  )
  return (
    <label>
      {t('Icon')}
      <StudioSelect
        aria-label={t('Node icon')}
        disabled={readOnly}
        value={node.data.icon || ''}
        onChange={change}
      >
        <option value="">{t('Default icon')}</option>
        {Object.entries(nodeIconOptions).map(([id, option]) => (
          <option key={id} value={id}>
            {t(option.label)}
          </option>
        ))}
      </StudioSelect>
    </label>
  )
}
