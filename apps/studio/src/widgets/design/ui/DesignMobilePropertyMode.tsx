import { Text } from '@/shared/ui/Text.tsx'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'

export function DesignMobilePropertyMode({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, styles } = model
  const select = useCallback(
    (value: string) => {
      if (value) patch({ styles: value === 'styles' })
    },
    [patch],
  )
  return (
    <ToggleGroup
      data-studio-toggle-group
      type="single"
      value={styles ? 'styles' : 'properties'}
      onValueChange={select}
      className="design-tools-property-mode"
      aria-label={t('Properties')}
    >
      <ToggleGroupItem value="properties">
        <Text>{t('Properties')}</Text>
      </ToggleGroupItem>
      <ToggleGroupItem value="styles">
        <Text>{t('Styles')}</Text>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
