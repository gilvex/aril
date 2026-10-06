import { useTranslation } from '@/shared/i18n/index.ts'
import { LayersIllustration } from '@/widgets/board/ui/LayersIllustration.tsx'
import { MousePointer2 } from 'lucide-react'

import type { BlueprintOverviewProps } from '../types/blueprintOverviewProps.ts'
export function BlueprintOverview({ board, update }: BlueprintOverviewProps) {
  const { t } = useTranslation()

  return (
    <div className="inspector-body overview-body">
      <div className="overview-art">
        <LayersIllustration />
      </div>
      <h2>
        {t('Give your ideas')}
        <br />
        {t('a place to connect.')}
      </h2>
      <p>
        {t(
          'Map the system, explore a flow, or leave a question for later. This is your space to figure things out.',
        )}
      </p>
      <label>
        {t('About this board')}
        <textarea
          value={board.description}
          maxLength={1000}
          onChange={(e) => update({ ...board, description: e.target.value })}
          rows={3}
        />
      </label>
      <div className="board-facts">
        <div>
          <span>{t('Ideas mapped')}</span>
          <strong>{board.nodes.length}</strong>
        </div>
        <div>
          <span>{t('Decisions made')}</span>
          <strong>
            {board.nodes.filter((n) => n.data.status === 'Decided').length}
          </strong>
        </div>
        <div>
          <span>{t('Open questions')}</span>
          <strong>
            {board.nodes.filter((n) => n.data.status === 'Question').length}
          </strong>
        </div>
      </div>
      <div className="inspector-hint">
        <MousePointer2 size={16} />
        <p>
          {t(
            'Select a node to edit its details and link it to your requirements.',
          )}
        </p>
      </div>
    </div>
  )
}
