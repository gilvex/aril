import type { RequirementLink } from '@pomegranate/domain/workspace'
export function scopeTargetKey(link: RequirementLink) {
  return JSON.stringify([link.kind, link.boardId || '', link.pageId || ''])
}
