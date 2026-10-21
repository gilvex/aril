import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from 'vagabond-ui/input'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { LibraryAssetPreview } from './LibraryAssetPreview.tsx'
import { LibraryUsageList } from './LibraryUsageList.tsx'
export function LibraryAssetUsage({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, libraryDetailsTab: tab } = model
  const search = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      patch({ libraryUsageQuery: event.target.value, libraryUsageLimit: 50 }),
    [patch],
  )
  const direction = useCallback(
    (event: { target: { value: string } }) =>
      patch({
        libraryDetailsTab: event.target.value === 'uses' ? 'uses' : 'usedBy',
        libraryUsageLimit: 50,
      }),
    [patch],
  )
  const depth = useCallback(
    (event: { target: { value: string } }) =>
      patch({
        libraryDetailsTab:
          event.target.value === 'impact' ? 'impact' : 'usedBy',
        libraryUsageLimit: 50,
      }),
    [patch],
  )
  return (
    <section className="asset-usage-view">
      <LibraryAssetPreview model={model} />
      <div className="asset-usage-filters">
        <StudioSelect
          value={tab === 'uses' ? 'uses' : 'usedBy'}
          onChange={direction}
          aria-label={t('Connection direction')}
        >
          <option value="usedBy">{t('Used by')}</option>
          <option value="uses">{t('Uses assets')}</option>
        </StudioSelect>
        {tab !== 'uses' && (
          <StudioSelect
            value={tab}
            onChange={depth}
            aria-label={t('Connection depth')}
          >
            <option value="usedBy">{t('Direct')}</option>
            <option value="impact">{t('Indirect')}</option>
          </StudioSelect>
        )}
      </div>
      <Text as="label" className="asset-usage-search">
        <Search size={15} />
        <Input
          value={model.libraryUsageQuery}
          onChange={search}
          aria-label={t('Search usages')}
          placeholder={t('Search usages')}
        />
      </Text>
      <LibraryUsageList model={model} />
    </section>
  )
}
