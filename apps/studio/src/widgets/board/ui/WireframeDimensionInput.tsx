import { useWireframeDimensionInputHandlers } from '../model/useWireframeDimensionInputHandlers.tsx'
import type { WireframeDimensionInputProps } from '../types/wireframeDimensionInputProps.ts'
export function WireframeDimensionInput({
  dimension,
  t,
  node,
  editNode,
}: WireframeDimensionInputProps) {
  const { handleChange } = useWireframeDimensionInputHandlers({
    dimension,
    editNode,
  })
  return (
    <label>
      {dimension === 'width' ? t('Width') : t('Height')}
      <input
        aria-label={t('Block {{value}}', { value: dimension })}
        type="number"
        min={dimension === 'width' ? 60 : 32}
        max={2400}
        value={node[dimension]}
        onChange={handleChange}
      />
    </label>
  )
}
