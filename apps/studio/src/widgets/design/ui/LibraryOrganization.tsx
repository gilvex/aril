import { useCallback, type FormEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
export function LibraryOrganization({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { library, saveLibrary, librarySelection, libraryAsset, patch } = model
  const current = explorer.assets.find((a) => a.id === libraryAsset)
  const save = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (readOnly) return
      const form = new FormData(event.currentTarget)
      const organization = {
        library: String(form.get('library') || '').trim(),
        family: String(form.get('family') || '').trim(),
      }
      if (!organization.library || !organization.family) return
      const ids = librarySelection.length
        ? librarySelection
        : libraryAsset
          ? [libraryAsset]
          : []
      const next = {
        ...library,
        components: { ...library.components },
        variables: { ...library.variables },
        machines: { ...library.machines },
      }
      for (const key of ids) {
        const split = key.indexOf(':'),
          kind = key.slice(0, split),
          id = key.slice(split + 1)
        if (kind === 'component' && next.components[id])
          next.components[id] = { ...next.components[id], organization }
        if (kind === 'variable' && next.variables[id])
          next.variables[id] = { ...next.variables[id], organization }
        if (kind === 'machine' && next.machines[id])
          next.machines[id] = { ...next.machines[id], organization }
      }
      saveLibrary(next)
      patch({
        librarySelection: [],
        libraryPath: [organization.library, organization.family],
        libraryOffset: 0,
        libraryQuery: '',
      })
    },
    [readOnly, library, librarySelection, libraryAsset, saveLibrary, patch],
  )
  if (!librarySelection.length && (!current || current.kind === 'page'))
    return null
  return (
    <form
      className="library-organization"
      key={`${libraryAsset}:${librarySelection.join('|')}:${current?.library}:${current?.family}`}
      onSubmit={save}
    >
      <fieldset disabled={readOnly}>
        <legend>
          {librarySelection.length
            ? t('Organize {{count}} assets', { count: librarySelection.length })
            : t('Organization')}
        </legend>
        <label>
          {t('Library name')}
          <Input
            name="library"
            list="library-names"
            required
            maxLength={120}
            defaultValue={current?.library || ''}
          />
        </label>
        <datalist id="library-names">
          {explorer.groups.map((g) => (
            <option key={g.name} value={g.name} />
          ))}
        </datalist>
        <label>
          {t('Family')}
          <Input
            name="family"
            required
            maxLength={120}
            defaultValue={current?.family || ''}
          />
        </label>
        <Button className="button" type="submit" size="sm" variant="outline">
          {t('Save organization')}
        </Button>
      </fieldset>
    </form>
  )
}
