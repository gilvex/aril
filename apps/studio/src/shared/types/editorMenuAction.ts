export type EditorMenuAction = {
  id: string
  label: string
  run: () => void
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  shortcut?: string
}
