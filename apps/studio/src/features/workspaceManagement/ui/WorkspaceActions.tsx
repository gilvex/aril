import { useMemo } from 'react'
import { Ellipsis } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { EditorActionMenu, EditorContextMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { WorkspaceActionsProps } from '../types/workspaceActionsProps.ts'
import './workspaceManagement.css'

export function WorkspaceActions({
  studio,
  onManage,
  children,
}: WorkspaceActionsProps) {
  const { t } = useTranslation()
  const actions = useMemo(
    () => [
      {
        id: 'rename',
        label: t('Rename'),
        run: () => onManage?.(studio, 'rename'),
      },
      {
        id: 'delete',
        label: t('Delete'),
        run: () => onManage?.(studio, 'delete'),
        danger: true,
        separator: true,
      },
    ],
    [studio, onManage, t],
  )
  const label = t('Workspace actions for {{name}}', { name: studio.name })
  if (studio.role !== 'owner' || !onManage) return children || null
  const menu = (
    <EditorActionMenu label={label} actions={actions}>
      <Button
        variant="ghost"
        size="icon"
        className="workspace-action-trigger"
        aria-label={label}
        title={label}
      >
        <Ellipsis size={18} />
      </Button>
    </EditorActionMenu>
  )
  return children ? (
    <EditorContextMenu label={label} actions={actions}>
      <div className="workspace-card-shell">
        {children}
        {menu}
      </div>
    </EditorContextMenu>
  ) : (
    menu
  )
}
