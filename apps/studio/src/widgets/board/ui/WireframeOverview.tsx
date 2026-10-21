import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { icons } from '@/widgets/board/config/wireframeBoardIcons.ts'
import { wireKinds, wireLabels } from '@aril/domain/wireframe'
import { AppWindow, ArrowRight, Plus } from 'lucide-react'

import type { WireframeOverviewProps } from '../types/wireframeOverviewProps.ts'
export function WireframeOverview({
  graph,
  setEdgeId,
  setSelection,
  add,
  screens,
  focus,
}: WireframeOverviewProps) {
  const { t } = useTranslation()

  return (
    <div className="inspector-body overview-body">
      <AppWindow size={30} strokeWidth={1.2} />
      <Text as="h2">{t('From idea to interface.')}</Text>
      <Text as="p">
        {t(
          'Start with a screen, add the pieces, then link the actions. Each board keeps its own wireframes.',
        )}
      </Text>
      {!!graph.edges.length && (
        <div className="wire-flow-index" aria-label={t('Board flows')}>
          <Text as="h3">{t('Flows')}</Text>
          {graph.edges.map((link, index) => (
            <button
              key={link.id}
              onClick={() => {
                setEdgeId(link.id)
                setSelection(new Set())
              }}
            >
              <Text as="span">{index + 1}</Text>
              <div>
                <Text as="strong">{link.label || 'On click'}</Text>
                <Text as="small">
                  {graph.nodes.find((n) => n.id === link.source)?.data.title} →{' '}
                  {graph.nodes.find((n) => n.id === link.target)?.data.title}
                </Text>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="wire-kit">
        {wireKinds.map((kind) => {
          const Icon = icons[kind]
          return (
            <button
              key={kind}
              disabled={graph.nodes.length >= 500}
              onClick={() => add(kind)}
            >
              <Icon size={18} />
              <Text as="span">{t(wireLabels[kind])}</Text>
              <Plus size={13} />
            </button>
          )
        })}
      </div>
      <div className="wire-screen-list">
        {screens.map((screen) => (
          <button key={screen.id} onClick={() => focus(screen.id)}>
            <AppWindow size={14} />
            <Text>{screen.data.title}</Text>
            <ArrowRight size={13} />
          </button>
        ))}
      </div>
      <Text as="p">
        {t(
          'Connect either side of a block to its destination, or use “What happens next?” in its details. Arrows choose the side facing their destination.',
        )}
      </Text>
    </div>
  )
}
