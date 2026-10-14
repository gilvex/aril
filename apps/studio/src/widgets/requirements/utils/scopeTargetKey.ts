import type { RequirementLink } from '@aril/domain/workspace'
export function scopeTargetKey(link: RequirementLink) {
  return JSON.stringify([link.kind, link.boardId || '', link.pageId || ''])
}
