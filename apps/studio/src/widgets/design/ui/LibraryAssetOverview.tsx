import { Text } from '@/shared/ui/Text.tsx'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from 'vagabond-ui/accordion'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { LibraryAssetPreview } from './LibraryAssetPreview.tsx'
import { LibraryAssetProperties } from './LibraryAssetProperties.tsx'
import { LibraryOrganization } from './LibraryOrganization.tsx'
import { DesignComponentIcon } from './DesignComponentIcon.tsx'
export function LibraryAssetOverview({
  model,
  explorer,
}: LibraryExplorerProps) {
  const { t } = useTranslation()
  const kind = explorer.assets.find((a) => a.id === model.libraryAsset)?.kind
  return (
    <>
      <div className="asset-overview-grid">
        <LibraryAssetPreview model={model} />
        <LibraryAssetProperties model={model} />
      </div>
      {kind !== 'page' && (
        <Accordion
          type="single"
          collapsible
          className="asset-organization-section"
        >
          <AccordionItem value="organization">
            <AccordionTrigger className="asset-section-trigger">
              <Text>{t('Organization and icon')}</Text>
            </AccordionTrigger>
            <AccordionContent>
              <LibraryOrganization model={model} explorer={explorer} />
              {kind === 'component' && <DesignComponentIcon model={model} />}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  )
}
