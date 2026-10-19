import type { WorkspaceCardProps } from './workspaceCardProps.ts'
export type WorkspaceGridProps = Pick<
  WorkspaceCardProps,
  'onOpen' | 'onManage'
> & { studios: WorkspaceCardProps['studio'][]; visits: Record<string, number> }
