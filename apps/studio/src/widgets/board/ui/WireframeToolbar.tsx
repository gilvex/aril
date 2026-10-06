import { useTranslation } from '@/shared/i18n/index.ts'
import { useWireframeToolbarHandlers } from '../model/useWireframeToolbarHandlers.tsx'
import { WireframePalette } from './WireframePalette.tsx'
import { WireframeViewActions } from './WireframeViewActions.tsx'

import { CanvasChrome } from '@/widgets/board/ui/CanvasChrome.tsx'
import { Pencil, Play, Plus } from 'lucide-react'

import type { WireframeToolbarProps } from '../types/wireframeToolbarProps.ts'
export function WireframeToolbar({
  navigation,
  tool,
  setTool,
  touchSelection,
  setTouchSelection,
  preview,
  inspectorToggle,
  inspectorOpen,
  setInspectorOpen,
  full,
  setPreview,
  setPalette,
  palette,
  graph,
  add,
}: WireframeToolbarProps) {
  const { t } = useTranslation()

  const { handleClick } = useWireframeToolbarHandlers({
    setPreview,
    preview,
    setPalette,
  })
  return (
    <CanvasChrome
      navigation={navigation}
      tool={tool}
      onTool={setTool}
      multiSelect={touchSelection}
      onMultiSelect={setTouchSelection}
      preview={preview}
      actions={
        <WireframeViewActions
          inspectorToggle={inspectorToggle}
          inspectorOpen={inspectorOpen}
          setInspectorOpen={setInspectorOpen}
          full={full}
        />
      }
    >
      <button
        className={`button preview-toggle ${preview ? 'primary' : ''}`}
        aria-pressed={preview}
        onClick={handleClick}
      >
        {preview ? <Pencil size={15} /> : <Play size={15} />}
        <span>{preview ? t('Edit') : t('Preview flow')}</span>
      </button>
      {!preview && (
        <div className="add-node-wrap">
          <button
            className="button primary"
            aria-expanded={palette}
            onClick={() => setPalette(!palette)}
            disabled={graph.nodes.length >= 500}
          >
            <Plus size={16} />
            {t('Add block')}
          </button>
          {palette && (
            <WireframePalette t={t} setPalette={setPalette} add={add} />
          )}
        </div>
      )}
    </CanvasChrome>
  )
}
