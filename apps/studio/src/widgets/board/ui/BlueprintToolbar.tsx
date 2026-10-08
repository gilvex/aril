import { useCallback } from 'react'
import {
  CanvasDrawTools,
  CanvasInspectTools,
  useCanvasTools,
} from '@/features/canvasTools/index.ts'
import { CanvasChrome } from './CanvasChrome.tsx'
import { BlueprintViewActions } from './BlueprintViewActions.tsx'
import { BlueprintShapeTools } from './BlueprintShapeTools.tsx'
import { BoardMotionTools } from './BoardMotionTools.tsx'
import type { BlueprintToolbarProps } from '../types/blueprintToolbarProps.ts'
export function BlueprintToolbar(props: BlueprintToolbarProps) {
  const { mode } = useCanvasTools()
  const inspect = useCallback(() => props.setInspectorOpen(true), [props])
  const changeMode = useCallback(() => props.setPalette(false), [props])
  return (
    <CanvasChrome
      navigation={props.navigation}
      tool={props.tool}
      onTool={props.setTool}
      multiSelect={props.touchSelection}
      onMultiSelect={props.setTouchSelection}
      onModeChange={changeMode}
      actions={<BlueprintViewActions {...props} />}
    >
      {mode === 'draw' && <CanvasDrawTools />}
      {mode === 'shapes' && <BlueprintShapeTools {...props} />}
      {mode === 'dev' && (
        <CanvasInspectTools data={props.board} inspect={inspect} />
      )}
      {mode === 'motion' && (
        <BoardMotionTools board={props.board} flow={props.flow} />
      )}
    </CanvasChrome>
  )
}
