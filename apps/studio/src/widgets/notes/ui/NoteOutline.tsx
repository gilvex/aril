import { useTranslation } from '@/shared/i18n/index.ts'
import { X } from 'lucide-react'
import type { useNoteEditor } from '../model/useNoteEditor.ts'
export function NoteOutline({
  editor,
  close,
}: {
  editor: ReturnType<typeof useNoteEditor>
  close: () => void
}) {
  const { t } = useTranslation()
  return (
    <aside className="notebook-outline">
      <div className="notebook-panel-heading">
        <strong>{t('Outline')}</strong>
        <button
          className="icon-button"
          aria-label={t('Close outline')}
          onClick={close}
        >
          <X size={16} />
        </button>
      </div>
      {editor.headings.map((heading) => (
        <button
          key={heading.line}
          style={{ paddingLeft: 16 + (heading.depth - 1) * 10 }}
          onClick={() => editor.jump(heading.line)}
        >
          {heading.title}
        </button>
      ))}
      {!editor.headings.length && (
        <p className="empty-message">
          {t('Add Markdown headings to navigate this note.')}
        </p>
      )}
    </aside>
  )
}
