import { Plus, X } from 'lucide-react'
import { nodeKinds, type Idea } from '@pomegranate/domain/workspace'
import { useTranslation } from '@/shared/i18n/index.ts'
import { kindIcons } from '../config/kindIcons.ts'
import { kindLabels } from '../config/kindLabels.ts'
export function BlueprintNodePalette({
  close,
  add,
}: {
  close: () => void
  add: (kind: Idea['data']['kind']) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="node-palette">
      <div className="popover-heading">
        {t('Add to your canvas')}
        <button
          className="icon-button"
          onClick={close}
          aria-label={t('Close node menu')}
        >
          <X size={14} />
        </button>
      </div>
      {nodeKinds.map((kind) => {
        const Icon = kindIcons[kind]
        return (
          <button key={kind} onClick={() => add(kind)}>
            <Icon size={17} />
            {t(kindLabels[kind])}
            <Plus size={14} />
          </button>
        )
      })}
    </div>
  )
}
