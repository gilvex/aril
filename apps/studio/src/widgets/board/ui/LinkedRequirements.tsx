import { LinkedRequirement } from './LinkedRequirement.tsx'

import type { LinkedRequirementsProps } from '../types/linkedRequirementsProps.ts'
export function LinkedRequirements({
  node,
  openRequirement,
  requirements,
  updateNode,
}: LinkedRequirementsProps) {
  return (
    <div className="linked-list">
      {node.data.requirements.map((id) => (
        <LinkedRequirement
          key={id}
          id={id}
          openRequirement={openRequirement}
          requirements={requirements}
          updateNode={updateNode}
          node={node}
        />
      ))}
    </div>
  )
}
