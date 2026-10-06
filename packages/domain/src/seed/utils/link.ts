export const link = (source: string, target: string, label: string) => ({
  id: `${source}-${target}`,
  source,
  target,
  label,
  type: 'smoothstep' as const,
})
