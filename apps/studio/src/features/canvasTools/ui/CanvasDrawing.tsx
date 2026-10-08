import { useViewport } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasDrawing } from '../model/useCanvasDrawing.ts'
import { strokePath } from '../utils/strokePath.ts'
import type { CanvasDrawingProps } from '../types/canvasDrawingProps.ts'
import './canvasDrawing.css'
export function CanvasDrawing(props: CanvasDrawingProps) {
  const { t } = useTranslation()
  const { x, y, zoom } = useViewport()
  const model = useCanvasDrawing(props)
  return (
    <svg
      className={`canvas-drawing${model.active ? ' is-drawing' : ''}${model.drawing === 'eraser' ? ' is-erasing' : ''}`}
      aria-label={t('Freehand drawing')}
      onPointerDown={model.start}
      onPointerMove={model.move}
      onPointerUp={model.finish}
      onPointerCancel={model.cancel}
      onLostPointerCapture={model.cancel}
    >
      <g transform={`translate(${x} ${y}) scale(${zoom})`}>
        {Object.entries(props.strokes || {}).map(([id, stroke]) => (
          <path
            key={id}
            data-stroke-id={id}
            d={strokePath(stroke)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            opacity={stroke.opacity}
          />
        ))}
        {model.draft && (
          <path
            d={strokePath(model.draft)}
            stroke={model.draft.color}
            strokeWidth={model.draft.width}
            opacity={model.draft.opacity}
          />
        )}
      </g>
    </svg>
  )
}
