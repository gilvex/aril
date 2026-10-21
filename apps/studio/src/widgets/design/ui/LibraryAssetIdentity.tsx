import { Text } from '@/shared/ui/Text.tsx'
import { ArrowLeft, File, Variable, ChevronRight } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLibraryAssetNavigation } from '../model/useLibraryAssetNavigation.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { ComponentGlyph } from './ComponentGlyph.tsx'
export function LibraryAssetIdentity({
  model,
  explorer,
}: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { back } = useLibraryAssetNavigation(model)
  const asset = explorer.assets.find((a) => a.id === model.libraryAsset)
  if (!asset) return null
  return (
    <div className="asset-identity">
      {model.libraryAssetHistory.length > 0 && (
        <Button
          className="button asset-back"
          variant="ghost"
          size="sm"
          onClick={back}
        >
          <ArrowLeft size={14} />
          <Text>{t('Back')}</Text>
        </Button>
      )}
      <div className="asset-identity-main">
        <Text as="span" className="asset-identity-icon" aria-hidden="true">
          {asset.kind === 'component' ? (
            <ComponentGlyph glyph={asset.glyph || []} icon={asset.icon} />
          ) : asset.kind === 'page' ? (
            <File size={24} />
          ) : (
            <Variable size={24} />
          )}
        </Text>
        <div>
          <Text as="h3">{asset.name}</Text>
          <Text as="small">
            {t(
              asset.kind === 'component'
                ? 'Component'
                : asset.kind === 'variable'
                  ? 'Variable'
                  : 'Page',
            )}
          </Text>
        </div>
      </div>
      <div className="asset-breadcrumb">
        <Text as="span">{asset.library}</Text>
        <ChevronRight size={12} />
        <Text as="span">{asset.family}</Text>
      </div>
    </div>
  )
}
