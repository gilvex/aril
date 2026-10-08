import { useCallback } from 'react'
import { Play, Square } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import {
  CanvasDrawTools,
  CanvasInspectTools,
  useCanvasTools,
} from '@/features/canvasTools/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWireframeToolbarHandlers } from '../model/useWireframeToolbarHandlers.tsx'
import { WireframeViewActions } from './WireframeViewActions.tsx'
import { WireframeShapeTools } from './WireframeShapeTools.tsx'
import { CanvasChrome } from './CanvasChrome.tsx'
import type { WireframeToolbarProps } from '../types/wireframeToolbarProps.ts'
export function WireframeToolbar(props: WireframeToolbarProps) {
  const { t } = useTranslation()
  const { mode } = useCanvasTools()
  const { handleClick } = useWireframeToolbarHandlers(props)
  const inspect = useCallback(() => props.setInspectorOpen(true), [props])
  const changeMode = useCallback(() => {
    props.setPreview(false)
    props.setPalette(false)
  }, [props])
  return (
    <CanvasChrome
      navigation={props.navigation}
      tool={props.tool}
      onTool={props.setTool}
      multiSelect={props.touchSelection}
      onMultiSelect={props.setTouchSelection}
      preview={props.preview}
      onModeChange={changeMode}
      actions={<WireframeViewActions {...props} />}
    >
      {mode === 'draw' && <CanvasDrawTools />}
      {mode === 'shapes' && <WireframeShapeTools {...props} />}
      {mode === 'dev' && (
        <CanvasInspectTools data={props.graph} inspect={inspect} />
      )}
      {mode === 'motion' && (
        <ActionBarButton
          title={t(props.preview ? 'Edit' : 'Preview flow')}
          aria-label={t(props.preview ? 'Edit' : 'Preview flow')}
          aria-pressed={props.preview}
          onClick={handleClick}
        >
          {props.preview ? <Square size={18} /> : <Play size={18} />}
        </ActionBarButton>
      )}
    </CanvasChrome>
  )
}
