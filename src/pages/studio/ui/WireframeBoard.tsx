import { useFollowViewport } from '../model/use-follow-viewport'
import type { CameraPresence } from '../../../../domain/collaboration'
import { CanvasChrome, type CanvasTool } from './CanvasChrome'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionMode,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react'
import {
  AppWindow,
  Type,
  MousePointer2,
  TextCursorInput,
  Square,
  Image,
  PanelTop,
  Plus,
  X,
  Copy,
  Trash2,
  ArrowRight,
  Play,
  Pencil,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  PanelRightClose,
  Link2,
} from 'lucide-react'
import type { Board } from '../../../shared/api/workspace'
import type {
  DragPosition,
  Presence,
  Profile,
} from '../../../../domain/collaboration'
import {
  makeWireNode,
  removeWireNodes,
  wireKinds,
  wireLabels,
  wirePosition,
  type Wireframe,
  type WireKind,
  type WireNode,
} from '../../../../domain/wireframe'
import { WireframeBlock, type WireFlowNode } from './WireframeBlock'
import { WireframeEdge } from './WireframeEdge'
import { routeWireframes, wireConnectionSides } from '../model/wire-routing'
import { LiveCursors } from './LiveCursors'
import { ResizableInspector } from './ResizableInspector'
import { useLiveNodePositions } from '../model/use-live-node-positions'
import type { CanvasFullscreenControls } from '../model/use-canvas-fullscreen'
import { useCompactLayout } from '../../../shared/lib/use-compact-layout'
import { CanvasInsertMenu, type CanvasInsertPoint } from './CanvasInsertMenu'

const nodeTypes = { wireframe: WireframeBlock },
  edgeTypes = { smoothstep: WireframeEdge }
const icons = {
  screen: AppWindow,
  text: Type,
  button: MousePointer2,
  input: TextCursorInput,
  card: Square,
  image: Image,
  navigation: PanelTop,
}
const empty: Wireframe = { nodes: [], edges: [] }
type Props = {
  full: CanvasFullscreenControls
  following: Presence | null
  navigation: ReactNode
  board: Board
  update: (board: Board, record?: boolean) => void
  checkpoint: () => void
  peers: Presence[]
  profile: Profile
  saveState: 'saved' | 'pending' | 'saving' | 'error'
  sendPresence: (
    changes: {
      camera?: CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: DragPosition[]
    },
    force?: boolean,
  ) => void
}

export function WireframeBoard({
  full,
  navigation,
  following,
  board,
  update,
  checkpoint,
  peers,
  profile,
  saveState,
  sendPresence,
}: Props) {
  const graph = board.wireframe || empty
  const compact = useCompactLayout()
  const [tool, setTool] = useState<CanvasTool>('select')
  const [inspectorPreference, setInspectorOpen] = useState<boolean | null>(null)
  const inspectorOpen = inspectorPreference ?? false
  const [touchSelection, setTouchSelection] = useState(false)
  const inspectorToggle = useRef<HTMLButtonElement>(null)
  const editField = useRef<HTMLInputElement>(null)
  const [flow, setFlow] = useState<ReactFlowInstance<WireFlowNode> | null>(null)
  const [selection, setSelection] = useState(new Set<string>())
  const [edgeId, setEdgeId] = useState<string | null>(null)
  useEffect(() => {
    if (following) {
      setSelection(new Set())
      setEdgeId(null)
    }
  }, [following?.clientId])
  const [palette, setPalette] = useState(false)
  const [insertPoint, setInsertPoint] = useState<CanvasInsertPoint | null>(null)
  const [preview, setPreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState(
    'Click a connected block to follow its flow.',
  )
  const [targetId, setTargetId] = useState('')
  const [trigger, setTrigger] = useState('On click')
  const [moving, setMoving] = useState(new Set<string>())
  const dragPositions = useRef(new Map<string, DragPosition>())
  const selectionBefore = useRef(selection)
  const surface = useRef<HTMLDivElement>(null)
  const publishCamera = useFollowViewport(
    flow,
    surface,
    following,
    sendPresence,
  )
  const pendingFocus = useRef<string | null>(null)
  const liveNodes = useLiveNodePositions(graph.nodes, peers, moving)
  const routes = useMemo(
    () => routeWireframes(liveNodes, graph.edges),
    [liveNodes, graph.edges],
  )
  const selected = graph.nodes.filter((n) => selection.has(n.id))
  const node = selected.length === 1 ? selected[0] : undefined
  const edge = graph.edges.find((e) => e.id === edgeId)
  const editItem = (id: string, connection = false) => {
    if (preview) return
    flushSync(() => {
      setSelection(new Set(connection ? [] : [id]))
      setEdgeId(connection ? id : null)
      setInspectorOpen(true)
      setTouchSelection(false)
      setTool('select')
      setPalette(false)
      setInsertPoint(null)
    })
    editField.current?.focus()
    editField.current?.select()
  }
  const screens = graph.nodes.filter((n) => n.data.kind === 'screen')
  const save = (next: Wireframe, record = true) =>
    update({ ...board, wireframe: next }, record)
  useEffect(() => {
    const id = pendingFocus.current
    if (!id || !flow || !graph.nodes.some((n) => n.id === id)) return
    const frame = requestAnimationFrame(() => {
      pendingFocus.current = null
      void flow.fitView({ nodes: [{ id }], padding: 0.25, maxZoom: 1 })
    })
    return () => cancelAnimationFrame(frame)
  }, [flow, graph.nodes])
  useEffect(() => {
    sendPresence(
      { selected: [...selection], selectedEdges: edgeId ? [edgeId] : [] },
      true,
    )
  }, [selection, edgeId, sendPresence])
  useEffect(() => {
    if (!moving.size && (saveState === 'saved' || saveState === 'error')) {
      dragPositions.current.clear()
      sendPresence({ dragging: [] }, true)
    }
  }, [moving, saveState, sendPresence])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreview(false)
        setPalette(false)
      }
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [])

  function select(id: string) {
    setSelection(new Set([id]))
    setEdgeId(null)
  }
  function editNode(changes: Partial<WireNode>) {
    if (node)
      save({
        ...graph,
        nodes: graph.nodes.map((n) =>
          n.id === node.id ? { ...n, ...changes } : n,
        ),
      })
  }
  function editData(changes: Partial<WireNode['data']>) {
    if (node) editNode({ data: { ...node.data, ...changes } })
  }
  function focus(id: string) {
    const target = graph.nodes.find((n) => n.id === id)
    if (!target || !flow) return
    const screen = graph.nodes.find((n) => n.id === target.parentId) || target
    void flow.fitView({
      nodes: [{ id: screen.id }],
      padding: 0.25,
      maxZoom: 1,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 280,
    })
    select(id)
  }
  function follow(id: string) {
    const links = graph.edges.filter((e) => e.source === id)
    if (links.length === 1) {
      focus(links[0].target)
      setPreviewMessage(
        `${links[0].label || 'On click'} → ${graph.nodes.find((n) => n.id === links[0].target)?.data.title}`,
      )
    } else {
      select(id)
      setPreviewMessage(
        links.length
          ? 'Choose a destination in the flow panel.'
          : 'This block has no outgoing flow yet.',
      )
    }
  }
  function openInsertMenu(
    event: React.MouseEvent | MouseEvent,
    target?: Pick<WireNode, 'id' | 'data' | 'parentId'>,
  ) {
    if (preview || !flow || !surface.current) return
    event.preventDefault()
    const bounds = surface.current.getBoundingClientRect()
    setPalette(false)
    setInsertPoint({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      position: flow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }),
      parentId: target?.data.kind === 'screen' ? target.id : target?.parentId,
    })
  }
  function add(kind: WireKind, at?: CanvasInsertPoint) {
    if (graph.nodes.length >= 500) return
    const parentId =
      kind !== 'screen'
        ? at
          ? at.parentId
          : node?.data.kind === 'screen'
            ? node.id
            : node?.parentId
        : undefined
    const bounds = surface.current?.getBoundingClientRect()
    const center =
      bounds && flow
        ? flow.screenToFlowPosition({
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
          })
        : { x: 100, y: 100 }
    const offset =
      (graph.nodes.filter((n) => n.parentId === parentId).length % 6) * 24
    const added = makeWireNode(
      kind,
      crypto.randomUUID(),
      parentId
        ? { x: 32 + offset, y: 70 + offset }
        : { x: center.x - 140 + offset, y: center.y - 80 + offset },
      parentId,
    )
    if (at) {
      const parent = liveNodes.find((n) => n.id === parentId)
      added.position = parent
        ? {
            x: Math.max(
              0,
              Math.min(
                at.position.x - parent.position.x,
                parent.width - added.width,
              ),
            ),
            y: Math.max(
              0,
              Math.min(
                at.position.y - parent.position.y,
                parent.height - added.height,
              ),
            ),
          }
        : at.position
    }
    if (!at && kind === 'screen' && screens.length)
      added.position = {
        x:
          Math.max(
            ...screens.map((screen) => screen.position.x + screen.width),
          ) + 120,
        y: screens[0].position.y,
      }
    if (!at) pendingFocus.current = parentId || added.id
    save({ ...graph, nodes: [...graph.nodes, added] })
    select(added.id)
    setPalette(false)
  }
  function starter() {
    const screen = makeWireNode('screen', crypto.randomUUID(), { x: 60, y: 70 })
    pendingFocus.current = screen.id
    screen.data.title = 'Your first screen'
    const heading = makeWireNode(
      'text',
      crypto.randomUUID(),
      { x: 36, y: 90 },
      screen.id,
    )
    heading.data.title = 'What happens here?'
    heading.data.content = 'Arrange blocks to sketch the experience.'
    heading.width = 440
    const card = makeWireNode(
      'card',
      crypto.randomUUID(),
      { x: 36, y: 184 },
      screen.id,
    )
    card.width = 568
    card.data.title = 'Main content'
    const button = makeWireNode(
      'button',
      crypto.randomUUID(),
      { x: 436, y: 370 },
      screen.id,
    )
    save({ ...graph, nodes: [...graph.nodes, screen, heading, card, button] })
    select(screen.id)
  }
  function connect(source: string, target: string, label = 'On click') {
    if (
      source === target ||
      !graph.nodes.some((n) => n.id === source) ||
      !graph.nodes.some((n) => n.id === target) ||
      graph.edges.length >= 1500
    )
      return
    if (
      graph.edges.some(
        (e) => e.source === source && e.target === target && e.label === label,
      )
    )
      return
    const id = crypto.randomUUID()
    save({
      ...graph,
      edges: [
        ...graph.edges,
        { id, source, target, label, type: 'smoothstep' },
      ],
    })
    setSelection(new Set())
    setEdgeId(id)
    setTargetId('')
  }
  function duplicate() {
    const ids = new Set(selection)
    for (const n of graph.nodes)
      if (n.parentId && ids.has(n.parentId)) ids.add(n.id)
    if (graph.nodes.length + ids.size > 500) return
    const newIds = new Map([...ids].map((id) => [id, crypto.randomUUID()]))
    const copies = graph.nodes
      .filter((n) => ids.has(n.id))
      .map((n) => ({
        ...structuredClone(n),
        id: newIds.get(n.id)!,
        ...(n.parentId
          ? { parentId: newIds.get(n.parentId) || n.parentId }
          : {}),
        position:
          n.parentId && ids.has(n.parentId)
            ? n.position
            : { x: n.position.x + 40, y: n.position.y + 40 },
        data: { ...n.data, title: (n.data.title + ' copy').slice(0, 120) },
      }))
    const copiedEdges = graph.edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        source: newIds.get(e.source)!,
        target: newIds.get(e.target)!,
      }))
    if (graph.edges.length + copiedEdges.length > 1500) return
    save({
      nodes: [...graph.nodes, ...copies],
      edges: [...graph.edges, ...copiedEdges],
    })
    setSelection(new Set([...selection].map((id) => newIds.get(id)!)))
  }
  function onNodesChange(changes: NodeChange<WireFlowNode>[]) {
    const selections = changes.filter((c) => c.type === 'select')
    if (selections.length)
      setSelection((previous) => {
        const next = new Set(previous)
        for (const change of selections) {
          if (change.selected) next.add(change.id)
          else next.delete(change.id)
        }
        return next
      })
    const positions = changes
      .filter((c) => c.type === 'position')
      .filter((c) => c.position)
    const dimensions = changes
      .filter((c) => c.type === 'dimensions')
      .filter((c) => c.dimensions && c.setAttributes)
    if (!positions.length && !dimensions.length) return
    const nextMoving = new Set(moving)
    for (const change of positions) {
      if (change.dragging === true) nextMoving.add(change.id)
      if (change.dragging === false) nextMoving.delete(change.id)
      if (
        change.position &&
        (change.dragging || dragPositions.current.has(change.id))
      )
        dragPositions.current.set(change.id, {
          id: change.id,
          position: change.position,
        })
    }
    setMoving(nextMoving)
    if (dragPositions.current.size)
      sendPresence(
        { dragging: [...dragPositions.current.values()] },
        !nextMoving.size,
      )
    save(
      {
        ...graph,
        nodes: graph.nodes.map((n) => {
          const pos = positions.find((c) => c.id === n.id)?.position
          const size = dimensions.find((c) => c.id === n.id)?.dimensions
          return pos || size
            ? {
                ...n,
                ...(pos ? { position: pos } : {}),
                ...(size ? { width: size.width, height: size.height } : {}),
              }
            : n
        }),
      },
      false,
    )
  }

  return (
    <div
      className={`canvas-page wireframe-page${full.fullscreen ? ' canvas-fullscreen' : ''}${preview ? ' wire-preview' : ''}`}
      onPointerDownCapture={() => {
        selectionBefore.current = selection
      }}
    >
      <div className="canvas-layout">
        <div
          ref={surface}
          className="canvas-surface wire-surface"
          onPointerMove={(event) => {
            if (following) return
            if (flow)
              sendPresence({
                cursor: flow.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                }),
              })
          }}
          onPointerLeave={() => sendPresence({ cursor: null }, true)}
        >
          <CanvasChrome
            navigation={navigation}
            tool={tool}
            onTool={setTool}
            multiSelect={touchSelection}
            onMultiSelect={setTouchSelection}
            preview={preview}
            actions={
              <>
                <button
                  ref={inspectorToggle}
                  className="button"
                  aria-label={
                    inspectorOpen
                      ? 'Hide wireframe details'
                      : 'Show wireframe details'
                  }
                  title={
                    inspectorOpen
                      ? 'Hide wireframe details'
                      : 'Show wireframe details'
                  }
                  aria-expanded={inspectorOpen}
                  aria-controls="wireframe-inspector"
                  onClick={() => setInspectorOpen(!inspectorOpen)}
                >
                  {inspectorOpen ? (
                    <PanelRightClose size={16} />
                  ) : (
                    <PanelRightOpen size={16} />
                  )}
                  <span className="touch-tool-label">Details</span>
                </button>
                <button
                  ref={full.button}
                  className="button fullscreen-toggle"
                  aria-label={
                    full.fullscreen
                      ? 'Exit fullscreen'
                      : 'Expand wireframes to fullscreen'
                  }
                  aria-pressed={full.fullscreen}
                  onClick={() => void full.toggle()}
                >
                  {full.fullscreen ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                  <span className="touch-tool-label">Expand</span>
                </button>
              </>
            }
          >
            <button
              className={`button preview-toggle ${preview ? 'primary' : ''}`}
              aria-pressed={preview}
              onClick={() => {
                setPreview(!preview)
                setPalette(false)
              }}
            >
              {preview ? <Pencil size={15} /> : <Play size={15} />}
              <span>{preview ? 'Edit' : 'Preview flow'}</span>
            </button>
            {!preview && (
              <div className="add-node-wrap">
                <button
                  className="button primary"
                  aria-expanded={palette}
                  onClick={() => setPalette(!palette)}
                  disabled={graph.nodes.length >= 500}
                >
                  <Plus size={16} />
                  Add block
                </button>
                {palette && (
                  <div className="node-palette wire-palette">
                    <div className="popover-heading">
                      Build your interface
                      <button
                        className="icon-button"
                        aria-label="Close block menu"
                        onClick={() => setPalette(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {wireKinds.map((kind) => {
                      const Icon = icons[kind]
                      return (
                        <button key={kind} onClick={() => add(kind)}>
                          <Icon size={17} />
                          {wireLabels[kind]}
                          <Plus size={14} />
                        </button>
                      )
                    })}
                    <p>Select a screen first to add blocks inside it.</p>
                  </div>
                )}
              </div>
            )}
          </CanvasChrome>
          <div className="canvas-caption">
            {screens.length} screens
            <span className="caption-separator" />
            {graph.nodes.length - screens.length} blocks
            <span className="caption-separator" />
            {graph.edges.length} flows
          </div>
          {compact && touchSelection && !preview && (
            <div className="touch-selection-hint">
              Tap blocks to select. Tap Done to move them together.
            </div>
          )}
          <ReactFlow<WireFlowNode>
            nodes={[...liveNodes]
              .sort((a, b) => Number(!!a.parentId) - Number(!!b.parentId))
              .map((n) => ({
                ...n,
                selected: selection.has(n.id),
                measured: { width: n.width, height: n.height },
                dragHandle:
                  n.data.kind === 'screen' ? '.wire-screen-title' : undefined,
                zIndex: n.data.kind === 'screen' ? 0 : 1,
                ariaLabel: `${wireLabels[n.data.kind]}: ${n.data.title}`,
                data: {
                  ...n.data,
                  preview,
                  checkpoint,
                  follow: graph.edges.some((e) => e.source === n.id)
                    ? () => follow(n.id)
                    : undefined,
                  selectorColor: selection.has(n.id)
                    ? profile.color
                    : peers.find((p) => p.selected.includes(n.id))?.profile
                        .color,
                },
              }))}
            edges={graph.edges.map((e, index) => {
              const source = liveNodes.find((n) => n.id === e.source)!
              const target = liveNodes.find((n) => n.id === e.target)!
              const sides = wireConnectionSides(source, target, liveNodes)
              const selectors = [
                ...(edgeId === e.id ? [profile] : []),
                ...peers
                  .filter((p) => p.selectedEdges?.includes(e.id))
                  .map((p) => p.profile),
              ]
              const color = selectors[0]?.color || '#a34d6c'
              return {
                ...e,
                sourceHandle: sides.sourceSide,
                targetHandle: sides.targetSide,
                hidden: preview,
                selected: edgeId === e.id,
                zIndex: 2,
                data: {
                  selectors,
                  currentUserId: profile.id,
                  route: routes.get(e.id),
                  number: index + 1,
                  muted: !!edgeId && edgeId !== e.id,
                  select: () => {
                    setEdgeId(e.id)
                    setSelection(new Set())
                  },
                },
                markerEnd: { type: MarkerType.ArrowClosed, color },
                ariaLabel: `${e.label}: ${graph.nodes.find((n) => n.id === e.source)?.data.title} to ${graph.nodes.find((n) => n.id === e.target)?.data.title}`,
                style: {
                  '--edge-selection-color': color,
                  '--edge-selection-width': selectors.length ? 3 : 2,
                } as CSSProperties,
              }
            })}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            onInit={setFlow}
            onMove={(_, viewport) => publishCamera(viewport)}
            onPaneContextMenu={(event) => openInsertMenu(event)}
            onNodeContextMenu={(event, target) => openInsertMenu(event, target)}
            onMoveStart={() => setInsertPoint(null)}
            onNodesChange={onNodesChange}
            nodesDraggable={
              !preview && tool === 'select' && (!compact || !touchSelection)
            }
            panOnDrag={tool === 'pan' || compact || preview ? true : [1, 2]}
            selectionOnDrag={!compact && !preview && tool === 'select'}
            zoomOnDoubleClick={false}
            nodesConnectable={!preview && tool !== 'pan'}
            deleteKeyCode={preview ? null : ['Backspace', 'Delete']}
            onNodeClick={(event, clicked) => {
              if (preview) {
                follow(clicked.id)
                return
              }
              if (
                event.ctrlKey ||
                event.metaKey ||
                (compact && touchSelection)
              ) {
                const next = new Set(selectionBefore.current)
                if (next.has(clicked.id)) next.delete(clicked.id)
                else next.add(clicked.id)
                setSelection(next)
              }
              setEdgeId(null)
            }}
            onNodeDoubleClick={(event, clicked) => {
              event.stopPropagation()
              editItem(clicked.id)
            }}
            onEdgeDoubleClick={(event, clicked) => {
              event.stopPropagation()
              editItem(clicked.id, true)
            }}
            onEdgeClick={(_, clicked) => {
              setEdgeId(clicked.id)
              setSelection(new Set())
            }}
            onPaneClick={() => {
              setSelection(new Set())
              setEdgeId(null)
              setPalette(false)
            }}
            onConnect={(connection) =>
              connect(connection.source, connection.target)
            }
            onNodeDragStart={checkpoint}
            onSelectionDragStart={checkpoint}
            onDelete={({ nodes, edges }) => {
              const next = removeWireNodes(
                graph,
                new Set(nodes.map((n) => n.id)),
              )
              save({
                ...next,
                edges: next.edges.filter(
                  (e) => !edges.some((removed) => removed.id === e.id),
                ),
              })
              setSelection(new Set())
              setEdgeId(null)
            }}
            multiSelectionKeyCode={['Control', 'Meta']}
            selectionKeyCode="Shift"
            defaultViewport={board.wireframeViewport}
            fitView={compact || !board.wireframeViewport}
            fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            onMoveEnd={(_, viewport) => {
              if (!following)
                update({ ...board, wireframeViewport: viewport }, false)
            }}
            connectionRadius={30}
            snapToGrid
            snapGrid={[8, 8]}
          >
            <Background color="#d7d2dd" gap={24} size={1} />
            <LiveCursors
              peers={peers}
              nodes={liveNodes.map((n) => ({
                ...n,
                position: wirePosition(n, liveNodes),
              }))}
              profile={profile}
              selectedIds={selection}
            />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) =>
                n.data.kind === 'screen' ? '#ede8ef' : '#b9a7b8'
              }
              maskColor="rgba(246,245,249,.65)"
            />
          </ReactFlow>
          {insertPoint && !preview && (
            <CanvasInsertMenu
              point={insertPoint}
              title={
                insertPoint.parentId ? 'Add to screen' : 'Add to wireframes'
              }
              disabled={graph.nodes.length >= 500}
              onClose={() => setInsertPoint(null)}
              items={wireKinds.map((kind) => {
                const Icon = icons[kind]
                return {
                  id: kind,
                  label: wireLabels[kind],
                  icon: <Icon size={16} />,
                  onSelect: () => add(kind, insertPoint),
                }
              })}
            />
          )}
          {!graph.nodes.length && (
            <div className="empty-canvas wire-empty">
              <div className="wire-empty-art">
                <AppWindow size={72} strokeWidth={1} />
                <MousePointer2 size={27} />
              </div>
              <h2>Give this idea a shape.</h2>
              <p>
                Build a screen from blocks, then draw the journey between them.
              </p>
              <button className="button primary" onClick={starter}>
                <Plus size={16} />
                Start with a screen
              </button>
              <button className="button" onClick={() => setPalette(true)}>
                Or add a single block
              </button>
            </div>
          )}
          <div className="canvas-tip" role="status">
            {preview
              ? previewMessage
              : 'Drag blocks · Resize corners · Ctrl / ⌘ + click to group · Connect either side'}
          </div>
        </div>
        {inspectorOpen && (
          <ResizableInspector
            id="wireframe-inspector"
            className="wire-inspector"
          >
            <div className="inspector-heading">
              <span>
                {preview
                  ? 'Follow the flow'
                  : selected.length > 1
                    ? `${selected.length} blocks selected`
                    : node
                      ? `${wireLabels[node.data.kind]} details`
                      : edge
                        ? 'Interaction'
                        : 'Wireframe kit'}
              </span>
              <button
                className="icon-button"
                aria-label="Close wireframe details"
                onClick={() => {
                  setInspectorOpen(false)
                  inspectorToggle.current?.focus()
                }}
              >
                <X size={16} />
              </button>
            </div>
            {preview ? (
              <div className="inspector-body">
                <Play size={22} />
                <h2>Try the journey.</h2>
                <p role="status">{previewMessage}</p>
                {node && (
                  <>
                    <strong>{node.data.title}</strong>
                    {graph.edges
                      .filter((e) => e.source === node.id)
                      .map((e) => (
                        <button
                          className="button wire-flow-link"
                          key={e.id}
                          onClick={() => {
                            focus(e.target)
                            setPreviewMessage(
                              `${e.label} → ${graph.nodes.find((n) => n.id === e.target)?.data.title}`,
                            )
                          }}
                        >
                          {e.label}
                          <ArrowRight size={14} />
                          {
                            graph.nodes.find((n) => n.id === e.target)?.data
                              .title
                          }
                        </button>
                      ))}
                  </>
                )}
                <button className="button" onClick={() => setPreview(false)}>
                  <Pencil size={14} />
                  Back to editing
                </button>
              </div>
            ) : selected.length > 1 ? (
              <div className="inspector-body">
                <h2>Arrange together.</h2>
                <p>
                  Drag any selected block to move the group. Screen contents
                  move with their frame.
                </p>
                <label>
                  Appearance
                  <select
                    value=""
                    onChange={(e) =>
                      save({
                        ...graph,
                        nodes: graph.nodes.map((n) =>
                          selection.has(n.id)
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  tone: e.target
                                    .value as WireNode['data']['tone'],
                                },
                              }
                            : n,
                        ),
                      })
                    }
                  >
                    <option value="" disabled>
                      Change selected blocks…
                    </option>
                    <option value="plain">Plain</option>
                    <option value="soft">Soft</option>
                    <option value="accent">Accent</option>
                  </select>
                </label>
                <button className="button" onClick={duplicate}>
                  <Copy size={14} />
                  Duplicate selection
                </button>
                <button
                  className="button danger"
                  onClick={() => {
                    save(removeWireNodes(graph, selection))
                    setSelection(new Set())
                  }}
                >
                  <Trash2 size={14} />
                  Delete selected blocks
                </button>
              </div>
            ) : node ? (
              <div className="inspector-body" key={node.id}>
                <label>
                  Label
                  <input
                    aria-label="Block label"
                    ref={editField}
                    value={node.data.title}
                    maxLength={120}
                    onChange={(e) =>
                      editData({ title: e.target.value || 'Untitled' })
                    }
                  />
                </label>
                {node.data.kind !== 'button' && node.data.kind !== 'screen' && (
                  <label>
                    {node.data.kind === 'input' ? 'Placeholder' : 'Content'}
                    <textarea
                      aria-label="Block content"
                      rows={3}
                      maxLength={2000}
                      value={node.data.content}
                      onChange={(e) => editData({ content: e.target.value })}
                    />
                  </label>
                )}
                <div className="field-row">
                  {(['width', 'height'] as const).map((key) => (
                    <label key={key}>
                      {key === 'width' ? 'Width' : 'Height'}
                      <input
                        aria-label={`Block ${key}`}
                        type="number"
                        min={key === 'width' ? 60 : 32}
                        max={2400}
                        value={node[key]}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber
                          if (
                            Number.isFinite(value) &&
                            value >= (key === 'width' ? 60 : 32) &&
                            value <= 2400
                          )
                            editNode({ [key]: value })
                        }}
                      />
                    </label>
                  ))}
                </div>
                {node.data.kind === 'screen' ? (
                  <div className="wire-screen-presets">
                    <button
                      className="button"
                      onClick={() => editNode({ width: 640, height: 460 })}
                    >
                      Desktop
                    </button>
                    <button
                      className="button"
                      onClick={() => editNode({ width: 320, height: 640 })}
                    >
                      Mobile
                    </button>
                  </div>
                ) : (
                  <label>
                    On screen
                    <select
                      aria-label="Block screen"
                      value={node.parentId || ''}
                      onChange={(e) => {
                        const parent = screens.find(
                          (n) => n.id === e.target.value,
                        )
                        const absolute = wirePosition(node, graph.nodes)
                        editNode({
                          parentId: parent?.id,
                          position: parent ? { x: 32, y: 72 } : absolute,
                        })
                      }}
                    >
                      <option value="">Canvas (no screen)</option>
                      {screens.map((screen) => (
                        <option key={screen.id} value={screen.id}>
                          {screen.data.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Appearance
                  <select
                    aria-label="Block appearance"
                    value={node.data.tone}
                    onChange={(e) =>
                      editData({
                        tone: e.target.value as WireNode['data']['tone'],
                      })
                    }
                  >
                    <option value="plain">Plain</option>
                    <option value="soft">Soft</option>
                    <option value="accent">Accent</option>
                  </select>
                </label>
                <section className="wire-interaction">
                  <h3>
                    <Link2 size={15} />
                    What happens next?
                  </h3>
                  <label>
                    Trigger
                    <input
                      aria-label="Flow trigger"
                      value={trigger}
                      maxLength={120}
                      onChange={(e) => setTrigger(e.target.value)}
                    />
                  </label>
                  <label>
                    Destination
                    <select
                      aria-label="Flow destination"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                    >
                      <option value="">Choose a block or screen…</option>
                      {graph.nodes
                        .filter((n) => n.id !== node.id)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {wireLabels[n.data.kind]} · {n.data.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    className="button"
                    disabled={
                      !targetId ||
                      targetId === node.id ||
                      !graph.nodes.some((n) => n.id === targetId)
                    }
                    onClick={() =>
                      connect(node.id, targetId, trigger.trim() || 'On click')
                    }
                  >
                    <ArrowRight size={14} />
                    Connect flow
                  </button>
                  {graph.edges
                    .filter((e) => e.source === node.id)
                    .map((e) => (
                      <button
                        className="wire-existing-flow"
                        key={e.id}
                        onClick={() => {
                          setEdgeId(e.id)
                          setSelection(new Set())
                        }}
                      >
                        {e.label}
                        <ArrowRight size={12} />
                        {graph.nodes.find((n) => n.id === e.target)?.data.title}
                      </button>
                    ))}
                </section>
                <div className="inspector-actions">
                  <button className="button" onClick={duplicate}>
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label={
                      node.data.kind === 'screen'
                        ? 'Delete screen and its blocks'
                        : 'Delete block'
                    }
                    onClick={() => {
                      save(removeWireNodes(graph, selection))
                      setSelection(new Set())
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {node.data.kind === 'screen' && (
                  <p>
                    Drag the screen’s title bar to move it with its blocks.
                    Deleting a screen also deletes its contents; Undo restores
                    them.
                  </p>
                )}
              </div>
            ) : edge ? (
              <div className="inspector-body">
                <div className="detail-kind">
                  <ArrowRight size={16} />
                  Interaction
                </div>
                <h2>
                  {graph.nodes.find((n) => n.id === edge.source)?.data.title}
                </h2>
                <p>
                  leads to{' '}
                  {graph.nodes.find((n) => n.id === edge.target)?.data.title}
                </p>
                <label>
                  Interaction label
                  <input
                    aria-label="Interaction label"
                    ref={editField}
                    value={edge.label}
                    maxLength={120}
                    onChange={(e) =>
                      save({
                        ...graph,
                        edges: graph.edges.map((link) =>
                          link.id === edge.id
                            ? { ...link, label: e.target.value }
                            : link,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Destination
                  <select
                    aria-label="Interaction destination"
                    value={edge.target}
                    onChange={(e) =>
                      save({
                        ...graph,
                        edges: graph.edges.map((link) =>
                          link.id === edge.id
                            ? { ...link, target: e.target.value }
                            : link,
                        ),
                      })
                    }
                  >
                    {graph.nodes
                      .filter((n) => n.id !== edge.source)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.data.title}
                        </option>
                      ))}
                  </select>
                </label>
                <button className="button" onClick={() => focus(edge.target)}>
                  <ArrowRight size={14} />
                  Show destination
                </button>
                <button
                  className="button danger"
                  onClick={() => {
                    save({
                      ...graph,
                      edges: graph.edges.filter((e) => e.id !== edge.id),
                    })
                    setEdgeId(null)
                  }}
                >
                  <Trash2 size={14} />
                  Remove flow
                </button>
              </div>
            ) : (
              <div className="inspector-body overview-body">
                <AppWindow size={30} strokeWidth={1.2} />
                <h2>From idea to interface.</h2>
                <p>
                  Start with a screen, add the pieces, then link the actions.
                  Each board keeps its own wireframes.
                </p>
                {!!graph.edges.length && (
                  <div className="wire-flow-index" aria-label="Board flows">
                    <h3>Flows</h3>
                    {graph.edges.map((link, index) => (
                      <button
                        key={link.id}
                        onClick={() => {
                          setEdgeId(link.id)
                          setSelection(new Set())
                        }}
                      >
                        <span>{index + 1}</span>
                        <div>
                          <strong>{link.label || 'On click'}</strong>
                          <small>
                            {
                              graph.nodes.find((n) => n.id === link.source)
                                ?.data.title
                            }{' '}
                            →{' '}
                            {
                              graph.nodes.find((n) => n.id === link.target)
                                ?.data.title
                            }
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="wire-kit">
                  {wireKinds.map((kind) => {
                    const Icon = icons[kind]
                    return (
                      <button
                        key={kind}
                        disabled={graph.nodes.length >= 500}
                        onClick={() => add(kind)}
                      >
                        <Icon size={18} />
                        <span>{wireLabels[kind]}</span>
                        <Plus size={13} />
                      </button>
                    )
                  })}
                </div>
                <div className="wire-screen-list">
                  {screens.map((screen) => (
                    <button key={screen.id} onClick={() => focus(screen.id)}>
                      <AppWindow size={14} />
                      {screen.data.title}
                      <ArrowRight size={13} />
                    </button>
                  ))}
                </div>
                <p>
                  Connect either side of a block to its destination, or use
                  “What happens next?” in its details. Arrows choose the side
                  facing their destination.
                </p>
              </div>
            )}
          </ResizableInspector>
        )}
      </div>
    </div>
  )
}
