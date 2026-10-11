import { useMemo } from 'react'
import { resolveDesignBindings } from '@pomegranate/domain/designLibrary'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMiniPreview } from './DesignMiniPreview.tsx'
export function LibraryAssetPreview({ model }: DesignEditorProps) {
  const id = model.libraryAsset?.startsWith('component:')
    ? model.libraryAsset.slice(10)
    : ''
  const component = model.library.components[id]
  const variants = useMemo(
    () =>
      component
        ? Object.values(component.variants)
            .slice(0, 3)
            .map((v) => ({
              ...v,
              nodes: resolveDesignBindings(
                v.nodes,
                model.library,
                model.variableModes,
              ),
            }))
        : [],
    [component, model.library, model.variableModes],
  )
  if (!component) return null
  return (
    <div className="library-component-previews">
      {variants.map((v) => (
        <div key={v.id}>
          <DesignMiniPreview nodes={v.nodes} />
          <small>{v.name}</small>
        </div>
      ))}
    </div>
  )
}
