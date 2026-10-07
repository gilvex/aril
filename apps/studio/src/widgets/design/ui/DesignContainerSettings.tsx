import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignContainerSettings({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  if (model.selected.length !== 1) return null
  return (
    <section>
      {node.kind === 'frame' && (
        <label className="design-clip-toggle">
          <input
            type="checkbox"
            checked={!!node.clipContent}
            onChange={(event) =>
              model.edit({ clipContent: event.target.checked })
            }
          />
          {t('Clip content')}
        </label>
      )}
      {node.kind === 'group' && (
        <p className="design-property-hint">
          {t(
            node.maskId
              ? 'The bottom shape masks this group. Edit the shape to change its outline.'
              : 'Move and resize these layers together. Ungroup keeps their positions.',
          )}
        </p>
      )}
      {node.maskId && (
        <button
          className="button"
          onClick={() => model.edit({ maskId: undefined })}
        >
          {t('Release mask')}
        </button>
      )}
    </section>
  )
}
