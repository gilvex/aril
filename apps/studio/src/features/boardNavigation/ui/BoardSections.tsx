import { Text } from '@/shared/ui/Text.tsx'
import { useRef, useCallback, type MouseEvent } from 'react'
import { Workflow, PenTool, Plus } from 'lucide-react'
import { activeBoardSections } from '@aril/domain/workspace'
import { PresenceAvatars } from '@/entities/collaboration/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { CanvasNavigationProps } from '../types/canvasNavigationProps.ts'
const sections = [
  { id: 'canvas', label: 'Blueprint', icon: Workflow },
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
  const enabled = activeBoardSections(board)
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
            <Text as="span">{t(section.label)}</Text>
            <PresenceAvatars
              limit={1}
              profiles={present
                .filter((peer) => peer.view === id && peer.boardId === board.id)
                .map((peer) => peer.profile)}
            />
          </button>
        )
      })}
      {enabled.length < 2 && role && role !== 'viewer' && (
        <details ref={menu} className="board-section-add">
          <Text
            as="summary"
            title={t('Add section')}
            aria-label={t('Add section')}
          >
            <Plus size={16} />
          </Text>
          <div>
            {sections
              .filter((section) => !enabled.includes(section.id))
              .map(({ id, label, icon: Icon }) => (
                <button key={id} data-section={id} onClick={add}>
                  <Icon size={16} />
                  <Text>{t(label)}</Text>
                </button>
              ))}
          </div>
        </details>
      )}
    </div>
  )
}
