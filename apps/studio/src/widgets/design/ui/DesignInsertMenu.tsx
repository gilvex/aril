import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designTools } from '../config/designTools.ts'
import { useDesignContextMenu } from '../model/useDesignContextMenu.ts'
import type { DesignToolbarProps } from '../types/designToolbarProps.ts'

export function DesignInsertMenu({
  model,
  add,
  insertTemplate,
}: DesignToolbarProps) {
  const { t } = useTranslation()
  const context = useDesignContextMenu(model)
  const actions = useMemo(
    () => [
      ...designTools.map(({ kind, label, ...rest }) => ({
        id: label,
        label: t(label),
        disabled: model.page.nodes.length >= 500,
        run: () => add(kind, 'mobile' in rest && !!rest.mobile),
      })),
      {
        id: 'template',
        label: t('Server dashboard template'),
        separator: true,
        disabled: model.page.nodes.length > 440,
        run: insertTemplate,
      },
      ...context.actions.filter(
        (action) => !designTools.some((tool) => tool.label === action.id),
      ),
    ],
    [add, context.actions, insertTemplate, model.page.nodes.length, t],
  )
  return (
    <EditorActionMenu actions={actions} label={t('Insert element')}>
      <StudioActionButton
        variant="primary"
        title={t('Insert')}
        aria-label={t('Insert')}
      >
        <Plus size={18} />
      </StudioActionButton>
    </EditorActionMenu>
  )
}
