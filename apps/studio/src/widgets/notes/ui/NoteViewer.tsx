import type { Presence } from '@pomegranate/domain/collaboration'
import { useTranslation } from '@/shared/i18n/index.ts'

export function NoteViewer({ peer }: { peer: Presence }) {
  const { t } = useTranslation()
  return (
    <div className="note-viewer">
      <span style={{ borderColor: peer.profile.color }}>
        {peer.profile.name} ·{' '}
        {peer.selected.includes('note-field:body') ||
        peer.selected.includes('note-field:title')
          ? t('Editing')
          : t('Viewing')}
      </span>
    </div>
  )
}
