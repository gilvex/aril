import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { ExternalLink, File, Component } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from 'vagabond-ui/accordion'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLibraryAssetNavigation } from '../model/useLibraryAssetNavigation.ts'
import type { LibraryUsageGroupProps } from '../types/libraryUsageGroupProps.ts'
export function LibraryUsageGroup({
  entries,
  model,
  navigate,
}: LibraryUsageGroupProps) {
  const { t } = useTranslation()
  const { library, libraryUsageLimit: limit, patch } = model
  const { inspect } = useLibraryAssetNavigation(model)
  const first = entries[0]
  const owner = `${first.ownerKind}:${first.ownerId}`
  const more = useCallback(
    () => patch({ libraryUsageLimit: limit + 50 }),
    [patch, limit],
  )
  return (
    <AccordionItem value={owner} className="asset-usage-group">
      <AccordionTrigger className="asset-section-trigger">
        <Text as="span" className="asset-usage-group-title">
          {first.ownerKind === 'page' ? (
            <File size={14} />
          ) : (
            <Component size={14} />
          )}
          <Text as="span">{first.ownerName}</Text>
          <Text as="small">{entries.length}</Text>
        </Text>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="asset-usage-rows">
          {entries.slice(0, limit).map((use, index) => (
            <li key={`${use.nodeId}:${use.property}:${index}`}>
              <Button
                className="button asset-usage-row"
                variant="ghost"
                onClick={() => inspect(owner)}
              >
                <Text as="span">
                  <Text as="strong">{use.nodeName || use.ownerName}</Text>
                  <Text as="small">
                    {[
                      use.variantId &&
                        library.components[use.ownerId]?.variants[use.variantId]
                          ?.name,
                      use.property || t('Component instance'),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </Text>
              </Button>
              <Button
                className="button"
                size="icon"
                variant="ghost"
                onClick={() => navigate(use)}
                aria-label={t('Open {{name}} in Design', {
                  name: use.nodeName || use.ownerName,
                })}
                title={t('Open in Design')}
              >
                <ExternalLink size={14} />
              </Button>
            </li>
          ))}
        </ul>
        {entries.length > limit && (
          <Button className="button" size="sm" variant="ghost" onClick={more}>
            <Text>{t('Show more')}</Text>
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
