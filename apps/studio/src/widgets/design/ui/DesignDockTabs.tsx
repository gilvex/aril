import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { designDockLayout } from '../utils/designDockLayout.ts'
export function DesignDockTabs({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const group = designDockLayout(model).group
  const { patch } = model
  const layers = useCallback(() => patch({ dockActive: 'left' }), [patch])
  const inspector = useCallback(() => patch({ dockActive: 'right' }), [patch])
  if (!group) return null
  return (
    <div
      className="design-dock-tabs"
      style={{ ...group.rect, height: 36 }}
      aria-label={t('Panel tabs')}
    >
      <button aria-pressed={model.dockActive === 'left'} onClick={layers}>
        {t(model.leftTab === 'library' ? 'Library' : 'Layers')}
      </button>
      <button aria-pressed={model.dockActive === 'right'} onClick={inspector}>
        {t(model.libraryView === 'machine' ? 'Behavior' : 'Design')}
      </button>
    </div>
  )
}
