import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { History } from 'lucide-react'
import { RevisionHistoryItem } from './RevisionHistoryItem.tsx'

import type { WorkspaceHistoryDialogProps } from '../types/workspaceHistoryDialogProps.ts'
export function WorkspaceHistoryDialog({
  historyLoading,
  snapshots,
  studio,
  state,
  change,
  setModal,
  setNotice,
}: WorkspaceHistoryDialogProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="modal-symbol">
        <History size={25} />
      </div>
      <h2 id="modal-title">{t('Your ideas have a history.')}</h2>
      <p>
        {t(
          'Up to 30 previous saves are kept locally. Restoring a revision replaces the entire workspace and can be undone.',
        )}
      </p>
      <div className="snapshot-list">
        {historyLoading ? (
          <LoadingSkeleton label={t('Loading saved revisions…')} />
        ) : !snapshots.length ? (
          <p>{t('No previous saves yet. Make your first change to begin.')}</p>
        ) : (
          snapshots.map((s) => (
            <div key={s.revision}>
              <span>
                <strong>
                  {t('Revision')} {s.revision}
                </strong>
                <small>{new Date(s.savedAt).toLocaleString()}</small>
              </span>
              <RevisionHistoryItem
                s={s}
                studio={studio}
                state={state}
                change={change}
                setModal={setModal}
                setNotice={setNotice}
              />
            </div>
          ))
        )}
      </div>
    </>
  )
}
