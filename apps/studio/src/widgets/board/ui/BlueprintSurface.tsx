import { useTranslation } from '@/shared/i18n/index.ts'
import { Link2, MousePointer2, Plus } from 'lucide-react'
import { BlueprintFlow } from './BlueprintFlow.tsx'
import { BlueprintInsertMenu } from './BlueprintInsertMenu.tsx'
import { BlueprintToolbar } from './BlueprintToolbar.tsx'
import { BoardDrawing } from './BoardDrawing.tsx'
import { BlueprintNodePalette } from './BlueprintNodePalette.tsx'

import type { BlueprintSurfaceProps } from '../types/blueprintSurfaceProps.ts'
export function BlueprintSurface(props: BlueprintSurfaceProps) {
  const { t } = useTranslation()

  const {
    surface,
    handlePointerMove,
    sendPresence,
    touchSelection,
    setPalette,
    addNode,
    board,
    compact,
    profile,
    setInsertPoint,
    insertPoint,
  } = props

  return (
    <div
      className="canvas-surface"
      ref={surface}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => sendPresence({ cursor: null }, true)}
    >
      <BlueprintToolbar {...props} />
      {props.palette && (
        <div className="canvas-floating-palette">
          <BlueprintNodePalette close={() => setPalette(false)} add={addNode} />
        </div>
      )}
      <div className="canvas-caption">
        <span className="small-dot" />
        {t('nodeCount', { count: board.nodes.length })}
        <span className="caption-separator" />
        {t('connectionCount', { count: board.edges.length })}
      </div>
      {compact && touchSelection && (
        <div className="touch-selection-hint">
          {t('Tap nodes to select. Tap Done to move them together.')}
        </div>
      )}
      <BlueprintFlow
        {...props}
        drawing={<BoardDrawing board={board} update={props.update} />}

        profile={profile}
      />
      {insertPoint && (
        <BlueprintInsertMenu
          insertPoint={insertPoint}
          board={board}
          setInsertPoint={setInsertPoint}
          addNode={addNode}
        />
      )}
      {!board.nodes.length && (
        <div className="empty-canvas">
          <div className="empty-symbol">
            <Plus size={28} />
          </div>
          <h2>{t('Every system starts with an idea.')}</h2>
          <p>{t('Add your first node, then connect the pieces.')}</p>
          <button className="button primary" onClick={() => setPalette(true)}>
            {t('Add your first node')}
          </button>
        </div>
      )}
      <div className="canvas-tip">
        <MousePointer2 size={13} />
        <span>{t('Drag to move')}</span>
        <span>·</span>
        <span>{t('Ctrl / ⌘ + click to select more')}</span>
        <span>·</span>
        <Link2 size={13} />
        <span>{t('Connect the handles')}</span>
      </div>
    </div>
  )
}
