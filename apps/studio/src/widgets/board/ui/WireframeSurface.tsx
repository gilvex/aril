import { useTranslation } from '@/shared/i18n/index.ts'
import { AppWindow, MousePointer2, Plus } from 'lucide-react'
import { WireframeFlow } from './WireframeFlow.tsx'
import { WireframeInsertMenu } from './WireframeInsertMenu.tsx'
import { WireframeToolbar } from './WireframeToolbar.tsx'

import type { WireframeSurfaceProps } from '../types/wireframeSurfaceProps.ts'
export function WireframeSurface(props: WireframeSurfaceProps) {
  const { t } = useTranslation()

  const {
    surface,
    handlePointerMove,
    sendPresence,
    touchSelection,
    preview,
    setPalette,
    graph,
    add,
    screens,
    compact,
    profile,
    setInsertPoint,
    insertPoint,
    starter,
    previewMessage,
  } = props

  return (
    <div
      ref={surface}
      className="canvas-surface wire-surface"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => sendPresence({ cursor: null }, true)}
    >
      <WireframeToolbar {...props} />
      <div className="canvas-caption">
        {t('screenCount', { count: screens.length })}
        <span className="caption-separator" />
        {t('blockCount', { count: graph.nodes.length - screens.length })}
        <span className="caption-separator" />
        {t('flowCount', { count: graph.edges.length })}
      </div>
      {compact && touchSelection && !preview && (
        <div className="touch-selection-hint">
          {t('Tap blocks to select. Tap Done to move them together.')}
        </div>
      )}
      <WireframeFlow {...props} profile={profile} />
      {insertPoint && !preview && (
        <WireframeInsertMenu
          insertPoint={insertPoint}
          graph={graph}
          setInsertPoint={setInsertPoint}
          add={add}
        />
      )}
      {!graph.nodes.length && (
        <div className="empty-canvas wire-empty">
          <div className="wire-empty-art">
            <AppWindow size={72} strokeWidth={1} />
            <MousePointer2 size={27} />
          </div>
          <h2>{t('Give this idea a shape.')}</h2>
          <p>
            {t(
              'Build a screen from blocks, then draw the journey between them.',
            )}
          </p>
          <button className="button primary" onClick={starter}>
            <Plus size={16} />
            {t('Start with a screen')}
          </button>
          <button className="button" onClick={() => setPalette(true)}>
            {t('Or add a single block')}
          </button>
        </div>
      )}
      <div className="canvas-tip" role="status">
        {preview
          ? previewMessage
          : t(
              'Drag blocks · Resize corners · Ctrl / ⌘ + click to group · Connect either side',
            )}
      </div>
    </div>
  )
}
