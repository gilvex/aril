import { downloadJson } from '@/shared/api/downloadJson.ts'
import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { useCallback, useEffect } from 'react'
import type { UseStudioWorkspaceActionsProps } from '../types/useStudioWorkspaceActionsProps.ts'
export function useStudioWorkspaceActions({
  setModal,
  setSidebarOpen,
  state,
  workspace,
  setHistoryLoading,
  setSnapshots,
  studio,
  setNotice,
}: UseStudioWorkspaceActionsProps) {
  const { undo, redo, flush } = state
  const studioId = studio.id
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal(null)
        setSidebarOpen(false)
      }
      const target = e.target as HTMLElement
      if (target.closest('input,textarea,select,[contenteditable]')) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void flush()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [undo, redo, flush, setModal, setSidebarOpen])
  const exportWorkspace = useCallback(() => setModal('export'), [setModal])
  const downloadWorkspace = useCallback(
    () =>
      downloadJson(
        workspace,
        `pomegranate-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      ),
    [workspace],
  )
  const loadHistory = useCallback(async () => {
    setModal('history')
    setHistoryLoading(true)
    try {
      await flush()
      setSnapshots(
        await request('/api/history', { headers: workspaceHeaders(studioId) }),
      )
    } catch (err) {
      setNotice(String(err))
    } finally {
      setHistoryLoading(false)
    }
  }, [setModal, setHistoryLoading, flush, setSnapshots, studioId, setNotice])
  return { loadHistory, exportWorkspace, downloadWorkspace }
}
