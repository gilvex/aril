import { useEffect } from 'react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { pasteCanvasNodes } from '@aril/domain/workspace'
import type { CanvasClipboardProps } from '../types/canvasClipboardProps.ts'
export function useCanvasClipboard({
  checkpoint,
  board,
  selectedIds,
  canvasRef,
  update,
  setSelectedIds,
}: CanvasClipboardProps) {
  const role = useWorkspaceRole()
  useEffect(() => {
    const ready = (event: ClipboardEvent) => {
      const surface = canvasRef.current
      const target = event.target
      return (
        !!surface?.getClientRects().length &&
        !surface.closest('[hidden],[inert]') &&
        !(
          target instanceof Element &&
          target.closest(
            'input,textarea,select,[contenteditable],[role=textbox]',
          )
        ) &&
        !document.querySelector('dialog[open]') &&
        !window.getSelection()?.toString()
      )
    }
    const copy = (event: ClipboardEvent) => {
      if (!ready(event) || !event.clipboardData) return
      const nodes = board.nodes.filter((node) => selectedIds.has(node.id))
      if (!nodes.length) return
      const payload = JSON.stringify({
        format: 'aril-canvas',
        version: 1,
        nodes,
        edges: board.edges.filter(
          (edge) =>
            selectedIds.has(edge.source) && selectedIds.has(edge.target),
        ),
      })
      event.clipboardData.setData('application/x-aril-canvas+json', payload)
      event.clipboardData.setData('text/plain', payload)
      event.preventDefault()
    }
    const paste = (event: ClipboardEvent) => {
      if (
        role === 'viewer' ||
        role === null ||
        !ready(event) ||
        !event.clipboardData
      )
        return
      const raw =
        event.clipboardData.getData('application/x-aril-canvas+json') ||
        event.clipboardData.getData('text/plain')
      if (raw.length > 2_000_000) return
      try {
        const result = pasteCanvasNodes(board, JSON.parse(raw))
        if (!result) return
        event.preventDefault()
        checkpoint()
        update(result.board)
        checkpoint()
        setSelectedIds(new Set(result.selected))
      } catch {
        /* Non-Aril clipboard text keeps the browser's normal behavior. */
      }
    }
    window.addEventListener('copy', copy)
    window.addEventListener('paste', paste)
    return () => {
      window.removeEventListener('copy', copy)
      window.removeEventListener('paste', paste)
    }
  }, [board, selectedIds, canvasRef, update, setSelectedIds, role, checkpoint])
}
