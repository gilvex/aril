import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignComponentIcon({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { component, library, saveLibrary } = model
  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (component)
        saveLibrary({
          ...library,
          components: {
            ...library.components,
            [component.id]: { ...component, icon: event.target.value },
          },
        })
    },
    [component, library, saveLibrary],
  )
  if (!component) return null
  return (
    <label>
      {t('Component icon')}
      <input
        value={component.icon || ''}
        onChange={change}
        maxLength={12}
        placeholder={t('Emoji or short symbol')}
      />
    </label>
  )
}
