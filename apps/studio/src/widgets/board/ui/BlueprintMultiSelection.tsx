import { useTranslation } from '@/shared/i18n/index.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import { nodeKinds, statuses } from '@pomegranate/domain/workspace'
import { Trash2 } from 'lucide-react'
import { useBlueprintMultiSelectionHandlers } from '../model/useBlueprintMultiSelectionHandlers.tsx'

import type { BlueprintMultiSelectionProps } from '../types/blueprintMultiSelectionProps.ts'
export function BlueprintMultiSelection({
  selectedNodes,
  checkpoint,
  update,
  board,
  selectedIds,
  onDelete,
}: BlueprintMultiSelectionProps) {
  const { t } = useTranslation()

  const {
    handleSelectedNodesTypeChange,
    handleSelectedNodesDecisionChange,
    handleClick,
  } = useBlueprintMultiSelectionHandlers({
    checkpoint,
    update,
    board,
    selectedIds,
    onDelete,
    selectedNodes,
  })
  return (
    <div className="inspector-body multi-selection-body">
      <h2>{t('Edit together.')}</h2>
      <p>
        {t(
          'Drag any selected node to move the group. Ctrl / ⌘ + click toggles a node; Shift + drag selects an area.',
        )}
      </p>
      <label>
        {t('Type')}
        <select
          aria-label={t('Selected nodes type')}
          value={
            selectedNodes.every(
              (n) => n.data.kind === selectedNodes[0].data.kind,
            )
              ? selectedNodes[0].data.kind
              : ''
          }
          onChange={handleSelectedNodesTypeChange}
        >
          <option value="" disabled>
            {t('Mixed types')}
          </option>
          {nodeKinds.map((k) => (
            <option key={k} value={k}>
              {t(kindLabels[k])}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('Decision')}
        <select
          aria-label={t('Selected nodes decision')}
          value={
            selectedNodes.every(
              (n) => n.data.status === selectedNodes[0].data.status,
            )
              ? selectedNodes[0].data.status
              : ''
          }
          onChange={handleSelectedNodesDecisionChange}
        >
          <option value="" disabled>
            {t('Mixed decisions')}
          </option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {t(s)}
            </option>
          ))}
        </select>
      </label>
      <ul className="selected-node-list">
        {selectedNodes.map((n) => (
          <li key={n.id}>{n.data.title}</li>
        ))}
      </ul>
      <button className="button danger" onClick={handleClick}>
        <Trash2 size={15} />
        {t('Delete selected nodes')}
      </button>
    </div>
  )
}
