import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useId,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { useReactFlow, type NodeChange } from '@xyflow/react'
import {
  cameraFromViewport,
  viewportFromCamera,
} from '@pomegranate/domain/follow'
import {
  applyDesignChanges,
  designAncestors,
  isDesignContainer,
  type DesignElement,
} from '@pomegranate/domain/design'
import { designTreeRows } from '../utils/designTreeRows.ts'
import { designClipShapes } from '../utils/designClipShapes.ts'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import type { DesignFlowNode } from '../types/designFlowNode.ts'

export function useDesignCanvas(
  model: DesignEditorModel,
  props: DesignBoardProps,
) {
  const flow = useReactFlow<DesignFlowNode>()
  const clipPrefix = useId().replace(/[^a-z0-9]/gi, '')
  const surface = useRef<HTMLDivElement>(null)
  const { sendPresence, following } = props
  const pendingDrag = useRef(false)
  const {
    page,
    selection,
    drafts,
    patch,
    save,
    edit,
    remove,
    duplicate,
    selectPage,
  } = model
  const peers = useMemo(
    () =>
      props.peers.filter(
        (peer) => peer.view === 'design' && peer.designPageId === page.id,
      ),
    [page.id, props.peers],
  )
  useEffect(() => {
    sendPresence({ designPageId: page.id, selected: selection }, true)
  }, [page.id, selection, sendPresence])
  useEffect(() => {
    if (
      pendingDrag.current &&
      (props.saveState === 'saved' || props.saveState === 'error')
    ) {
      pendingDrag.current = false
      sendPresence({ dragging: [] }, true)
    }
  }, [props.saveState, sendPresence])
  useEffect(() => {
    if (following?.clientId) patch({ selection: [], editingId: null })
  }, [following?.clientId, patch])
  useEffect(
    () => () =>
      sendPresence({ designPageId: null, cursor: null, dragging: [] }, true),
    [sendPresence],
  )
  useEffect(() => {
    if (
      following?.view === 'design' &&
      following.designPageId &&
      following.designPageId !== page.id
    )
      selectPage(following.designPageId)
  }, [following?.view, following?.designPageId, page.id, selectPage])
  useEffect(() => {
    if (
      !following?.camera ||
      !surface.current ||
      following.designPageId !== page.id
    )
      return
    void flow.setViewport(
      viewportFromCamera(
        following.camera,
        surface.current.getBoundingClientRect(),
      ),
      {
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 90,
      },
    )
  }, [flow, following?.camera, following?.designPageId, page.id])
  useEffect(() => {
    const timer = setTimeout(() => {
      void flow.fitView({ padding: 0.15, maxZoom: 1 })
    }, 80)
    return () => clearTimeout(timer)
  }, [flow, page.id])
  const editText = useCallback(
    (id: string, text: string) => edit({ text }, [id]),
    [edit],
  )
  const finishEditing = useCallback(() => patch({ editingId: null }), [patch])
  const nodes = useMemo<DesignFlowNode[]>(() => {
    const effective = applyDesignChanges(page.nodes, {
      ...Object.fromEntries(
        peers
          .flatMap((peer) => peer.dragging || [])
          .map((item) => [item.id, { x: item.position.x, y: item.position.y }]),
      ),
      ...drafts,
    })
    return designTreeRows(effective, [], false).map(
      ({ node: element }, index) => {
        const ancestors = designAncestors(effective, element.id)
        const remote = peers
          .flatMap((peer) => peer.dragging || [])
          .find((item) => item.id === element.id)
        const clips = designClipShapes(effective, element)
        const clipId = `${clipPrefix}-design-${index}`
        return {
          id: element.id,
          type: 'designElement',
          parentId: element.parentId,
          position: { x: element.x, y: element.y },
          width: element.width,
          height: element.height,
          measured: { width: element.width, height: element.height },
          ariaLabel: element.name,
          style: {
            width: element.width,
            height: element.height,
            clipPath: clips.length
              ? `url(#${clipId}-${clips.length - 1})`
              : undefined,
          },
          hidden: !!(
            element.hidden || ancestors.some((parent) => parent.hidden)
          ),
          draggable:
            !element.locked && !ancestors.some((parent) => parent.locked),
          selectable:
            !element.locked && !ancestors.some((parent) => parent.locked),
          selected: selection.includes(element.id),
          dragHandle: isDesignContainer(element)
            ? '.design-frame-title'
            : undefined,
          zIndex: index,
          className: remote && !drafts[element.id] ? 'design-live-moving' : '',
          data: {
            element,
            clips,
            clipId,
            maskSource: ancestors[0]?.maskId === element.id,
            editors: [
              ...new Map(
                peers
                  .filter((peer) => peer.selected.includes(element.id))
                  .map((peer) => [peer.profile.id, peer.profile]),
              ).values(),
            ],
            editing: model.editingId === element.id,
            editText,
            finishEditing,
          },
        }
      },
    )
  }, [
    page.nodes,
    peers,
    drafts,
    selection,
    model.editingId,
    editText,
    finishEditing,
    clipPrefix,
  ])
  const onNodesChange = useCallback(
    (changes: NodeChange<DesignFlowNode>[]) => {
      const next = { ...drafts }
      let active = false,
        commit = false
      let picked = selection
      for (const change of changes) {
        if (change.type === 'select')
          picked = change.selected
            ? [...new Set([...picked, change.id])]
            : picked.filter((id) => id !== change.id)
        if (change.type === 'position' && change.position) {
          next[change.id] = {
            ...next[change.id],
            x: change.position.x,
            y: change.position.y,
          }
          if (change.dragging === false) commit = true
          else active = true
        }
        if (
          change.type === 'dimensions' &&
          change.dimensions &&
          change.resizing !== undefined
        ) {
          next[change.id] = { ...next[change.id], ...change.dimensions }
          if (change.resizing === false) commit = true
          else active = true
        }
      }
      patch({ selection: picked, drafts: commit ? {} : next })
      if (active || commit)
        sendPresence({
          designPageId: page.id,
          dragging: page.nodes
            .filter((node) => next[node.id])
            .map((node) => ({
              id: node.id,
              position: {
                x: next[node.id].x ?? node.x,
                y: next[node.id].y ?? node.y,
              },
            })),
        })
      if (commit) {
        const changed = page.nodes.some((node) =>
          Object.entries(next[node.id] || {}).some(
            ([key, value]) => node[key as keyof DesignElement] !== value,
          ),
        )
        pendingDrag.current = changed
        if (changed) save(applyDesignChanges(page.nodes, next))
        else sendPresence({ dragging: [] }, true)
      }
    },
    [drafts, page.id, page.nodes, patch, save, selection, sendPresence],
  )
  const moveCursor = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      sendPresence({
        designPageId: page.id,
        cursor: flow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
      })
    },
    [flow, page.id, sendPresence],
  )
  const moveCamera = useCallback(() => {
    if (surface.current && !following)
      sendPresence({
        designPageId: page.id,
        camera: cameraFromViewport(
          flow.getViewport(),
          surface.current.getBoundingClientRect(),
        ),
      })
  }, [flow, following, page.id, sendPresence])
  const add = useCallback(
    (kind: DesignElement['kind'], mobile = false) => {
      const rect = surface.current?.getBoundingClientRect()
      if (!rect) return
      const id = model.add(
        kind,
        flow.screenToFlowPosition({
          x: rect.left + rect.width / 2 - 80,
          y: rect.top + rect.height / 3,
        }),
        mobile,
      )
      if (id)
        requestAnimationFrame(() => {
          void flow.fitView({ nodes: [{ id }], padding: 0.2, maxZoom: 1 })
        })
    },
    [flow, model],
  )
  const insertTemplate = useCallback(() => {
    model.template()
    requestAnimationFrame(() => {
      void flow.fitView({ padding: 0.12, maxZoom: 1 })
    })
  }, [flow, model])
  const keyboard = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return
      if (
        (event.target as HTMLElement).closest(
          'input, textarea, select, [contenteditable], [role="combobox"], [role="menu"], [role="separator"]',
        )
      )
        return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        if (event.shiftKey) model.ungroup()
        else model.group()
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'd'
      ) {
        event.preventDefault()
        duplicate()
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        remove()
      } else if (event.key === 'Escape')
        patch({ selection: [], editingId: null, inspector: false })
      else if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          event.key,
        ) &&
        selection.length
      ) {
        event.preventDefault()
        const amount = event.shiftKey ? 10 : 1
        save(
          page.nodes.map((node) =>
            selection.includes(node.id) &&
            !designAncestors(page.nodes, node.id).some((parent) =>
              selection.includes(parent.id),
            )
              ? {
                  ...node,
                  x:
                    node.x +
                    (event.key === 'ArrowLeft'
                      ? -amount
                      : event.key === 'ArrowRight'
                        ? amount
                        : 0),
                  y:
                    node.y +
                    (event.key === 'ArrowUp'
                      ? -amount
                      : event.key === 'ArrowDown'
                        ? amount
                        : 0),
                }
              : node,
          ),
        )
      }
    },
    [duplicate, page.nodes, patch, remove, save, selection, model],
  )
  return {
    flow,
    surface,
    peers,
    nodes,
    onNodesChange,
    moveCursor,
    moveCamera,
    add,
    insertTemplate,
    keyboard,
  }
}
