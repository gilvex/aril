import { useTranslation } from '@/shared/i18n/index.ts'
import { ArrowUpRight, X } from 'lucide-react'
import { useLinkedRequirementHandlers } from '../model/useLinkedRequirementHandlers.tsx'

import type { LinkedRequirementProps } from '../types/linkedRequirementProps.ts'
export function LinkedRequirement({
  id,
  openRequirement,
  requirements,
  updateNode,
  node,
}: LinkedRequirementProps) {
  const { t } = useTranslation()

  const { handleClick } = useLinkedRequirementHandlers({ updateNode, node, id })
  return (
    <div className="linked-requirement" key={id}>
      <button onClick={() => openRequirement(id)}>
        <span>{id}</span>
        {requirements.find((r) => r.id === id)?.title}
        <ArrowUpRight size={14} />
      </button>
      <button
        className="icon-button"
        aria-label={t('Unlink {{id}}', { id: id })}
        onClick={handleClick}
      >
        <X size={12} />
      </button>
    </div>
  )
}
