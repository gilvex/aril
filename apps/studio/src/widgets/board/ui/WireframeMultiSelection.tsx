import { useTranslation } from '@/shared/i18n/index.ts'
import { Copy, Trash2 } from 'lucide-react'
import { useWireframeMultiSelectionHandlers } from '../model/useWireframeMultiSelectionHandlers.tsx'

import type { WireframeMultiSelectionProps } from '../types/wireframeMultiSelectionProps.ts'
export function WireframeMultiSelection({
  save,
  graph,
  selection,
  duplicate,
  setSelection,
}: WireframeMultiSelectionProps) {
  const { t } = useTranslation()

  const { handleChange, handleClick } = useWireframeMultiSelectionHandlers({
    save,
    graph,
    selection,
    setSelection,
  })
  return (
    <div className="inspector-body">
      <h2>{t('Arrange together.')}</h2>
      <p>
        {t(
          'Drag any selected block to move the group. Screen contents move with their frame.',
        )}
      </p>
      <label>
        {t('Appearance')}
        <select value="" onChange={handleChange}>
          <option value="" disabled>
            {t('Change selected blocks…')}
          </option>
          <option value="plain">{t('Plain')}</option>
          <option value="soft">{t('Soft')}</option>
          <option value="accent">{t('Accent')}</option>
        </select>
      </label>
      <button className="button" onClick={duplicate}>
        <Copy size={14} />
        {t('Duplicate selection')}
      </button>
      <button className="button danger" onClick={handleClick}>
        <Trash2 size={14} />
        {t('Delete selected blocks')}
      </button>
    </div>
  )
}
