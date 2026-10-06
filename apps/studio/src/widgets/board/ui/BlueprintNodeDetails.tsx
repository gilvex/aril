import { useTranslation } from '@/shared/i18n/index.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import { nodeKinds, statuses } from '@pomegranate/domain/workspace'
import { Copy, Trash2 } from 'lucide-react'
import { useBlueprintNodeDetailsHandlers } from '../model/useBlueprintNodeDetailsHandlers.tsx'
import { LinkedRequirements } from './LinkedRequirements.tsx'

import type { BlueprintNodeDetailsProps } from '../types/blueprintNodeDetailsProps.ts'
export function BlueprintNodeDetails({
  node,
  editField,
  updateNode,
  openRequirement,
  requirements,
  update,
  board,
  setSelected,
  removeNode,
}: BlueprintNodeDetailsProps) {
  const { t } = useTranslation()

  const {
    changeKind,
    changeStatus,
    handleLinkARequirementChange,
    duplicateNode,
  } = useBlueprintNodeDetailsHandlers({
    updateNode,
    node,
    update,
    board,
    setSelected,
  })
  return (
    <div className="inspector-body" key={node.id}>
      <span className={`detail-kind kind-${node.data.kind}`}>
        {t(kindLabels[node.data.kind])}
      </span>
      <label>
        {t('Title')}
        <input
          aria-label={t('Node title')}
          ref={editField}
          value={node.data.title}
          maxLength={120}
          onChange={(e) => updateNode({ title: e.target.value || 'Untitled' })}
        />
      </label>
      <label>
        {t('Description')}
        <textarea
          aria-label={t('Node description')}
          value={node.data.description}
          maxLength={2000}
          rows={3}
          onChange={(e) => updateNode({ description: e.target.value })}
        />
      </label>
      <div className="field-row">
        <label>
          {t('Type')}
          <select value={node.data.kind} onChange={changeKind}>
            {nodeKinds.map((k) => (
              <option key={k} value={k}>
                {t(kindLabels[k])}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('Decision')}
          <select value={node.data.status} onChange={changeStatus}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {t('Notes')}
        <textarea
          aria-label={t('Node notes')}
          placeholder={t('Constraints, decisions, open questions…')}
          rows={5}
          value={node.data.notes}
          maxLength={12000}
          onChange={(e) => updateNode({ notes: e.target.value })}
        />
      </label>
      <div className="field-label">
        {t('Linked requirements')}
        <span>{node.data.requirements.length}</span>
      </div>
      <LinkedRequirements
        node={node}
        openRequirement={openRequirement}
        requirements={requirements}
        updateNode={updateNode}
      />
      <select
        aria-label={t('Link a requirement')}
        value=""
        onChange={handleLinkARequirementChange}
      >
        <option value="">{t('+ Link a requirement')}</option>
        {requirements
          .filter((r) => !node.data.requirements.includes(r.id))
          .map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} · {r.title}
            </option>
          ))}
      </select>
      <div className="inspector-actions">
        <button className="button" onClick={duplicateNode}>
          <Copy size={14} />
          {t('Duplicate')}
        </button>
        <button
          className="icon-button danger"
          aria-label={t('Delete node')}
          onClick={removeNode}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
