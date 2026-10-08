import { useCallback, type MouseEvent } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { useReactFlow } from '@xyflow/react'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignContextMenu } from '../model/useDesignContextMenu.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'

export function DesignCanvasActions({
  model,
  labelled = false,
}: {
  model: DesignEditorModel
  labelled?: boolean
}) {
  const { t } = useTranslation()
  const flow = useReactFlow()
  const { actions } = useDesignContextMenu(model)
  const prepare = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget
        .closest('.design-canvas-surface')
        ?.getBoundingClientRect()
      if (rect)
        model.patch({
          contextPoint: flow.screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }),
        })
    },
    [flow, model],
  )
  return (
    <EditorActionMenu actions={actions} label={t('Canvas actions')}>
      <StudioActionButton
        aria-label={t('Canvas actions')}
        title={t('Canvas actions')}
        onClick={prepare}
      >
        <MoreHorizontal size={18} />
        {labelled && <span>{t('Canvas actions')}</span>}
      </StudioActionButton>
    </EditorActionMenu>
  )
}
