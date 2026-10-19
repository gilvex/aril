import { legacyNodeIcons } from '../config/legacyNodeIcons.ts'

export function normalizeLegacyNodeData(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input
  const data = input as Record<string, unknown>
  if (
    typeof data.kind !== 'string' ||
    !Object.hasOwn(legacyNodeIcons, data.kind)
  )
    return input
  return {
    ...data,
    kind: 'block',
    icon:
      data.icon ?? legacyNodeIcons[data.kind as keyof typeof legacyNodeIcons],
  }
}
