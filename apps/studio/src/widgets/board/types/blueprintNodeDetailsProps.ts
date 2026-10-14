import type { Idea } from '@aril/domain/workspace'
import type * as React from 'react'

export type BlueprintNodeDetailsProps = {
  node: import('@aril/domain/workspace').Idea
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
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@aril/domain/workspace').Board
  setSelected: (id: string | null) => void
  removeNode: () => void
}
