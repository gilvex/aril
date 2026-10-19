import { WorkspaceCard } from './WorkspaceCard.tsx'
import type { WorkspaceGridProps } from '../types/workspaceGridProps.ts'
export function WorkspaceGrid({
  studios,
  visits,
  onOpen,
  onManage,
}: WorkspaceGridProps) {
  return (
    <div className="workspace-grid">
      {studios.map((studio) => (
        <WorkspaceCard
          key={studio.id}
          studio={studio}
          visited={visits[studio.id]}
          onOpen={onOpen}
          onManage={onManage}
        />
      ))}
    </div>
  )
}
