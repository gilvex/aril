import { Plus, Waypoints } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { useLibraryAssetNavigation } from '../model/useLibraryAssetNavigation.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function LibraryAssetActions({ model }: DesignEditorProps) {
  const { t, kind, asset, readOnly, edit, insert } =
    useDesignUsageDetails(model)
  const { reveal } = useLibraryAssetNavigation(model)
  if (!asset || model.librarySelection.length > 1) return null
  return (
    <footer className="asset-actions">
      <Button className="button primary asset-edit" size="sm" onClick={edit}>
        {t(
          readOnly
            ? 'Open asset'
            : kind === 'component'
              ? 'Edit component'
              : kind === 'variable'
                ? 'Edit variable'
                : 'Open page',
        )}
      </Button>
      {kind === 'component' && (
        <Button
          className="button asset-insert"
          size="sm"
          variant="outline"
          onClick={insert}
          disabled={readOnly}
          aria-label={t('Insert instance')}
          title={t('Insert instance')}
        >
          <Plus size={16} />
          <span>{t('Insert instance')}</span>
        </Button>
      )}
      <Button
        className="button"
        size="icon"
        variant="ghost"
        onClick={reveal}
        aria-label={t('Show in map')}
        title={t('Show in map')}
      >
        <Waypoints size={17} />
      </Button>
    </footer>
  )
}
