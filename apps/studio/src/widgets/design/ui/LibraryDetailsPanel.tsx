import { useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { StudioDrawer, SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { DesignUsageDetails } from './DesignUsageDetails.tsx'
import { LibraryOrganization } from './LibraryOrganization.tsx'
import { DesignPanel } from './DesignPanel.tsx'
export function LibraryDetailsPanel({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { patch } = model
  const close = useCallback(() => patch({ libraryDetailsOpen: false }), [patch])
  const change = useCallback(
    (open: boolean) => {
      if (!open) close()
    },
    [close],
  )
  const content = (
    <>
      <header className="library-details-heading">
        {!model.compact && <SurfaceGrip />}
        <strong>{t('Asset details')}</strong>
        <Button
          className="button"
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label={t('Close')}
        >
          <X size={16} />
        </Button>
      </header>
      <div className="library-details-body">
        <LibraryOrganization model={model} explorer={explorer} />
        <DesignUsageDetails model={model} />
      </div>
    </>
  )
  if (model.compact)
    return (
      <StudioDrawer
        open
        title={t('Asset details')}
        onOpenChange={change}
        className="library-details-drawer"
      >
        {content}
      </StudioDrawer>
    )
  return (
    <DesignPanel model={model} side="right" label={t('Asset details')}>
      <aside className="library-page-details" aria-label={t('Asset details')}>
        {content}
      </aside>
    </DesignPanel>
  )
}
