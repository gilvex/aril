import { useCallback } from 'react'
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
} from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { alignDesignLayers } from '../utils/alignDesignLayers.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignAlignment({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const align = useCallback(
    (axis: 'x' | 'y', edge: 'start' | 'center' | 'end') =>
      model.save(
        alignDesignLayers(model.page.nodes, model.selection, axis, edge),
      ),
    [model],
  )
  const disabled = model.selected.length === 1 && !model.selected[0].parentId
  return (
    <div
      className="design-alignment"
      role="group"
      aria-label={t('Align layers')}
    >
      <button
        className="icon-button"
        title={t('Align left')}
        aria-label={t('Align left')}
        disabled={disabled}
        onClick={() => align('x', 'start')}
      >
        <AlignStartVertical size={16} />
      </button>
      <button
        className="icon-button"
        title={t('Align horizontal centers')}
        aria-label={t('Align horizontal centers')}
        disabled={disabled}
        onClick={() => align('x', 'center')}
      >
        <AlignCenterVertical size={16} />
      </button>
      <button
        className="icon-button"
        title={t('Align right')}
        aria-label={t('Align right')}
        disabled={disabled}
        onClick={() => align('x', 'end')}
      >
        <AlignEndVertical size={16} />
      </button>
      <button
        className="icon-button"
        title={t('Align top')}
        aria-label={t('Align top')}
        disabled={disabled}
        onClick={() => align('y', 'start')}
      >
        <AlignStartHorizontal size={16} />
      </button>
      <button
        className="icon-button"
        title={t('Align vertical centers')}
        aria-label={t('Align vertical centers')}
        disabled={disabled}
        onClick={() => align('y', 'center')}
      >
        <AlignCenterHorizontal size={16} />
      </button>
      <button
        className="icon-button"
        title={t('Align bottom')}
        aria-label={t('Align bottom')}
        disabled={disabled}
        onClick={() => align('y', 'end')}
      >
        <AlignEndHorizontal size={16} />
      </button>
    </div>
  )
}
