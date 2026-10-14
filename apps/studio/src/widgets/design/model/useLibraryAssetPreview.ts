import { useMemo } from 'react'
import { resolveDesignBindings } from '@aril/domain/designLibrary'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useLibraryAssetPreview(model: DesignEditorModel) {
  const { library, pages, libraryAsset, libraryPreviewVariant, variableModes } =
    model
  const component = libraryAsset?.startsWith('component:')
    ? library.components[libraryAsset.slice(10)]
    : undefined
  const variants = useMemo(
    () => Object.values(component?.variants || {}),
    [component],
  )
  const variant =
    variants.find((v) => v.id === libraryPreviewVariant) || variants[0]
  const page = libraryAsset?.startsWith('page:')
    ? pages.find((p) => p.id === libraryAsset.slice(5))
    : undefined
  const nodes = useMemo(
    () =>
      resolveDesignBindings(
        variant?.nodes || page?.nodes || [],
        library,
        variableModes,
      ),
    [variant, page, library, variableModes],
  )
  return { component, variants, variant, page, nodes }
}
