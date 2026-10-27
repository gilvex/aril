import { Trash2 } from 'lucide-react'
import { useDrawingSelection } from '../model/useDrawingSelection.ts'
import { CanvasStroke } from './CanvasStroke.tsx'
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
  const selection = useDrawingSelection(props)
  return (
    <>
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
          {Object.entries(props.strokes || {}).map(([id, stroke], index) => (
            <CanvasStroke
              key={id}
              id={id}
              stroke={stroke}
              zoom={zoom}
              label={t('Drawing stroke {{number}}', { number: index + 1 })}
              selected={selection.selected.includes(id)}
              selectable={selection.selectable}
              select={selection.select}
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
      {!!selection.selected.length && selection.selectable && (
        <div className="drawing-selection-tools">
          <span>
            {t('selectedStrokeCount', { count: selection.selected.length })}
          </span>
          <button
            type="button"
            className="button"
            onClick={selection.remove}
            aria-label={t('Delete selected drawing')}
          >
            <Trash2 size={16} />
            {t('Delete')}
          </button>
        </div>
      )}
    </>
  )
}
