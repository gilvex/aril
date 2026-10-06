import { InstallApp } from '@/features/installApp/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceHomeHandlers } from '../model/useWorkspaceHomeHandlers.tsx'
import { CreateWorkspaceForm } from './CreateWorkspaceForm.tsx'

import { ThemePicker } from '@/features/appearance/index.ts'
import { createWorkspaceHomeState } from '@/pages/workspaces/model/createWorkspaceHomeState.ts'
import { useWorkspaceHomeModel } from '@/pages/workspaces/model/useWorkspaceHomeModel.ts'
import type { WorkspaceHomeProps } from '@/pages/workspaces/types/workspaceHomeProps.ts'
import { ArrowUpRight, Plus, Workflow } from 'lucide-react'

export function WorkspaceHome({ profile, onOpen, notice }: WorkspaceHomeProps) {
  const { t } = useTranslation()

  const {
    studios,
    name,
    setName,
    creating,
    setCreating,
    busy,
    error,
    hostedOrigin,
    createWorkspace,
    openHostedWorkspace,
  } = useWorkspaceHomeModel(() => createWorkspaceHomeState())

  const { handleSubmit } = useWorkspaceHomeHandlers({
    createWorkspace,
    name,
    onOpen,
  })
  return (
    <main className="workspace-home">
      <header className="workspace-home-header">
        <a className="brand" href="/">
          <img src="/mark.svg" alt="" />
          <span>
            {t('pomegranate')}
            <small>{t('Planning studio')}</small>
          </span>
        </a>
        <div className="workspace-home-preferences">
          <ThemePicker />
          <LanguagePicker />
          <span className="muted">{profile.name}</span>
        </div>
      </header>
      {hostedOrigin && (
        <div className="workspace-hosted">
          <span>{t('Your shared studio is ready online.')}</span>
          <button
            className="button"
            disabled={busy}
            onClick={() => openHostedWorkspace()}
          >
            {t('Open hosted studio')}
            <ArrowUpRight size={15} />
          </button>
        </div>
      )}
      <div className="workspace-home-title">
        <div>
          <span className="eyebrow">{t('ROOM TO GROW')}</span>
          <h1>{t('Your workspaces.')}</h1>
          <p>
            {t(
              'A little space for every big idea. Only workspaces you belong to appear here.',
            )}
          </p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          <Plus size={16} />
          {t('New workspace')}
        </button>
      </div>
      <InstallApp />
      {notice && <p role="status">{notice}</p>}
      {creating && (
        <CreateWorkspaceForm
          handleSubmit={handleSubmit}
          t={t}
          name={name}
          setName={setName}
          setCreating={setCreating}
          busy={busy}
        />
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!studios && !error && (
        <LoadingStatus label={t('Loading your workspaces…')} />
      )}
      <div className="workspace-grid">
        {studios?.map((studio) => (
          <button
            key={studio.id}
            className="workspace-card"
            onClick={() => onOpen(studio)}
          >
            <span className="workspace-card-icon">
              <Workflow size={24} />
            </span>
            <span className="workspace-card-role">
              {studio.role === 'owner'
                ? t('Your workspace')
                : t('Shared with you')}
            </span>
            <h2>{studio.name}</h2>
            <span className="workspace-card-footer">
              {t('Open planning studio')}
              <ArrowUpRight size={18} />
            </span>
          </button>
        ))}
      </div>
      {studios?.length === 0 && (
        <p>
          {t(
            'No workspaces yet. Create one or open an invitation to join your team.',
          )}
        </p>
      )}
    </main>
  )
}
