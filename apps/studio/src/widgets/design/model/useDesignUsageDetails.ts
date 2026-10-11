import { useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { DesignUsage } from '@pomegranate/domain/designLibrary'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useDesignUsageDetails(model: DesignEditorModel) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const {
    libraryAsset,
    library,
    pages,
    usage,
    patch,
    openAsset,
    insertComponent,
  } = model
  const split = libraryAsset?.indexOf(':') ?? -1
  const kind = libraryAsset?.slice(0, split)
  const id = libraryAsset?.slice(split + 1) || ''
  const asset =
    kind === 'component'
      ? library.components[id]
      : kind === 'variable'
        ? library.variables[id]
        : kind === 'machine'
          ? library.machines[id]
          : pages.find((p) => p.id === id)
  const uses = usage.filter((u) => u.assetKind === kind && u.assetId === id)
  const dependencies = usage.filter(
    (u) => u.ownerKind === kind && u.ownerId === id,
  )
  const navigate = useCallback(
    (use: DesignUsage) => {
      if (use.ownerKind === 'machine') openAsset('machine', use.ownerId)
      else if (use.ownerKind === 'component')
        openAsset('component', use.ownerId)
      patch({
        libraryView: use.ownerKind === 'machine' ? 'machine' : 'canvas',
        ...(use.ownerKind === 'page'
          ? { pageId: use.ownerId, componentId: null }
          : {}),
        ...(use.variantId ? { variantId: use.variantId } : {}),
        selection: use.nodeId ? [use.nodeId] : [],
        drafts: {},
        editingId: null,
        panelMaximized: null,
        ...(use.stateId
          ? { machineSelection: { kind: 'state', id: use.stateId } as const }
          : {}),
        ...(use.transitionId
          ? {
              machineSelection: {
                kind: 'transition',
                id: use.transitionId,
              } as const,
            }
          : {}),
      })
    },
    [openAsset, patch],
  )
  const edit = useCallback(() => {
    if (kind === 'component' || kind === 'machine') openAsset(kind, id)
    else if (kind === 'variable')
      patch({
        libraryTab: 'variables',
        libraryCollectionId: library.variables[id]?.collectionId || '',
        variableQuery: library.variables[id]?.name || '',
        variableType: 'all',
        variableUsage: 'all',
      })
    else
      patch({
        pageId: id,
        componentId: null,
        libraryView: 'canvas',
        selection: [],
        drafts: {},
        editingId: null,
      })
    patch({ panelMaximized: null })
  }, [kind, id, openAsset, patch, library.variables])
  const insert = useCallback(() => insertComponent(id), [insertComponent, id])
  return {
    t,
    readOnly,
    kind,
    asset,
    uses,
    dependencies,
    library,
    patch,
    navigate,
    edit,
    insert,
  }
}
