import { useCallback, useMemo } from 'react'
import { Play, GitBranch, Plus, ArrowLeft } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function DesignMotionTools({ model }: { model: DesignEditorModel }) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const machines = Object.values(model.library.machines)
  const actions = useMemo(
    () =>
      Object.values(model.library.machines).map((machine) => ({
        id: machine.id,
        label: machine.name,
        run: () => model.openAsset('machine', machine.id),
      })),
    [model],
  )
  const play = useCallback(() => model.simulate(), [model])
  return (
    <>
      <EditorActionMenu actions={actions} label={t('State machines')}>
        <ActionBarButton
          disabled={!machines.length}
          title={t('State machines')}
          aria-label={t('State machines')}
        >
          <GitBranch size={18} />
        </ActionBarButton>
      </EditorActionMenu>
      <ActionBarButton
        disabled={role === 'viewer' || role === null || machines.length >= 100}
        onClick={model.addMachine}
        title={t('New state machine')}
        aria-label={t('New state machine')}
      >
        <Plus size={18} />
      </ActionBarButton>
      <ActionBarButton
        disabled={!model.machineId}
        onClick={play}
        title={t('Test machine')}
        aria-label={t('Test machine')}
      >
        <Play size={18} />
      </ActionBarButton>
      <ActionBarButton
        disabled={model.libraryView === 'canvas'}
        onClick={model.closeAsset}
        title={t('Back to canvas')}
        aria-label={t('Back to canvas')}
      >
        <ArrowLeft size={18} />
      </ActionBarButton>
    </>
  )
}
