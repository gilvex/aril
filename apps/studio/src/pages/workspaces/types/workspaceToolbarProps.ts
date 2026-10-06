import type { WorkspaceSort } from './workspaceSort.ts'
export type WorkspaceToolbarProps = {
  canCreate?: boolean
  count?: number
  search: string
  sort: WorkspaceSort
  onSearch: (value: string) => void
  onSort: (value: WorkspaceSort) => void
  onCreate: () => void
}
