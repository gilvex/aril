import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from 'vagabond-ui/accordion'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLibraryAssetPreview } from '../model/useLibraryAssetPreview.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { LibraryPreviewCanvas } from './LibraryPreviewCanvas.tsx'
export function LibraryAssetPreview({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { component, variants, variant, page, nodes } =
    useLibraryAssetPreview(model)
  const { patch } = model
  const select = useCallback(
    (event: { target: { value: string } }) =>
      patch({ libraryPreviewVariant: event.target.value }),
    [patch],
  )
  if (!component && !page) return null
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="preview"
      className="asset-preview-section"
    >
      <AccordionItem value="preview">
        <AccordionTrigger className="asset-section-trigger">
          <Text>{t('Preview')}</Text>
        </AccordionTrigger>
        <AccordionContent>
          {component && (
            <StudioSelect
              value={variant?.id || ''}
              onChange={select}
              aria-label={t('Preview variant')}
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </StudioSelect>
          )}
          <div className="asset-preview-tile">
            {nodes.length ? (
              <LibraryPreviewCanvas nodes={nodes} />
            ) : (
              <Text as="p">{t('This design is empty.')}</Text>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
