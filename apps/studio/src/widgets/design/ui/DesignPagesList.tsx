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
  const pages = model.pages.filter((page) =>
    page.name
      .toLocaleLowerCase()
      .includes(model.pageQuery.trim().toLocaleLowerCase()),
  )
  return (
    <>
      {' '}
      <label className="design-page-search">
        <Search size={15} aria-hidden="true" />
        <Input
          aria-label={t('Find a page')}
          placeholder={t('Find a page')}
          value={model.pageQuery}
          onChange={(event) => patch({ pageQuery: event.target.value })}
        />
      </label>
      <div className="design-page-picker-list">
        {pages.map((page) => (
          <DesignPageRow key={page.id} page={page} model={model} />
        ))}
        {!pages.length && <p role="status">{t('No matching pages.')}</p>}
      </div>
      {canEdit && (
        <Button
          variant="ghost"
          className="design-page-add"
          disabled={model.pages.length >= 30}
          onClick={model.addPage}
        >
          <Plus size={15} />
          {t('Add page')}
        </Button>
      )}
    </>
  )
}
