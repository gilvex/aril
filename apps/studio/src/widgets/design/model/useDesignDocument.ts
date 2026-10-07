import { useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import {
  createDesignTemplate,
  duplicateDesignElements,
  makeDesignElement,
  removeDesignElements,
  type DesignElement,
  type DesignPage,
} from '@pomegranate/domain/design'
import { useDesignEditorState } from './useDesignEditorState.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'

export function useDesignDocument({
  design,
  update,
  workspaceId,
}: DesignBoardProps) {
  const { t } = useTranslation()
  const compact = useCompactLayout()
  const state = useDesignEditorState(workspaceId)
  const { patch } = state
  const pages = useMemo(
    () =>
      design.pages?.length
        ? design.pages
        : [{ id: 'design-main', name: t('Page 1'), nodes: [] }],
    [design.pages, t],
  )
  const page = pages.find((item) => item.id === state.pageId) || pages[0]
  useEffect(() => {
    try {
      sessionStorage.setItem(`aril:designPage:${workspaceId}`, page.id)
    } catch {
      /* Editing remains available without storage. */
    }
  }, [page.id, workspaceId])
  const selected = useMemo(
    () => page.nodes.filter((node) => state.selection.includes(node.id)),
    [page.nodes, state.selection],
  )
  const save = useCallback(
    (nodes: DesignElement[]) =>
      update({
        ...design,
        pages: pages.map((item) =>
          item.id === page.id ? { ...item, nodes } : item,
        ),
      }),
    [design, page.id, pages, update],
  )
  const select = useCallback(
    (id: string, multiple = false) => {
      patch({
        selection: multiple
          ? state.selection.includes(id)
            ? state.selection.filter((item) => item !== id)
            : [...state.selection, id]
          : [id],
        inspector: true,
        ...(compact ? { layers: false } : {}),
        styles: false,
        editingId: null,
      })
    },
    [compact, patch, state.selection],
  )
  const selectPage = useCallback(
    (pageId: string) =>
      patch({
        pageId,
        pagesOpen: false,
        pageQuery: '',
        selection: [],
        drafts: {},
        editingId: null,
        inspector: false,
      }),
    [patch],
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
        page.nodes.map((node) =>
          ids.includes(node.id) ? { ...node, ...values } : node,
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
                (target?.kind === 'frame' ? target.id : target?.parentId),
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
        inspector: true,
        styles: false,
        tool: 'select',
      })
      return node.id
    },
    [design.accent, design.bodyFont, page.nodes, patch, save, selected, t],
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
  return {
    ...state,
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
  }
}
