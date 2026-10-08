import { DesignLibraryButton } from './DesignLibraryButton.tsx'
import { DesignAssetBreadcrumb } from './DesignAssetBreadcrumb.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignPagePicker } from './DesignPagePicker.tsx'
import { DesignLayersButton } from './DesignLayersButton.tsx'
import { DesignPanelActions } from './DesignPanelActions.tsx'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import type { ReactNode } from 'react'
export function DesignMobileBar({
  model,
  menu,
}: {
  model: DesignEditorModel
  menu?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <nav className="design-mobile-bar" aria-label={t('Design tools')}>
      {model.component || model.libraryView !== 'canvas' ? (
        <DesignAssetBreadcrumb model={model} />
      ) : (
        <DesignPagePicker model={model} mobile />
      )}
      <DesignLayersButton model={model} />
      <DesignLibraryButton model={model} />
      <DesignPanelActions model={model} mobile />
      {menu}
    </nav>
  )
}
