export type CanvasChromeHandlersProps = {
  onTool: (tool: import('../types').CanvasTool) => void
  compact: boolean
  onMultiSelect: (value: boolean) => void
  multiSelect: boolean
}
