import type { RequirementPresence } from '@pomegranate/domain/collaboration'
export function createRequirementsState() {
  const query: string = ''
  const category: string = 'All areas'
  const activity: RequirementPresence | null = null
  return { query, category, activity }
}
