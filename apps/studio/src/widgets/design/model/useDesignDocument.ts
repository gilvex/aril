import {
  emptyDesignLibrary,
  syncDesignInstances,
  markDesignOverrides,
} from '@pomegranate/domain/designLibrary'
import { designSchema } from '@pomegranate/domain/design'
import { useDesignLibrary } from './useDesignLibrary.ts'
import { useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import {
  createDesignTemplate,
  duplicateDesignElements,
  makeDesignElement,
  removeDesignElements,
  type DesignElement,
  type DesignPage,
  applyDesignChanges,
  isDesignContainer,
  normalizeDesignGroups,
} from '@pomegranate/domain/design'
import { useDesignStructureActions } from './useDesignStructureActions.ts'
import { useDesignEditorState } from './useDesignEditorState.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'

export function useDesignDocument({
  design,
  update: updateDocument,
  workspaceId,
}: DesignBoardProps) {
  const { t } = useTranslation()
  const state = useDesignEditorState(workspaceId)
  const { patch } = state
  const library = useMemo(
    () => design.library || emptyDesignLibrary(),
    [design.library],
  )
  const update = useCallback(
    (next: typeof design) => {
      const synchronized = next.library
        ? {
            ...next,
            pages: next.pages?.map((page) => ({
              ...page,
              nodes: syncDesignInstances(page.nodes, next.library!),
            })),
          }
        : next
      const result = designSchema.safeParse(synchronized)
      if (!result.success) {
        patch({
          libraryError: t(
            'That change would leave invalid or oversized design assets.',
          ),
        })
        return
      }
      patch({ libraryError: '' })
      updateDocument(result.data)
    },
    [patch, t, updateDocument],
  )
  const pages = useMemo(
    () =>
      design.pages?.length
        ? design.pages
        : [{ id: 'design-main', name: t('Page 1'), nodes: [] }],
    [design.pages, t],
  )
  const documentPage =
    pages.find((item) => item.id === state.pageId) || pages[0]
  const component = state.componentId
    ? library.components[state.componentId]
    : undefined
  const variant = component
    ? component.variants[state.variantId] ||
      Object.values(component.variants)[0]
    : undefined
  const page = useMemo(
    () =>
      variant
        ? { ...variant, id: `component:${component!.id}:${variant.id}` }
        : documentPage,
    [variant, component, documentPage],
  )
  useEffect(() => {
    try {
      sessionStorage.setItem(`aril:designPage:${workspaceId}`, documentPage.id)
    } catch {
      /* Editing remains available without storage. */
    }
  }, [documentPage.id, workspaceId])
  const selected = useMemo(
    () => page.nodes.filter((node) => state.selection.includes(node.id)),
    [page.nodes, state.selection],
  )
  const save = useCallback(
    (nodes: DesignElement[]) => {
      if (component && variant) {
        update({
          ...design,
          library: {
            ...library,
            components: {
              ...library.components,
              [component.id]: {
                ...component,
                variants: {
                  ...component.variants,
                  [variant.id]: {
                    ...variant,
                    nodes: normalizeDesignGroups(nodes),
                  },
                },
              },
            },
          },
        })
      } else
        update({
          ...design,
          pages: pages.map((item) =>
            item.id === page.id
              ? {
                  ...item,
                  nodes: normalizeDesignGroups(
                    markDesignOverrides(page.nodes, nodes),
                  ),
                }
              : item,
          ),
        })
    },
    [component, variant, design, library, pages, page.id, page.nodes, update],
  )
  const select = useCallback(
    (id: string, multiple = false) => {
      patch({
        selection: multiple
          ? state.selection.includes(id)
            ? state.selection.filter((item) => item !== id)
            : [...state.selection, id]
          : [id],
        inspector: !state.compact || !state.layers,
        pagesOpen: false,
        styles: false,
        editingId: null,
      })
    },
    [patch, state.selection, state.compact, state.layers],
  )
  const selectPage = useCallback(
    (pageId: string) => {
      const componentEntry = Object.values(library.components)
        .flatMap((asset) =>
          Object.values(asset.variants).map((variant) => ({ asset, variant })),
        )
        .find(
          ({ asset, variant }) =>
            `component:${asset.id}:${variant.id}` === pageId,
        )
      patch({
        ...(componentEntry
          ? {
              componentId: componentEntry.asset.id,
              variantId: componentEntry.variant.id,
              leftTab: 'library' as const,
            }
          : { pageId, componentId: null }),
        libraryView: 'canvas',
        machineSelection: null,
        pagesOpen: false,
        pageQuery: '',
        selection: [],
        drafts: {},
        editingId: null,
        inspector: false,
      })
    },
    [patch, library.components],
  )
  const addPage = useCallback(() => {
    if (pages.length >= 30) return
    const next: DesignPage = {
      id: crypto.randomUUID(),
      name: `${t('Page')} ${pages.length + 1}`,
      nodes: [],
    }
    update({ ...design, pages: [...pages, next] })
    selectPage(next.id)
  }, [design, pages, selectPage, t, update])
  const renamePage = useCallback(
    (name: string, id = page.id) => {
      if (name.trim())
        update({
          ...design,
          pages: pages.map((item) =>
            item.id === id
              ? { ...item, name: name.trim().slice(0, 120) }
              : item,
          ),
        })
    },
    [design, page.id, pages, update],
  )
  const deletePage = useCallback(
    (id = page.id) => {
      if (pages.length < 2) return
      const remaining = pages.filter((item) => item.id !== id)
      update({ ...design, pages: remaining })
      if (id === page.id) selectPage(remaining[0].id)
    },
    [design, page.id, pages, selectPage, update],
  )
  const edit = useCallback(
    (values: Partial<DesignElement>, ids = state.selection) => {
      save(
        applyDesignChanges(
          page.nodes,
          Object.fromEntries(ids.map((id) => [id, values])),
        ),
      )
    },
    [page.nodes, save, state.selection],
  )
  const remove = useCallback(
    (ids = state.selection) => {
      save(removeDesignElements(page.nodes, ids))
      patch({ selection: [], editingId: null })
    },
    [page.nodes, patch, save, state.selection],
  )
  const duplicate = useCallback(
    (ids = state.selection) => {
      const copies = duplicateDesignElements(page.nodes, ids, () =>
        crypto.randomUUID(),
      )
      if (page.nodes.length + copies.length > 500) return
      save([...page.nodes, ...copies])
      patch({
        selection: copies
          .filter(
            (node) => !copies.some((parent) => parent.id === node.parentId),
          )
          .map((node) => node.id),
      })
    },
    [page.nodes, patch, save, state.selection],
  )
  const add = useCallback(
    (
      kind: DesignElement['kind'],
      point: { x: number; y: number },
      mobile = false,
      atPoint = false,
    ) => {
      if (page.nodes.length >= 500) return
      const target = selected[0]
      const parent =
        kind === 'frame'
          ? undefined
          : page.nodes.find(
              (node) =>
                node.id ===
                (isDesignContainer(target) ? target?.id : target?.parentId),
            )
      const node = makeDesignElement(kind, crypto.randomUUID(), {
        name: t(
          kind === 'frame'
            ? mobile
              ? 'Mobile frame'
              : 'Desktop frame'
            : kind === 'text'
              ? 'Text'
              : kind === 'button'
                ? 'Button'
                : kind === 'rectangle'
                  ? 'Rectangle'
                  : kind === 'ellipse'
                    ? 'Ellipse'
                    : 'Image',
        ),
        x: parent && !atPoint ? 32 : Math.round(point.x),
        y: parent && !atPoint ? 32 : Math.round(point.y),
        parentId: parent?.id,
        order: Math.max(0, ...page.nodes.map((item) => item.order)) + 1,
        ...(kind === 'frame' && mobile ? { width: 390, height: 844 } : {}),
        ...(kind === 'button'
          ? { fill: design.accent, text: t('Button') }
          : {}),
        ...(kind === 'text'
          ? { text: t('Your text'), fontFamily: design.bodyFont || 'DM Sans' }
          : {}),
      })
      save([...page.nodes, node])
      patch({
        selection: [node.id],
        inspector: !state.compact || !state.layers,
        pagesOpen: false,
        styles: false,
        tool: 'select',
      })
      return node.id
    },
    [
      design.accent,
      design.bodyFont,
      page.nodes,
      patch,
      save,
      selected,
      t,
      state.compact,
      state.layers,
    ],
  )
  const template = useCallback(() => {
    const x =
      Math.max(
        -120,
        ...page.nodes
          .filter((node) => !node.parentId)
          .map((node) => node.x + node.width),
      ) + 120
    const firstOrder = Math.max(-1, ...page.nodes.map((node) => node.order)) + 1
    const nodes = createDesignTemplate(design, t, x).map((node) => ({
      ...node,
      order: node.order + firstOrder,
    }))
    if (page.nodes.length + nodes.length > 500) return
    save([...page.nodes, ...nodes])
    patch({ selection: [], drafts: {} })
  }, [design, page.nodes, patch, save, t])
  const selectStructure = useCallback(
    (selection: string[]) => patch({ selection, editingId: null }),
    [patch],
  )
  const structure = useDesignStructureActions(
    page.nodes,
    state.selection,
    save,
    selectStructure,
  )
  const assets = useDesignLibrary({
    design,
    update,
    library,
    state,
    page: documentPage,
    selected,
    component,
    variant,
  })
  return {
    ...state,
    ...assets,
    library,
    component,
    variant,
    design,
    updateDesign: update,
    pages,
    page,
    selected,
    save,
    select,
    selectPage,
    addPage,
    renamePage,
    deletePage,
    edit,
    remove,
    duplicate,
    add,
    template,
    ...structure,
  }
}
