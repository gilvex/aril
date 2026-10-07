import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '@/widgets/board/config/kindIcons.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import { CanvasChrome } from '@/widgets/board/ui/CanvasChrome.tsx'
import { nodeKinds } from '@pomegranate/domain/workspace'
import { Plus, X } from 'lucide-react'
import { BlueprintViewActions } from './BlueprintViewActions.tsx'

import type { BlueprintToolbarProps } from '../types/blueprintToolbarProps.ts'
export function BlueprintToolbar({
  navigation,
  tool,
  setTool,
  touchSelection,
  setTouchSelection,
  inspectorToggle,
  inspectorOpen,
  setInspectorOpen,
  fullscreenButtonRef,
  fullscreen,
  toggleFullscreen,
  setPalette,
  palette,
  addNode,
}: BlueprintToolbarProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'

  return (
    <CanvasChrome
      navigation={navigation}
      tool={tool}
      onTool={setTool}
      multiSelect={touchSelection}
      onMultiSelect={setTouchSelection}
      actions={
        <BlueprintViewActions
          inspectorToggle={inspectorToggle}
          inspectorOpen={inspectorOpen}
          setInspectorOpen={setInspectorOpen}
          fullscreenButtonRef={fullscreenButtonRef}
          fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      }
    >
      <div className="add-node-wrap">
        <button
          className="button primary"
          disabled={readOnly}
          title={t('Add node')}
          aria-label={t('Add node')}
          aria-expanded={palette}
          onClick={() => setPalette(!palette)}
        >
          <Plus size={16} />
        </button>
        {palette && (
          <div className="node-palette">
            <div className="popover-heading">
              {t('Add to your canvas')}
              <button
                className="icon-button"
                onClick={() => setPalette(false)}
                aria-label={t('Close node menu')}
              >
                <X size={14} />
              </button>
            </div>
            {nodeKinds.map((kind) => {
              const Icon = kindIcons[kind]
              return (
                <button key={kind} onClick={() => addNode(kind)}>
                  <Icon size={17} />
                  {t(kindLabels[kind])}
                  <Plus size={14} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </CanvasChrome>
  )
}
