import { useCallback, type ChangeEvent } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function useDesignVariables({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { library, patch, saveLibrary, libraryCollectionId, variableModes } =
    model
  const collection =
    library.collections[libraryCollectionId] ||
    Object.values(library.collections)[0]
  const pick = useCallback(
    (e: SelectChange) => patch({ libraryCollectionId: e.target.value }),
    [patch],
  )
  const mode = useCallback(
    (e: SelectChange) => {
      if (collection)
        patch({
          variableModes: { ...variableModes, [collection.id]: e.target.value },
        })
    },
    [collection, variableModes, patch],
  )
  const rename = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (collection && e.target.value.trim())
        saveLibrary({
          ...library,
          collections: {
            ...library.collections,
            [collection.id]: { ...collection, name: e.target.value },
          },
        })
    },
    [collection, library, saveLibrary],
  )
  const addCollection = useCallback(() => {
    const id = crypto.randomUUID()
    saveLibrary({
      ...library,
      collections: {
        ...library.collections,
        [id]: { id, name: t('New collection'), modes: ['Default'] },
      },
    })
    patch({ libraryCollectionId: id })
  }, [library, saveLibrary, patch, t])
  const addVariable = useCallback(() => {
    if (!collection) return
    const id = crypto.randomUUID()
    saveLibrary({
      ...library,
      variables: {
        ...library.variables,
        [id]: {
          id,
          name: t('New variable'),
          collectionId: collection.id,
          type: 'color',
          values: Object.fromEntries(
            collection.modes.map((m) => [m, '#b54469']),
          ),
        },
      },
    })
  }, [collection, library, saveLibrary, t])
  const draft = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      patch({ libraryModeDraft: e.target.value }),
    [patch],
  )
  const addMode = useCallback(() => {
    const mode = model.libraryModeDraft.trim()
    if (!collection || !mode || collection.modes.includes(mode)) return
    saveLibrary({
      ...library,
      collections: {
        ...library.collections,
        [collection.id]: { ...collection, modes: [...collection.modes, mode] },
      },
      variables: Object.fromEntries(
        Object.entries(library.variables).map(([id, v]) => [
          id,
          v.collectionId === collection.id
            ? {
                ...v,
                values: { ...v.values, [mode]: v.values[collection.modes[0]] },
              }
            : v,
        ]),
      ),
    })
    patch({ libraryModeDraft: '' })
  }, [model.libraryModeDraft, collection, library, saveLibrary, patch])
  return {
    t,
    readOnly,
    library,
    collection,
    pick,
    mode,
    rename,
    addCollection,
    addVariable,
    draft,
    addMode,
    variableModes,
  }
}
