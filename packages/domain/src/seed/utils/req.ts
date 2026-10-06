import type { Requirement } from '../../workspace/index.ts'

export const req = (
  id: string,
  title: string,
  description: string,
  category: Requirement['category'],
  acceptance: string,
  priority: Requirement['priority'] = 'Must have',
): Requirement => ({
  id,
  title,
  description,
  category,
  priority,
  status: 'Captured',
  acceptance,
})
