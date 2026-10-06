import { useTranslation } from '@/shared/i18n/index.ts'
import { createDesignBoardState } from '@/widgets/design/model/createDesignBoardState.ts'
import { useDesignBoardModel } from '@/widgets/design/model/useDesignBoardModel.ts'
import type { DesignBoardProps } from '@/widgets/design/types/designBoardProps.ts'
import { Palette } from 'lucide-react'
import { DesignPreview } from './DesignPreview.tsx'
import { DesignSettings } from './DesignSettings.tsx'

export function DesignBoard({ design, update }: DesignBoardProps) {
  const { t } = useTranslation()

  const { tab, setTab, selected, setSelected } = useDesignBoardModel(() =>
    createDesignBoardState(),
  )

  const colors = ['#b34568', '#7955ad', '#386a92', '#307568', '#9c603a']
  return (
    <div className="content-page design-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{t('An early direction')}</div>
          <h1>{t('Calm by design.')}</h1>
          <p>{t('A space to explore how Pomegranate should feel.')}</p>
        </div>
        <span className="concept-badge">
          <Palette size={14} />
          {t('Design study')}
        </span>
      </div>
      <div className="design-intro">
        <h2>
          {t('Comfortable enough for every day.')}
          <br />
          {t('Capable enough for your whole fleet.')}
        </h2>
        <p>
          {t('Clear hierarchy. Useful density. Small moments of character.')}
          <br />
          {t('Inspired by your preference for Juxtopposed’s work.')}
        </p>
      </div>
      <div className="design-grid">
        <DesignSettings colors={colors} update={update} design={design} />
        <DesignPreview
          design={design}
          tab={tab}
          setTab={setTab}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </div>
  )
}
