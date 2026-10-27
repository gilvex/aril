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
          {t('Back')}
        </Button>
      )}
      <div className="asset-identity-main">
        <span className="asset-identity-icon" aria-hidden="true">
          {asset.kind === 'component' ? (
            <ComponentGlyph glyph={asset.glyph || []} icon={asset.icon} />
          ) : asset.kind === 'page' ? (
            <File size={24} />
          ) : (
            <Variable size={24} />
          )}
        </span>
        <div>
          <h3>{asset.name}</h3>
          <small>
            {t(
              asset.kind === 'component'
                ? 'Component'
                : asset.kind === 'variable'
                  ? 'Variable'
                  : 'Page',
            )}
          </small>
        </div>
      </div>
      <div className="asset-breadcrumb">
        <span>{asset.library}</span>
        <ChevronRight size={12} />
        <span>{asset.family}</span>
      </div>
    </div>
  )
}
