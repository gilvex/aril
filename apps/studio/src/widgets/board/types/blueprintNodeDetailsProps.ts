import type { Idea } from '@pomegranate/domain/workspace'
import type * as React from 'react'

export type BlueprintNodeDetailsProps = {
  node: import('@pomegranate/domain/workspace').Idea
  editField: React.RefObject<HTMLInputElement | null>
  updateNode: (data: Partial<Idea['data']>) => void
  openRequirement: (id: string) => void
  requirements: {
    id: string
    title: string
    description: string
    category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
    priority: 'Must have' | 'Should have' | 'Later'
    status: 'Captured' | 'Designing' | 'Ready'
    acceptance: string
  }[]
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  setSelected: (id: string | null) => void
  removeNode: () => void
}
