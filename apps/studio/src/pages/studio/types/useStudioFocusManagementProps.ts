export type UseStudioFocusManagementProps = {
  compact: boolean
  sidebarOpen: boolean
  modal:
    | 'delete'
    | 'new'
    | 'history'
    | 'import'
    | 'export'
    | 'reload'
    | 'agents'
    | null
}
