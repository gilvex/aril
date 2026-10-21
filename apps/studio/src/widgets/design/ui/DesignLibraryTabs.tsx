import { Text } from '@/shared/ui/Text.tsx'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryTabs({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, openLibrary } = model
  const select = useCallback(
    (value: string) => {
      if (value === 'layers') patch({ leftTab: 'layers' })
      if (value === 'library') openLibrary()
    },
    [patch, openLibrary],
  )
  return (
    <ToggleGroup
      data-studio-toggle-group
      type="single"
      value="layers"
      onValueChange={select}
      className="design-library-tabs"
      aria-label={t('Design tools')}
    >
      <ToggleGroupItem value="layers">
        <Text>{t('Layers')}</Text>
      </ToggleGroupItem>
      <ToggleGroupItem value="library">
        <Text>{t('Library')}</Text>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
