import type { Workspace } from '@pomegranate/domain/workspace'
import { requirementOptions } from '../config/requirementOptions.ts'
export function moveRequirements(
  workspace: Workspace,
  ids: string[],
  field: 'priority' | 'status' | 'category',
  value: string,
): Workspace {
  if (!(requirementOptions[field] as readonly string[]).includes(value))
    return workspace
  const targets = new Set(ids)
  if (
    !workspace.requirements.some(
      (item) => targets.has(item.id) && item[field] !== value,
    )
  )
    return workspace
  return {
    ...workspace,
    requirements: workspace.requirements.map((item) =>
      targets.has(item.id) ? { ...item, [field]: value } : item,
    ),
  }
}
