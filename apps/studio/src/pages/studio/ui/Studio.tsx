import { ControlPresenceOverlay } from '@/features/controlPresence/index.ts'
import { CursorChat } from '@/features/cursorChat/index.ts'
import { WorkspaceRoleContext } from '@/entities/workspace/index.ts'
import type { StudioProps } from '@/pages/studio/types/studioProps.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioController } from '../model/useStudioController.tsx'
import { useStudioHandlers } from '../model/useStudioHandlers.tsx'
import { StudioContent } from './StudioContent.tsx'
import { StudioDialogs } from './StudioDialogs.tsx'
import { StudioMobileMenu } from './StudioMobileMenu.tsx'
import { StudioSidebar } from './StudioSidebar.tsx'
import { StudioHeader } from './StudioHeader.tsx'
import './studioEditorShell.css'

export function Studio(props: StudioProps) {
  const { t } = useTranslation()

  const model = useStudioController({ ...props, recovery: props.recovery })
  const { full, followed, compact } = model
  const { handlePointerDownCapture, handleKeyDownCapture, handleWheelCapture } =
    useStudioHandlers(model)
  return (
    <WorkspaceRoleContext value={model.settings.role}>
      <div
        ref={full.element}
        data-collaboration-root={props.studio.id}
        className={`studio-shell canvas-first editor-shell${!compact && model.navigationCollapsed ? ' nav-collapsed' : ''}${full.fullscreen ? ' studio-fullscreen' : ''}${followed ? ' is-following' : ''}`}
        onPointerDownCapture={handlePointerDownCapture}
        onKeyDownCapture={handleKeyDownCapture}
        onWheelCapture={handleWheelCapture}
      >
        {compact && <StudioMobileMenu {...props} {...model} />}
        <StudioHeader {...props} {...model} />
        {!compact && <StudioSidebar {...props} {...model} />}
        {model.settings.role ? (
          <StudioContent {...props} {...model} />
        ) : (
          <main className="main-area workspace-access-lost">
            <h1>{t('Access to this file has ended.')}</h1>
            <p>{t('Ask the owner for a new invitation.')}</p>
            <button
              className="button"
              onClick={() => props.onWorkspaces(model.multiplayer.profile)}
            >
              {t('Back to workspaces')}
            </button>
          </main>
        )}
        <ControlPresenceOverlay
          root={full.element}
          workspaceId={props.studio.id}
          route={`${model.view}:${model.view === 'canvas' ? model.board.id + ':' + model.canvasMode : ''}`}
          active={props.active !== false && !!model.settings.role}
          peers={model.multiplayer.peers}
          sendPresence={model.sendPresence}
        />
        <CursorChat
          root={full.element}
          toolbar={model.view === 'canvas' || model.view === 'design'}
          profile={model.multiplayer.profile}
          active={
            props.active !== false &&
            !!model.settings.role &&
            !model.modal &&
            ['canvas', 'design', 'notes', 'requirements'].includes(model.view)
          }
          scope={model.view + ':' + model.board.id + ':' + model.canvasMode}
          sendPresence={model.sendPresence}
        />
        {model.modal && (
          <StudioDialogs {...props} {...model} modal={model.modal} />
        )}
      </div>
    </WorkspaceRoleContext>
  )
}
