import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { designDockLayout } from '../utils/designDockLayout.ts'
export function DesignDockPreview({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const preview = model.dockPreview
  if (!preview) return null
  const next = {
    ...model,
    ...(preview.side === 'left'
      ? { layersDocked: preview.edge }
      : { inspectorDocked: preview.edge }),
  }
  const rect = designDockLayout(next).panels[preview.side]
  return (
    <div className="design-dock-preview" style={rect} aria-hidden="true">
      <span>
        {t(
          {
            left: 'Dock panel left',
            right: 'Dock panel right',
            top: 'Dock panel top',
            bottom: 'Dock panel bottom',
          }[preview.edge],
        )}
      </span>
    </div>
  )
}
