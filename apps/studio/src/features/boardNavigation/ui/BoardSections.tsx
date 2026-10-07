import { useRef, useCallback, type MouseEvent } from 'react'
import { Workflow, PanelsTopLeft, PenTool, Plus } from 'lucide-react'
import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { CanvasNavigationProps } from '../types/canvasNavigationProps.ts'
const sections = [
  { id: 'canvas', label: 'Blueprint', icon: Workflow },
  { id: 'wireframes', label: 'Wireframes', icon: PanelsTopLeft },
  { id: 'design', label: 'Design', icon: PenTool },
] as const
export function BoardSections({
  board,
  mode,
  onMode,
  onAdd,
  present,
}: Pick<
  CanvasNavigationProps,
  'board' | 'mode' | 'onMode' | 'onAdd' | 'present'
>) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const menu = useRef<HTMLDetailsElement>(null)
  const enabled = board.sections || ['canvas', 'wireframes']
  const choose = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onMode(event.currentTarget.dataset.section as typeof mode),
    [onMode],
  )
  const add = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onAdd(event.currentTarget.dataset.section as typeof mode)
      if (menu.current) menu.current.open = false
    },
    [onAdd],
  )
  return (
    <div
      className="floating-board-sections"
      role="group"
      aria-label={t('Board section')}
    >
      {enabled.map((id) => {
        const section = sections.find((item) => item.id === id)!
        const Icon = section.icon
        return (
          <button
            key={id}
            data-section={id}
            aria-pressed={mode === id}
            onClick={choose}
          >
            <Icon size={15} />
            <span>{t(section.label)}</span>
            <PresenceAvatars
              limit={1}
              profiles={present
                .filter((peer) => peer.view === id && peer.boardId === board.id)
                .map((peer) => peer.profile)}
            />
          </button>
        )
      })}
      {enabled.length < 3 && role && role !== 'viewer' && (
        <details ref={menu} className="board-section-add">
          <summary title={t('Add section')} aria-label={t('Add section')}>
            <Plus size={16} />
          </summary>
          <div>
            {sections
              .filter((section) => !enabled.includes(section.id))
              .map(({ id, label, icon: Icon }) => (
                <button key={id} data-section={id} onClick={add}>
                  <Icon size={16} />
                  {t(label)}
                </button>
              ))}
          </div>
        </details>
      )}
    </div>
  )
}
