import { useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignMobilePropertyMode } from './DesignMobilePropertyMode.tsx'
import { DesignPagesList } from './DesignPagesList.tsx'
import { designMobileToolPatch } from '../utils/designMobileToolPatch.ts'
import type { DesignEditorState } from '../types/designEditorState.ts'
import type { DesignMobileToolsProps } from '../types/designMobileToolsProps.ts'
import '../designMobileTools.css'

export function DesignMobileTools({
  model,
  children,
  onOpenChange,
}: DesignMobileToolsProps) {
  const { t } = useTranslation()
  const { patch } = model
  const active = model.pagesOpen
    ? 'pages'
    : model.layers
      ? model.leftTab
      : 'properties'
  const selectTab = useCallback(
    (tab: string) => {
      if (['pages', 'layers', 'library', 'properties'].includes(tab))
        patch(designMobileToolPatch(tab as DesignEditorState['mobileToolsTab']))
    },
    [patch],
  )
  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  return (
    <StudioDrawer
      open={model.pagesOpen || model.layers || model.inspector}
      onOpenChange={onOpenChange}
      title={t('Design tools')}
      modal={false}
      keepOpenOnInteract
      className="design-tools-drawer"
    >
      <header className="design-tools-header">
        <strong>{model.pagesOpen ? t('Pages') : model.page.name}</strong>
        <Button
          variant="ghost"
          size="icon"
          className="icon-button"
          aria-label={t('Close panel')}
          onClick={close}
        >
          <X size={18} />
        </Button>
      </header>
      <div className="design-tools-panel">
        {model.inspector && model.libraryView !== 'machine' && (
          <DesignMobilePropertyMode model={model} />
        )}
        <div className="design-tools-content">
          {model.pagesOpen ? (
            <div className="design-page-popover">
              <DesignPagesList model={model} />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
      <footer className="design-tools-switcher">
        <ToggleGroup
          type="single"
          value={active}
          onValueChange={selectTab}
          className="design-tools-button-group"
          aria-label={t('Design tools')}
        >
          <ToggleGroupItem value="pages">{t('Pages')}</ToggleGroupItem>
          <ToggleGroupItem value="layers">{t('Layers')}</ToggleGroupItem>
          <ToggleGroupItem value="library">{t('Library')}</ToggleGroupItem>
          <ToggleGroupItem value="properties">
            {t('Properties')}
          </ToggleGroupItem>
        </ToggleGroup>
      </footer>
    </StudioDrawer>
  )
}
