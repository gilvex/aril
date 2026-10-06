import { WireframeDimensionInput } from './WireframeDimensionInput.tsx'

import type { WireframeDimensionsProps } from '../types/wireframeDimensionsProps.ts'
export function WireframeDimensions({
  t,
  node,
  editNode,
}: WireframeDimensionsProps) {
  return (
    <div className="field-row">
      {(['width', 'height'] as const).map((key) => (
        <WireframeDimensionInput
          key={key}
          dimension={key}
          t={t}
          node={node}
          editNode={editNode}
        />
      ))}
    </div>
  )
}
