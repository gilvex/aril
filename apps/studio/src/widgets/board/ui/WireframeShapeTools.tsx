import { useMemo } from 'react'
import { Plus, Link2 } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { wireKinds, wireLabels } from '@pomegranate/domain/wireframe'
import { icons } from '../config/wireframeBoardIcons.ts'
import type { WireframeToolbarProps } from '../types/wireframeToolbarProps.ts'
export function WireframeShapeTools({
  graph,
  add,
  tool,
  setTool,
}: Pick<WireframeToolbarProps, 'graph' | 'add' | 'tool' | 'setTool'>) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const disabled = readOnly || graph.nodes.length >= 500
  const actions = useMemo(
    () =>
      wireKinds.map((kind) => ({
        id: kind,
        label: t(wireLabels[kind]),
        disabled,
        run: () => add(kind),
      })),
    [add, disabled, t],
  )
  return (
    <>
      <ActionBarButton
        disabled={readOnly}
        title={t('Connect tool')}
        aria-label={t('Connect tool')}
        aria-pressed={tool === 'connect'}
        onClick={() => setTool('connect')}
      >
        <Link2 size={18} />
      </ActionBarButton>
      {(['screen', 'text', 'button'] as const).map((kind) => {
        const Icon = icons[kind]
        return (
          <ActionBarButton
            key={kind}
            title={t(wireLabels[kind])}
            aria-label={t(wireLabels[kind])}
            disabled={disabled}
            onClick={() => add(kind)}
          >
            <Icon size={18} />
          </ActionBarButton>
        )
      })}
      <EditorActionMenu actions={actions} label={t('Add block')}>
        <ActionBarButton
          disabled={disabled}
          title={t('Add block')}
          aria-label={t('Add block')}
        >
          <Plus size={18} />
        </ActionBarButton>
      </EditorActionMenu>
    </>
  )
}
