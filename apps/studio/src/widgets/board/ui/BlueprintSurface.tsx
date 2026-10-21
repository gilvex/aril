import { Text } from '@/shared/ui/Text.tsx'
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
        <Text>{t('nodeCount', { count: board.nodes.length })}</Text>
        <span className="caption-separator" />
        <Text>{t('connectionCount', { count: board.edges.length })}</Text>
      </div>
      {compact && touchSelection && (
        <div className="touch-selection-hint">
          <Text>
            {t('Tap nodes to select. Tap Done to move them together.')}
          </Text>
        </div>
      )}
      <BlueprintFlow
        {...props}
        drawing={
          <BoardDrawing
            board={board}
            update={props.update}
            checkpoint={props.checkpoint}
          />
        }

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
          <Text as="h2">{t('Every system starts with an idea.')}</Text>
          <Text as="p">
            {t('Add your first node, then connect the pieces.')}
          </Text>
          <button className="button primary" onClick={() => setPalette(true)}>
            <Text>{t('Add your first node')}</Text>
          </button>
        </div>
      )}
      <div className="canvas-tip">
        <MousePointer2 size={13} />
        <Text as="span">{t('Drag to move')}</Text>
        <Text as="span">·</Text>
        <Text as="span">{t('Ctrl / ⌘ + click to select more')}</Text>
        <Text as="span">·</Text>
        <Link2 size={13} />
        <Text as="span">{t('Connect the handles')}</Text>
      </div>
    </div>
  )
}
