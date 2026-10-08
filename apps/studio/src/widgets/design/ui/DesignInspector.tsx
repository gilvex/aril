import { DesignInstanceControls } from './DesignInstanceControls.tsx'
import { DesignVariableBindings } from './DesignVariableBindings.tsx'
import { DesignImageUrl } from './DesignImageUrl.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { MoreHorizontal, X } from 'lucide-react'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignGeometry } from './DesignGeometry.tsx'
import { DesignPaint } from './DesignPaint.tsx'
import { DesignTypography } from './DesignTypography.tsx'
import { useDesignLayerActions } from '../model/useDesignLayerActions.ts'
import { designLayerIcons } from '../config/designTools.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { isDesignContainer } from '@pomegranate/domain/design'
import { DesignContainerSettings } from './DesignContainerSettings.tsx'
export function DesignInspector({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const node = model.selected[0]
  const actions = useDesignLayerActions(model)
  const Icon = node ? designLayerIcons[node.kind] : null
  return (
    <aside
      className="design-inspector"
      data-collaboration-scope={`design:${model.page.id}:${model.selection.slice().sort().join(',')}`}

      aria-label={t('Design properties')}
    >
      <header>
        <SurfaceGrip />
        <strong>{t('Design')}</strong>
        <button
          className="icon-button"
          aria-label={t('Close properties')}
          onClick={() => model.patch({ inspector: false })}
        >
          <X size={16} />
        </button>
      </header>
      {node ? (
        <fieldset
          disabled={readOnly}
          className="design-inspector-body edit-fields"
        >
          <div className="design-selection-heading">
            {Icon && <Icon size={16} />}
            {model.selected.length > 1 ? (
              <strong>
                {t('{{count}} layers selected', {
                  count: model.selected.length,
                })}
              </strong>
            ) : (
              <input
                aria-label={t('Layer name')}
                value={node.name}
                maxLength={120}
                onChange={(event) =>
                  event.target.value.trim() &&
                  model.edit({ name: event.target.value })
                }
              />
            )}
            <EditorActionMenu actions={actions} label={t('Layer actions')}>
              <button className="icon-button" aria-label={t('Layer actions')}>
                <MoreHorizontal size={17} />
              </button>
            </EditorActionMenu>
          </div>
          {model.selected.length > 1 && (
            <p className="design-property-hint">
              {t(
                'Values show the first layer. Changes apply to all selected layers.',
              )}
            </p>
          )}
          <DesignInstanceControls model={model} />
          <DesignGeometry model={model} />
          <DesignVariableBindings model={model} />
          {isDesignContainer(node) && <DesignContainerSettings model={model} />}
          <DesignPaint model={model} />
          {!isDesignContainer(node) && node.kind !== 'image' && (
            <DesignTypography model={model} />
          )}
          {node.kind === 'image' && (
            <section>
              <h3>{t('Image URL')}</h3>
              <DesignImageUrl key={node.id} model={model} />
            </section>
          )}
        </fieldset>
      ) : (
        <p className="design-inspector-empty">
          {t('Select a layer to edit its layout and appearance.')}
        </p>
      )}
    </aside>
  )
}
