import { useCallback, useMemo } from 'react'
import { Play, GitBranch, Plus, ArrowLeft } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
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
        <StudioActionButton
          disabled={!machines.length}
          title={t('State machines')}
          aria-label={t('State machines')}
        >
          <GitBranch size={18} />
        </StudioActionButton>
      </EditorActionMenu>
      <StudioActionButton
        disabled={role === 'viewer' || role === null || machines.length >= 100}
        onClick={model.addMachine}
        title={t('New state machine')}
        aria-label={t('New state machine')}
      >
        <Plus size={18} />
      </StudioActionButton>
      <StudioActionButton
        disabled={!model.machineId}
        onClick={play}
        title={t('Test machine')}
        aria-label={t('Test machine')}
      >
        <Play size={18} />
      </StudioActionButton>
      <StudioActionButton
        disabled={model.libraryView === 'canvas'}
        onClick={model.closeAsset}
        title={t('Back to canvas')}
        aria-label={t('Back to canvas')}
      >
        <ArrowLeft size={18} />
      </StudioActionButton>
    </>
  )
}
