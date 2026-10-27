import { Text } from '@/shared/ui/Text.tsx'
import { useCompactLayout, useDraggableSurface } from '@/shared/model/index.ts'
import { StudioDrawer, SurfaceGrip } from '@/shared/ui/index.tsx'
import { useCallback, useRef } from 'react'
import { X, Settings } from 'lucide-react'
import { AccountActions } from '@/features/accountActions/index.ts'
import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { TeamActivityList } from './TeamActivityList.tsx'
import { CollaboratorList } from './CollaboratorList.tsx'
import type { CollaborationPopoverProps } from '../types/collaborationPopoverProps.ts'
import './collaborationCompact.css'
export function CollaborationPopover(props: CollaborationPopoverProps) {
  const { t } = useTranslation()
  const { panel, setPanel, opener, onSettings } = props
  const compact = useCompactLayout()
  const surface = useRef<HTMLElement>(null)
  useDraggableSurface(surface, panel)
  const close = useCallback(() => {
    setPanel(null)
    opener.current?.focus()
  }, [setPanel, opener])
  const settings = useCallback(
    () => onSettings?.(panel === 'people' ? 'file' : 'user'),
    [onSettings, panel],
  )
  const backdrop = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) close()
    },
    [close],
  )
  const title =
    panel === 'profile'
      ? 'Your profile'
      : panel === 'people'
        ? 'People and invites'
        : 'Team activity'
  const change = useCallback(
    (open: boolean) => {
      if (!open) close()
    },
    [close],
  )
  const content = (
    <section
      ref={surface}
      className={
        'collaboration-popover compact-collaboration ' +
        (panel === 'activity' ? 'activity-modal' : '')
      }
      role={compact ? undefined : 'dialog'}
      aria-modal={(!compact && panel === 'activity') || undefined}
      aria-label={t(title)}
    >
      <header className="collaboration-popover-heading">
        <SurfaceGrip />
        <Text as="strong">{t(title)}</Text>
        <button
          className="icon-button"
          aria-label={t('Close collaboration panel')}
          onClick={close}
        >
          <X size={17} />
        </button>
      </header>
      {panel === 'profile' ? (
        <>
          <div className="compact-profile">
            <Avatar profile={props.profile} />
            <Text as="strong">{props.profile.name}</Text>
          </div>
          <button className="button compact-settings-link" onClick={settings}>
            <Settings size={16} />
            <Text>{t('Edit profile')}</Text>
          </button>
          <AccountActions beforeLeave={props.beforeLeave} />
        </>
      ) : panel === 'people' ? (
        <>
          <CollaboratorList {...props} />
          <button className="button compact-settings-link" onClick={settings}>
            <Settings size={16} />
            <Text>{t('Manage access')}</Text>
          </button>
        </>
      ) : (
        <TeamActivityList activity={props.activity} t={t} />
      )}
    </section>
  )
  if (compact)
    return (
      <StudioDrawer open onOpenChange={change} title={t(title)}>
        {content}
      </StudioDrawer>
    )
  return (
    <div
      className={
        panel === 'activity'
          ? 'activity-modal-backdrop'
          : 'collaboration-popover-anchor'
      }
      onClick={backdrop}
    >
      {content}
    </div>
  )
}
