import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { Plus, Search } from 'lucide-react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignPageRow } from './DesignPageRow.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignPagesList({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const canEdit = role !== null && role !== 'viewer'
  const { patch } = model
  const changeQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      patch({ pageQuery: event.target.value }),
    [patch],
  )
  const pages = model.pages.filter((page) =>
    page.name
      .toLocaleLowerCase()
      .includes(model.pageQuery.trim().toLocaleLowerCase()),
  )
  return (
    <>
      {' '}
      <Text as="label" className="design-page-search">
        <Search size={15} aria-hidden="true" />
        <Input
          aria-label={t('Find a page')}
          placeholder={t('Find a page')}
          value={model.pageQuery}
          onChange={changeQuery}
        />
      </Text>
      <div className="design-page-picker-list">
        {pages.map((page) => (
          <DesignPageRow key={page.id} page={page} model={model} />
        ))}
        {!pages.length && (
          <Text as="p" role="status">
            {t('No matching pages.')}
          </Text>
        )}
      </div>
      {canEdit && (
        <Button
          variant="ghost"
          className="design-page-add"
          disabled={model.pages.length >= 30}
          onClick={model.addPage}
        >
          <Plus size={15} />
          <Text>{t('Add page')}</Text>
        </Button>
      )}
    </>
  )
}
