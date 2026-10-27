import { Text } from '@/shared/ui/Text.tsx'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { designDockLayout } from '../utils/designDockLayout.ts'
export function DesignDockTabs({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const group = designDockLayout(model).group
  const { patch } = model
  const select = useCallback(
    (value: string) => {
      if (value === 'left' || value === 'right') patch({ dockActive: value })
    },
    [patch],
  )
  if (!group) return null
  return (
    <ToggleGroup
      type="single"
      value={model.dockActive}
      onValueChange={select}
      className="design-dock-tabs"
      style={{ ...group.rect, height: 36 }}
      aria-label={t('Panel tabs')}
    >
      <ToggleGroupItem value="left">
        <Text>{t('Layers')}</Text>
      </ToggleGroupItem>
      <ToggleGroupItem value="right">
        <Text>
          {t(model.libraryView === 'machine' ? 'Behavior' : 'Design')}
        </Text>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
