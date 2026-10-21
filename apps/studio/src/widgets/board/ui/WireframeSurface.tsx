import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { AppWindow, MousePointer2, Plus } from 'lucide-react'
import { WireframeFlow } from './WireframeFlow.tsx'
import { WireframeInsertMenu } from './WireframeInsertMenu.tsx'
import { WireframeToolbar } from './WireframeToolbar.tsx'
import { BoardDrawing } from './BoardDrawing.tsx'
import { WireframePalette } from './WireframePalette.tsx'

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
      {props.palette && (
        <div className="canvas-floating-palette">
          <WireframePalette t={t} setPalette={setPalette} add={add} />
        </div>
      )}
      <div className="canvas-caption">
        <Text>{t('screenCount', { count: screens.length })}</Text>
        <span className="caption-separator" />
        <Text>
          {t('blockCount', { count: graph.nodes.length - screens.length })}
        </Text>
        <span className="caption-separator" />
        <Text>{t('flowCount', { count: graph.edges.length })}</Text>
      </div>
      {compact && touchSelection && !preview && (
        <div className="touch-selection-hint">
          <Text>
            {t('Tap blocks to select. Tap Done to move them together.')}
          </Text>
        </div>
      )}
      <WireframeFlow
        {...props}
        profile={profile}
        drawing={
          <BoardDrawing
            board={props.board}
            update={props.update}
            checkpoint={props.checkpoint}
            wireframe
            disabled={preview}
          />
        }
      />
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
          <Text as="h2">{t('Give this idea a shape.')}</Text>
          <Text as="p">
            {t(
              'Build a screen from blocks, then draw the journey between them.',
            )}
          </Text>
          <button className="button primary" onClick={starter}>
            <Plus size={16} />
            <Text>{t('Start with a screen')}</Text>
          </button>
          <button className="button" onClick={() => setPalette(true)}>
            <Text>{t('Or add a single block')}</Text>
          </button>
        </div>
      )}
      <div className="canvas-tip" role="status">
        <Text>
          {preview
            ? previewMessage
            : t(
                'Drag blocks · Resize corners · Ctrl / ⌘ + click to group · Connect either side',
              )}
        </Text>
      </div>
    </div>
  )
}
