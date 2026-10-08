import type { SelectChange } from '@/shared/types/selectChange.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Bold, Italic, Heading2, List, ListChecks, Link } from 'lucide-react'
import type { Workspace } from '@pomegranate/domain/workspace'
const formats = [
  { name: 'Heading', Icon: Heading2 },
  { name: 'Bold', Icon: Bold },
  { name: 'Italic', Icon: Italic },
  { name: 'Bullet list', Icon: List },
  { name: 'Checklist', Icon: ListChecks },
  { name: 'Link', Icon: Link },
]
export function NoteFormatBar({
  format,
  insertLink,
  workspace,
}: {
  format: (kind: string) => void
  insertLink: (e: SelectChange) => void
  workspace: Workspace
}) {
  const { t } = useTranslation()
  return (
    <div
      className="notebook-format"
      role="toolbar"
      aria-label={t('Text formatting')}
    >
      {formats.map(({ name, Icon }) => (
        <button
          key={name}
          className="icon-button"
          title={t(name)}
          aria-label={t(name)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => format(name)}
        >
          <Icon size={16} />
        </button>
      ))}
      <StudioSelect
        aria-label={t('Link to workspace')}
        value=""
        onChange={insertLink}
      >
        <option value="" disabled>
          {t('Link to…')}
        </option>
        <optgroup label={t('Boards')}>
          {workspace.boards.map((board) => (
            <option
              key={board.id}
              value={JSON.stringify(['board', board.id, board.name])}
            >
              {board.name}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('Requirements')}>
          {workspace.requirements.map((req) => (
            <option
              key={req.id}
              value={JSON.stringify(['requirement', req.id, req.title])}
            >
              {req.id} · {req.title}
            </option>
          ))}
        </optgroup>
      </StudioSelect>
    </div>
  )
}
