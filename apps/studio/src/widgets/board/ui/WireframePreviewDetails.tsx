import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Pencil, Play } from 'lucide-react'
import { WireframePreviewDestination } from './WireframePreviewDestination.tsx'

import type { WireframePreviewDetailsProps } from '../types/wireframePreviewDetailsProps.ts'
export function WireframePreviewDetails({
  previewMessage,
  node,
  graph,
  focus,
  setPreviewMessage,
  setPreview,
}: WireframePreviewDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className="inspector-body">
      <Play size={22} />
      <Text as="h2">{t('Try the journey.')}</Text>
      <Text as="p" role="status">
        {previewMessage}
      </Text>
      {node && (
        <>
          <Text as="strong">{node.data.title}</Text>
          {graph.edges
            .filter((e) => e.source === node.id)
            .map((e) => (
              <WireframePreviewDestination
                key={e.id}
                e={e}
                focus={focus}
                setPreviewMessage={setPreviewMessage}
                graph={graph}
              />
            ))}
        </>
      )}
      <button className="button" onClick={() => setPreview(false)}>
        <Pencil size={14} />
        <Text>{t('Back to editing')}</Text>
      </button>
    </div>
  )
}
