import { Text } from '@/shared/ui/Text.tsx'
import { BlueprintIconPicker } from './BlueprintIconPicker.tsx'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import { BlueprintNodeClassification } from './BlueprintNodeClassification.tsx'
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
  const readOnly = useWorkspaceRole() === 'viewer'

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
      <Text as="span" className={`detail-kind kind-${node.data.kind}`}>
        {t(kindLabels[node.data.kind])}
      </Text>
      <Text as="label">
        {t('Title')}
        <input
          disabled={readOnly}
          aria-label={t('Node title')}
          ref={editField}
          value={node.data.title}
          maxLength={120}
          onChange={(e) => updateNode({ title: e.target.value })}
        />
      </Text>
      <Text as="label">
        {t('Description')}
        <textarea
          readOnly={readOnly}
          aria-label={t('Node description')}
          value={node.data.description}
          maxLength={2000}
          rows={3}
          onChange={(e) => updateNode({ description: e.target.value })}
        />
      </Text>
      {node.data.kind === 'block' && (
        <BlueprintIconPicker
          key={node.id}
          node={node}
          readOnly={readOnly}
          updateNode={updateNode}
        />
      )}
      <BlueprintNodeClassification
        node={node}
        readOnly={readOnly}
        changeKind={changeKind}
        changeStatus={changeStatus}
      />
      <Text as="label">
        {t('Notes')}
        <textarea
          readOnly={readOnly}
          aria-label={t('Node notes')}
          placeholder={t('Constraints, decisions, open questions…')}
          rows={5}
          value={node.data.notes}
          maxLength={12000}
          onChange={(e) => updateNode({ notes: e.target.value })}
        />
      </Text>
      <div className="field-label">
        <Text>{t('Linked requirements')}</Text>
        <Text as="span">{node.data.requirements.length}</Text>
      </div>
      <LinkedRequirements
        node={node}
        openRequirement={openRequirement}
        requirements={requirements}
        updateNode={updateNode}
      />
      <StudioSelect
        disabled={readOnly}
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
      </StudioSelect>
      <div className="inspector-actions">
        <button disabled={readOnly} className="button" onClick={duplicateNode}>
          <Copy size={14} />
          <Text>{t('Duplicate')}</Text>
        </button>
        <button
          disabled={readOnly}
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
