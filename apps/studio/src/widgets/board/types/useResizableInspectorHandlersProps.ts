export type ResizableInspectorHandlersProps = {
  drag: import('react').RefObject<{
    pointerId: number
    x: number
    width: number
  } | null>
  visibleWidth: number
  setResizing: (
    value:
      | import('../types').ResizableInspectorState['resizing']
      | ((
          current: import('../types').ResizableInspectorState['resizing'],
        ) => import('../types').ResizableInspectorState['resizing']),
  ) => void
  resize: (next: number) => number
  remember: (value: number) => void
  limit: number
}
