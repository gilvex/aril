import { Text } from '@/shared/ui/Text.tsx'
import { insertNodeKinds } from '../config/insertNodeKinds.ts'
import { Plus, X } from 'lucide-react'
import { type Idea } from '@aril/domain/workspace'
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
        <Text>{t('Add to your canvas')}</Text>
        <button
          className="icon-button"
          onClick={close}
          aria-label={t('Close node menu')}
        >
          <X size={14} />
        </button>
      </div>
      {insertNodeKinds.map((kind) => {
        const Icon = kindIcons[kind]
        return (
          <button key={kind} onClick={() => add(kind)}>
            <Icon size={17} />
            <Text>{t(kindLabels[kind])}</Text>
            <Plus size={14} />
          </button>
        )
      })}
    </div>
  )
}
