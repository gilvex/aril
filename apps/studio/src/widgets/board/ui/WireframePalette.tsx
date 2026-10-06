import { icons } from '@/widgets/board/config/wireframeBoardIcons.ts'
import { wireKinds, wireLabels } from '@pomegranate/domain/wireframe'
import { Plus, X } from 'lucide-react'

import type { WireframePaletteProps } from '../types/wireframePaletteProps.ts'
export function WireframePalette({
  t,
  setPalette,
  add,
}: WireframePaletteProps) {
  return (
    <div className="node-palette wire-palette">
      <div className="popover-heading">
        {t('Build your interface')}
        <button
          className="icon-button"
          aria-label={t('Close block menu')}
          onClick={() => setPalette(false)}
        >
          <X size={14} />
        </button>
      </div>
      {wireKinds.map((kind) => {
        const Icon = icons[kind]
        return (
          <button key={kind} onClick={() => add(kind)}>
            <Icon size={17} />
            {t(wireLabels[kind])}
            <Plus size={14} />
          </button>
        )
      })}
      <p>{t('Select a screen first to add blocks inside it.')}</p>
    </div>
  )
}
