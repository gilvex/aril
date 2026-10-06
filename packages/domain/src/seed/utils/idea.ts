import type { Idea } from '../../workspace/index.ts'

export const idea = (
  id: string,
  title: string,
  description: string,
  kind: Idea['data']['kind'],
  x: number,
  y: number,
  requirements: string[] = [],
  notes = '',
): Idea => ({
  id,
  type: 'idea',
  position: { x, y },
  data: { title, description, kind, status: 'Exploring', requirements, notes },
})
