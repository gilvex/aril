import type { Idea } from '@pomegranate/domain/workspace'
import { addEdge, type Connection } from '@xyflow/react'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import type { UseBlueprintEditingProps } from '../types/useBlueprintEditingProps.ts'
export function useBlueprintEditing({
  setSelected,
  setSelectedEdge,
  setInspectorOpen,
  setTouchSelection,
  setTool,
  setPalette,
  setInsertPoint,
  editField,
  update,
  board,
  selected,
}: UseBlueprintEditingProps) {
  const editItem = useCallback(
    (id: string, connection = false) => {
      flushSync(() => {
        setSelected(connection ? null : id)
        setSelectedEdge(connection ? id : null)
        setInspectorOpen(true)
        setTouchSelection(false)
        setTool('select')
        setPalette(false)
        setInsertPoint(null)
      })
      editField.current?.focus()
      editField.current?.select()
    },
    [
      setSelected,
      setSelectedEdge,
      setInspectorOpen,
      setTouchSelection,
      setTool,
      setPalette,
      setInsertPoint,
      editField,
    ],
  )
  const updateNode = useCallback(
    (data: Partial<Idea['data']>) =>
      update({
        ...board,
        nodes: board.nodes.map((n) =>
          n.id === selected ? { ...n, data: { ...n.data, ...data } } : n,
        ),
      }),
    [update, board, selected],
  )
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return
      if (
        board.edges.some(
          (e) =>
            e.source === connection.source && e.target === connection.target,
        )
      )
        return
      update({
        ...board,
        edges: addEdge(
          {
            ...connection,
            id: crypto.randomUUID(),
            type: 'smoothstep',
            label: 'connects to',
          },
          board.edges,
        ),
      })
    },
    [board, update],
  )
  return { onConnect, editItem, updateNode }
}
