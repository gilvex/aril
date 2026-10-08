import { useMemo } from 'react'
import { Plus, Link2 } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { nodeKinds } from '@pomegranate/domain/workspace'
import { kindIcons } from '../config/kindIcons.ts'
import { kindLabels } from '../config/kindLabels.ts'
import type { BlueprintToolbarProps } from '../types/blueprintToolbarProps.ts'
export function BlueprintShapeTools({
  addNode,
  tool,
  setTool,
  board,
}: Pick<BlueprintToolbarProps, 'addNode' | 'tool' | 'setTool' | 'board'>) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const disabled = readOnly || board.nodes.length >= 500
  const actions = useMemo(
    () =>
      nodeKinds.map((kind) => ({
        id: kind,
        label: t(kindLabels[kind]),
        disabled,
        run: () => addNode(kind),
      })),
    [addNode, disabled, t],
  )
  return (
    <>
      <StudioActionButton
        disabled={readOnly}
        title={t('Connect tool')}
        aria-label={t('Connect tool')}
        aria-pressed={tool === 'connect'}
        onClick={() => setTool('connect')}
      >
        <Link2 size={18} />
      </StudioActionButton>
      {(['service', 'database', 'note'] as const).map((kind) => {
        const Icon = kindIcons[kind]
        return (
          <StudioActionButton
            key={kind}
            disabled={disabled}
            title={t(kindLabels[kind])}
            aria-label={t(kindLabels[kind])}
            onClick={() => addNode(kind)}
          >
            <Icon size={18} />
          </StudioActionButton>
        )
      })}
      <EditorActionMenu actions={actions} label={t('Add node')}>
        <StudioActionButton
          variant="primary"
          disabled={disabled}
          title={t('Add node')}
          aria-label={t('Add node')}
        >
          <Plus size={18} />
        </StudioActionButton>
      </EditorActionMenu>
    </>
  )
}
