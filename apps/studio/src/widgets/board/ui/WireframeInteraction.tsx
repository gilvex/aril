import { Text } from '@/shared/ui/Text.tsx'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { wireLabels } from '@aril/domain/wireframe'
import { ArrowRight, Link2 } from 'lucide-react'

import type { WireframeInteractionProps } from '../types/wireframeInteractionProps.ts'
export function WireframeInteraction({
  trigger,
  setTrigger,
  targetId,
  setTargetId,
  graph,
  node,
  connect,
  setEdgeId,
  setSelection,
}: WireframeInteractionProps) {
  const { t } = useTranslation()

  return (
    <section className="wire-interaction">
      <Text as="h3">
        <Link2 size={15} />
        {t('What happens next?')}
      </Text>
      <Text as="label">
        {t('Trigger')}
        <input
          aria-label={t('Flow trigger')}
          value={trigger}
          maxLength={120}
          onChange={(e) => setTrigger(e.target.value)}
        />
      </Text>
      <Text as="label">
        {t('Destination')}
        <StudioSelect
          aria-label={t('Flow destination')}
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        >
          <option value="">{t('Choose a block or screen…')}</option>
          {graph.nodes
            .filter((n) => n.id !== node.id)
            .map((n) => (
              <option key={n.id} value={n.id}>
                {t(wireLabels[n.data.kind])} · {n.data.title}
              </option>
            ))}
        </StudioSelect>
      </Text>
      <button
        className="button"
        disabled={
          !targetId ||
          targetId === node.id ||
          !graph.nodes.some((n) => n.id === targetId)
        }
        onClick={() => connect(node.id, targetId, trigger.trim() || 'On click')}
      >
        <ArrowRight size={14} />
        <Text>{t('Connect flow')}</Text>
      </button>
      {graph.edges
        .filter((e) => e.source === node.id)
        .map((e) => (
          <button
            className="wire-existing-flow"
            key={e.id}
            onClick={() => {
              setEdgeId(e.id)
              setSelection(new Set())
            }}
          >
            <Text>{e.label}</Text>
            <ArrowRight size={12} />
            <Text>{graph.nodes.find((n) => n.id === e.target)?.data.title}</Text>
          </button>
        ))}
    </section>
  )
}
