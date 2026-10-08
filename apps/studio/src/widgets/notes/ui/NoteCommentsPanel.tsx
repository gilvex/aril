import { useCallback } from 'react'
import { useCompactLayout } from '@/shared/model/index.ts'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { NoteEditorProps } from '../types/noteEditorProps.ts'
import { NoteComments } from './NoteComments.tsx'

export function NoteCommentsPanel(props: NoteEditorProps) {
  const compact = useCompactLayout()
  const { t } = useTranslation()
  const { patch } = props.model
  const openChanged = useCallback(
    (open: boolean) => patch({ comments: open }),
    [patch],
  )
  if (!compact) return <NoteComments {...props} />
  return (
    <StudioDrawer
      open
      onOpenChange={openChanged}
      title={t('Note comments')}
      className="note-comments-drawer"
    >
      <NoteComments {...props} />
    </StudioDrawer>
  )
}
