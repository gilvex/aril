import type { CanvasFullscreenControls } from '../model/use-canvas-fullscreen'
import { useFollowViewport } from '../model/use-follow-viewport'
import type { CameraPresence } from '../../../../domain/collaboration'
import { CanvasChrome, type CanvasTool } from './CanvasChrome'
import type { ReactNode } from 'react'
import { LiveCursors } from './LiveCursors'
import { ResizableInspector } from './ResizableInspector'
import { flushSync } from 'react-dom'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type NodeChange,
  type ReactFlowInstance,
  type Node,
} from '@xyflow/react'
import {
  Plus,
  X,
  Copy,
  Trash2,
  ArrowUpRight,
  MousePointer2,
  Link2,
  Unplug,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react'
import {
  nodeKinds,
  statuses,
  type Board,
  type Idea,
  type Requirement,
} from '../../../shared/api/workspace'
import { IdeaNode, kindIcons, kindLabels } from './IdeaNode'
import type {
  DragPosition,
  Presence,
  Profile,
} from '../../../../domain/collaboration'
import { useLiveNodePositions } from '../model/use-live-node-positions'
import { SelectionEdge } from './SelectionPresence'
import { useCompactLayout } from '../../../shared/lib/use-compact-layout'
import { CanvasInsertMenu, type CanvasInsertPoint } from './CanvasInsertMenu'

const nodeTypes = { idea: IdeaNode }
const edgeTypes = { smoothstep: SelectionEdge }
type Props = {
  full: CanvasFullscreenControls
  following: Presence | null
  navigation: ReactNode
  board: Board
  requirements: Requirement[]
  update: (board: Board, record?: boolean) => void
  checkpoint: () => void
  openRequirement: (id: string) => void
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
export function CanvasBoard({
  full,
  navigation,
  following,
  board,
  requirements,
  update,
  checkpoint,
  openRequirement,
  peers,
  sendPresence,
  saveState,
  profile,
}: Props) {
  const [localDragging, setLocalDragging] = useState<Set<string>>(new Set())
  const compact = useCompactLayout()
  const [tool, setTool] = useState<CanvasTool>('select')
  const [inspectorPreference, setInspectorOpen] = useState<boolean | null>(null)
  const inspectorOpen = inspectorPreference ?? false
  const [touchSelection, setTouchSelection] = useState(false)
  const inspectorToggle = useRef<HTMLButtonElement>(null)
  const editField = useRef<HTMLInputElement>(null)
  const dragPositions = useRef(new Map<string, DragPosition>())
  const liveNodes = useLiveNodePositions(board.nodes, peers, localDragging)
  useEffect(() => {
    if (
      !localDragging.size &&
      (saveState === 'saved' || saveState === 'error')
    ) {
      dragPositions.current.clear()
      sendPresence({ dragging: [] }, true)
    }
  }, [localDragging, saveState, sendPresence])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    sendPresence({ selected: [...selectedIds] }, true)
  }, [selectedIds, sendPresence])
  const selectionBeforePointerDown = useRef(selectedIds)
  const selectedNodes = board.nodes.filter((n) => selectedIds.has(n.id))
  const selected = selectedNodes.length === 1 ? selectedNodes[0].id : null
  const setSelected = (id: string | null) =>
    setSelectedIds(new Set(id ? [id] : []))
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    fullscreen,
    button: fullscreenButtonRef,
    toggle: toggleFullscreen,
  } = full
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  useEffect(() => {
    if (following) {
      setSelectedIds(new Set())
      setSelectedEdge(null)
    }
  }, [following?.clientId])
  const visibleSelectedEdge = board.edges.some(
    (edge) => edge.id === selectedEdge,
  )
    ? selectedEdge
    : null
  useEffect(() => {
    sendPresence(
      { selectedEdges: visibleSelectedEdge ? [visibleSelectedEdge] : [] },
      true,
    )
  }, [visibleSelectedEdge, sendPresence])
  const [dimensions, setDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({})
  const [palette, setPalette] = useState(false)
  const [insertPoint, setInsertPoint] = useState<CanvasInsertPoint | null>(null)
  const [flow, setFlow] = useState<ReactFlowInstance<
    Node<Idea['data']>
  > | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const publishCamera = useFollowViewport(
    flow,
    surface,
    following,
    sendPresence,
  )
  const node = board.nodes.find((n) => n.id === selected)
  const edge = board.edges.find((e) => e.id === selectedEdge)
  const editItem = (id: string, connection = false) => {
    flushSync(() => {
      setSelected(connection ? null : id)
      setSelectedEdge(connection ? id : null)
      setInspectorOpen(true)
      setTouchSelection(false)
      setTool('select')
      setPalette(false)
      setInsertPoint(null)
    })
    editField.current?.focus()
    editField.current?.select()
  }
  const updateNode = (data: Partial<Idea['data']>) =>
    update({
      ...board,
      nodes: board.nodes.map((n) =>
        n.id === selected ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    })
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return
      if (
        board.edges.some(
          (e) =>
            e.source === connection.source && e.target === connection.target,
        )
      )
        return
      update({
        ...board,
        edges: addEdge(
          {
            ...connection,
            id: crypto.randomUUID(),
            type: 'smoothstep',
            label: 'connects to',
          },
          board.edges,
        ),
      })
    },
    [board, update],
  )
  const onNodesChange = (changes: NodeChange<Node<Idea['data']>>[]) => {
    const selectionChanges = changes.filter((c) => c.type === 'select')
    if (selectionChanges.length)
      setSelectedIds((previous) => {
        const next = new Set(previous)
        for (const change of selectionChanges) {
          if (change.selected) next.add(change.id)
          else next.delete(change.id)
        }
        return next
      })
    const measurements = changes.filter((c) => c.type === 'dimensions')
    if (measurements.length)
      setDimensions((previous) => {
        const next = { ...previous }
        let changed = false
        for (const measurement of measurements) {
          if (
            measurement.dimensions &&
            (next[measurement.id]?.width !== measurement.dimensions.width ||
              next[measurement.id]?.height !== measurement.dimensions.height)
          ) {
            next[measurement.id] = measurement.dimensions
            changed = true
          }
        }
        return changed ? next : previous
      })
    const persisted = changes.filter((c) => c.type === 'position')
    if (!persisted.length) return
    // React Flow's `dragging` flag is transient UI state, not an undoable field.
    const positions = new Map(
      persisted.map((change) => [change.id, change.position]),
    )
    const nodes = board.nodes.map((node) => {
      const position = positions.get(node.id)
      return position ? { ...node, position } : node
    })
    const moving = new Set(localDragging)
    for (const change of persisted) {
      if (change.dragging === true) moving.add(change.id)
      if (change.dragging === false) moving.delete(change.id)
      if (
        change.position &&
        (change.dragging || dragPositions.current.has(change.id))
      )
        dragPositions.current.set(change.id, {
          id: change.id,
          position: change.position,
        })
    }
    setLocalDragging(moving)
    if (dragPositions.current.size)
      sendPresence(
        { dragging: [...dragPositions.current.values()] },
        !moving.size,
      )
    update(
      {
        ...board,
        nodes,
        edges: board.edges.filter(
          (e) =>
            nodes.some((n) => n.id === e.source) &&
            nodes.some((n) => n.id === e.target),
        ),
      },
      false,
    )
  }
  const onDelete = ({
    nodes,
    edges,
  }: {
    nodes: Node[]
    edges: { id: string }[]
  }) => {
    const nodeIds = new Set(nodes.map((n) => n.id))
    const edgeIds = new Set(edges.map((e) => e.id))
    update(
      {
        ...board,
        nodes: board.nodes.filter((n) => !nodeIds.has(n.id)),
        edges: board.edges.filter(
          (e) =>
            !edgeIds.has(e.id) &&
            !nodeIds.has(e.source) &&
            !nodeIds.has(e.target),
        ),
      },
      false,
    )
    setSelected(null)
    setSelectedEdge(null)
  }
  const addNode = (
    kind: Idea['data']['kind'],
    at?: { x: number; y: number },
  ) => {
    if (board.nodes.length >= 500) return
    const surface = document
      .querySelector('.canvas-surface')
      ?.getBoundingClientRect()
    const position =
      flow && surface
        ? flow.screenToFlowPosition({
            x: surface.x + surface.width / 2 - 100,
            y: surface.y + surface.height / 2 - 60,
          })
        : { x: 100, y: 100 }
    const id = crypto.randomUUID()
    update({
      ...board,
      nodes: [
        ...board.nodes,
        {
          id,
          type: 'idea',
          position: at || position,
          data: {
            title: `New ${kindLabels[kind].toLowerCase()}`,
            kind,
            description: 'What role does this play?',
            notes: '',
            status: 'Exploring',
            requirements: [],
          },
        },
      ],
    })
    setSelected(id)
    setSelectedEdge(null)
    setPalette(false)
  }
  const removeNode = () => {
    if (!node) return
    update({
      ...board,
      nodes: board.nodes.filter((n) => n.id !== node.id),
      edges: board.edges.filter(
        (e) => e.source !== node.id && e.target !== node.id,
      ),
    })
    setSelected(null)
  }
  return (
    <div
      ref={canvasRef}
      onPointerDownCapture={() => {
        selectionBeforePointerDown.current = selectedIds
      }}
      className={`canvas-page${fullscreen ? ' canvas-fullscreen' : ''}`}
    >
      <div className="canvas-layout">
        <div
          className="canvas-surface"
          ref={surface}
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
            actions={
              <>
                <button
                  ref={inspectorToggle}
                  className="button"
                  aria-label={
                    inspectorOpen ? 'Hide board details' : 'Show board details'
                  }
                  title={
                    inspectorOpen ? 'Hide board details' : 'Show board details'
                  }
                  aria-expanded={inspectorOpen}
                  aria-controls="board-inspector"
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
                  ref={fullscreenButtonRef}
                  className="button fullscreen-toggle"
                  aria-label={
                    fullscreen
                      ? 'Exit fullscreen'
                      : 'Expand canvas to fullscreen'
                  }
                  aria-pressed={fullscreen}
                  title={
                    fullscreen
                      ? 'Exit fullscreen (Esc)'
                      : 'Expand canvas to fullscreen'
                  }
                  onClick={() => void toggleFullscreen()}
                >
                  {fullscreen ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                  <span>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
                </button>
              </>
            }
          >
            <div className="add-node-wrap">
              <button
                className="button primary"
                onClick={() => setPalette(!palette)}
              >
                <Plus size={16} />
                Add node
              </button>
              {palette && (
                <div className="node-palette">
                  <div className="popover-heading">
                    Add to your canvas
                    <button
                      className="icon-button"
                      onClick={() => setPalette(false)}
                      aria-label="Close node menu"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {nodeKinds.map((kind) => {
                    const Icon = kindIcons[kind]
                    return (
                      <button key={kind} onClick={() => addNode(kind)}>
                        <Icon size={17} />
                        {kindLabels[kind]}
                        <Plus size={14} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </CanvasChrome>
          <div className="canvas-caption">
            <span className="small-dot" />
            {board.nodes.length} ideas
            <span className="caption-separator" />
            {board.edges.length} connections
          </div>
          {compact && touchSelection && (
            <div className="touch-selection-hint">
              Tap nodes to select. Tap Done to move them together.
            </div>
          )}
          <ReactFlow
            key={board.id}
            nodes={liveNodes.map((n) => ({
              ...n,
              measured: dimensions[n.id],
              selected: selectedIds.has(n.id),
            }))}
            edges={board.edges.map((e) => {
              const selectors = [
                ...(e.id === selectedEdge ? [profile] : []),
                ...peers
                  .filter((peer) => peer.selectedEdges?.includes(e.id))
                  .map((peer) => peer.profile),
              ]
              const color = selectors[0]?.color
              const names = [
                ...new Set(selectors.map((person) => person.name)),
              ].join(', ')
              return {
                ...e,
                selected: e.id === selectedEdge,
                data: { selectors, currentUserId: profile.id },
                ariaLabel: `${e.label || 'Connection'}${names ? ` — selected by ${names}` : ''}`,
                style: color
                  ? ({
                      '--edge-selection-color': color,
                      '--edge-selection-width': 3,
                      filter: `drop-shadow(0 0 3px ${color}66)`,
                    } as CSSProperties)
                  : undefined,
                labelStyle: color
                  ? { fill: color, fontWeight: 700 }
                  : undefined,
              }
            })}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={setFlow}
            onMove={(_, viewport) => publishCamera(viewport)}
            onPaneContextMenu={(event) => {
              event.preventDefault()
              if (!flow) return
              const bounds = canvasRef.current
                ?.querySelector('.canvas-surface')
                ?.getBoundingClientRect()
              if (!bounds) return
              setPalette(false)
              setInsertPoint({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
                position: flow.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                }),
              })
            }}
            onMoveStart={() => setInsertPoint(null)}
            onNodesChange={onNodesChange}
            nodesDraggable={tool === 'select' && (!compact || !touchSelection)}
            nodesConnectable={tool !== 'pan'}
            panOnDrag={tool === 'pan' || compact ? true : [1, 2]}
            selectionOnDrag={!compact && tool === 'select'}
            zoomOnDoubleClick={false}
            onDelete={onDelete}
            onConnect={onConnect}
            onNodeClick={(event, clickedNode) => {
              if (
                event.ctrlKey ||
                event.metaKey ||
                (compact && touchSelection)
              ) {
                const next = new Set(selectionBeforePointerDown.current)
                if (next.has(clickedNode.id)) next.delete(clickedNode.id)
                else next.add(clickedNode.id)
                setSelectedIds(next)
              }
              setSelectedEdge(null)
            }}
            onNodeDoubleClick={(event, clickedNode) => {
              event.stopPropagation()
              editItem(clickedNode.id)
            }}
            onEdgeDoubleClick={(event, clickedEdge) => {
              event.stopPropagation()
              editItem(clickedEdge.id, true)
            }}
            onEdgeClick={(_, e) => {
              setSelectedEdge(e.id)
              setSelected(null)
            }}
            onPaneClick={() => {
              setSelected(null)
              setSelectedEdge(null)
              setPalette(false)
            }}
            onNodeDragStart={checkpoint}
            onSelectionDragStart={checkpoint}
            multiSelectionKeyCode={['Control', 'Meta']}
            selectionKeyCode="Shift"
            onBeforeDelete={async () => {
              checkpoint()
              return true
            }}
            onMoveEnd={(_, viewport) => {
              if (
                !following &&
                JSON.stringify(viewport) !== JSON.stringify(board.viewport)
              )
                update({ ...board, viewport }, false)
            }}
            defaultViewport={board.viewport}
            fitView={compact || !board.viewport}
            fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{ type: 'smoothstep' }}
            connectionRadius={28}
          >
            <Background
              color="#d9d6e2"
              gap={22}
              size={1.2}
              variant={BackgroundVariant.Dots}
            />
            <LiveCursors
              peers={peers}
              nodes={liveNodes}
              profile={profile}
              selectedIds={selectedIds}
            />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor="#c5bbd5"
              maskColor="rgba(246,245,249,.65)"
            />
          </ReactFlow>
          {insertPoint && (
            <CanvasInsertMenu
              point={insertPoint}
              title="Add to canvas"
              disabled={board.nodes.length >= 500}
              onClose={() => setInsertPoint(null)}
              items={nodeKinds.map((kind) => {
                const Icon = kindIcons[kind]
                return {
                  id: kind,
                  label: kindLabels[kind],
                  icon: <Icon size={16} />,
                  onSelect: () => addNode(kind, insertPoint.position),
                }
              })}
            />
          )}
          {!board.nodes.length && (
            <div className="empty-canvas">
              <div className="empty-symbol">
                <Plus size={28} />
              </div>
              <h2>Every system starts with an idea.</h2>
              <p>Add your first node, then connect the pieces.</p>
              <button
                className="button primary"
                onClick={() => setPalette(true)}
              >
                Add your first node
              </button>
            </div>
          )}
          <div className="canvas-tip">
            <MousePointer2 size={13} />
            <span>Drag to move</span>
            <span>·</span>
            <span>Ctrl / ⌘ + click to select more</span>
            <span>·</span>
            <Link2 size={13} />
            <span>Connect the handles</span>
          </div>
        </div>
        {inspectorOpen && (
          <ResizableInspector id="board-inspector">
            <div className="inspector-heading">
              <span>
                {selectedNodes.length > 1
                  ? `${selectedNodes.length} nodes selected`
                  : node
                    ? 'Node details'
                    : edge
                      ? 'Connection'
                      : 'Board overview'}
              </span>
              <button
                className="icon-button"
                aria-label="Close board details"
                onClick={() => {
                  setInspectorOpen(false)
                  inspectorToggle.current?.focus()
                }}
              >
                <X size={16} />
              </button>
            </div>
            {selectedNodes.length > 1 ? (
              <div className="inspector-body multi-selection-body">
                <h2>Edit together.</h2>
                <p>
                  Drag any selected node to move the group. Ctrl / ⌘ + click
                  toggles a node; Shift + drag selects an area.
                </p>
                <label>
                  Type
                  <select
                    aria-label="Selected nodes type"
                    value={
                      selectedNodes.every(
                        (n) => n.data.kind === selectedNodes[0].data.kind,
                      )
                        ? selectedNodes[0].data.kind
                        : ''
                    }
                    onChange={(e) => {
                      checkpoint()
                      update(
                        {
                          ...board,
                          nodes: board.nodes.map((n) =>
                            selectedIds.has(n.id)
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    kind: e.target
                                      .value as Idea['data']['kind'],
                                  },
                                }
                              : n,
                          ),
                        },
                        false,
                      )
                    }}
                  >
                    <option value="" disabled>
                      Mixed types
                    </option>
                    {nodeKinds.map((k) => (
                      <option key={k} value={k}>
                        {kindLabels[k]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Decision
                  <select
                    aria-label="Selected nodes decision"
                    value={
                      selectedNodes.every(
                        (n) => n.data.status === selectedNodes[0].data.status,
                      )
                        ? selectedNodes[0].data.status
                        : ''
                    }
                    onChange={(e) => {
                      checkpoint()
                      update(
                        {
                          ...board,
                          nodes: board.nodes.map((n) =>
                            selectedIds.has(n.id)
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    status: e.target
                                      .value as Idea['data']['status'],
                                  },
                                }
                              : n,
                          ),
                        },
                        false,
                      )
                    }}
                  >
                    <option value="" disabled>
                      Mixed decisions
                    </option>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <ul className="selected-node-list">
                  {selectedNodes.map((n) => (
                    <li key={n.id}>{n.data.title}</li>
                  ))}
                </ul>
                <button
                  className="button danger"
                  onClick={() => {
                    checkpoint()
                    onDelete({ nodes: selectedNodes, edges: [] })
                  }}
                >
                  <Trash2 size={15} />
                  Delete selected nodes
                </button>
              </div>
            ) : node ? (
              <div className="inspector-body" key={node.id}>
                <span className={`detail-kind kind-${node.data.kind}`}>
                  {kindLabels[node.data.kind]}
                </span>
                <label>
                  Title
                  <input
                    aria-label="Node title"
                    ref={editField}
                    value={node.data.title}
                    maxLength={120}
                    onChange={(e) =>
                      updateNode({ title: e.target.value || 'Untitled' })
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    aria-label="Node description"
                    value={node.data.description}
                    maxLength={2000}
                    rows={3}
                    onChange={(e) =>
                      updateNode({ description: e.target.value })
                    }
                  />
                </label>
                <div className="field-row">
                  <label>
                    Type
                    <select
                      value={node.data.kind}
                      onChange={(e) =>
                        updateNode({
                          kind: e.target.value as Idea['data']['kind'],
                        })
                      }
                    >
                      {nodeKinds.map((k) => (
                        <option key={k} value={k}>
                          {kindLabels[k]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Decision
                    <select
                      value={node.data.status}
                      onChange={(e) =>
                        updateNode({
                          status: e.target.value as Idea['data']['status'],
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Notes
                  <textarea
                    aria-label="Node notes"
                    placeholder="Constraints, decisions, open questions…"
                    rows={5}
                    value={node.data.notes}
                    maxLength={12000}
                    onChange={(e) => updateNode({ notes: e.target.value })}
                  />
                </label>
                <div className="field-label">
                  Linked requirements{' '}
                  <span>{node.data.requirements.length}</span>
                </div>
                <div className="linked-list">
                  {node.data.requirements.map((id) => (
                    <div className="linked-requirement" key={id}>
                      <button onClick={() => openRequirement(id)}>
                        <span>{id}</span>
                        {requirements.find((r) => r.id === id)?.title}
                        <ArrowUpRight size={14} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Unlink ${id}`}
                        onClick={() =>
                          updateNode({
                            requirements: node.data.requirements.filter(
                              (r) => r !== id,
                            ),
                          })
                        }
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  aria-label="Link a requirement"
                  value=""
                  onChange={(e) => {
                    if (e.target.value)
                      updateNode({
                        requirements: [
                          ...node.data.requirements,
                          e.target.value,
                        ],
                      })
                  }}
                >
                  <option value="">+ Link a requirement</option>
                  {requirements
                    .filter((r) => !node.data.requirements.includes(r.id))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id} · {r.title}
                      </option>
                    ))}
                </select>
                <div className="inspector-actions">
                  <button
                    className="button"
                    onClick={() => {
                      const id = crypto.randomUUID()
                      update({
                        ...board,
                        nodes: [
                          ...board.nodes,
                          {
                            ...structuredClone(node),
                            id,
                            position: {
                              x: node.position.x + 40,
                              y: node.position.y + 190,
                            },
                            data: {
                              ...node.data,
                              title: `${node.data.title.slice(0, 110)} copy`,
                            },
                          },
                        ],
                      })
                      setSelected(id)
                    }}
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label="Delete node"
                    onClick={removeNode}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : edge ? (
              <div className="inspector-body">
                <div className="detail-kind">
                  <Link2 size={16} /> Relationship
                </div>
                <h2>
                  {board.nodes.find((n) => n.id === edge.source)?.data.title}
                </h2>
                <p className="muted">
                  connects to{' '}
                  {board.nodes.find((n) => n.id === edge.target)?.data.title}
                </p>
                <label>
                  Connection label
                  <input
                    aria-label="Connection label"
                    ref={editField}
                    value={edge.label || ''}
                    maxLength={120}
                    onChange={(e) =>
                      update({
                        ...board,
                        edges: board.edges.map((x) =>
                          x.id === edge.id
                            ? { ...x, label: e.target.value }
                            : x,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  className="button danger"
                  onClick={() => {
                    update({
                      ...board,
                      edges: board.edges.filter((e) => e.id !== edge.id),
                    })
                    setSelectedEdge(null)
                  }}
                >
                  <Unplug size={15} />
                  Remove connection
                </button>
              </div>
            ) : (
              <div className="inspector-body overview-body">
                <div className="overview-art">
                  <LayersIllustration />
                </div>
                <h2>
                  Give your ideas
                  <br />a place to connect.
                </h2>
                <p>
                  Map the system, explore a flow, or leave a question for later.
                  This is your space to figure things out.
                </p>
                <label>
                  About this board
                  <textarea
                    value={board.description}
                    maxLength={1000}
                    onChange={(e) =>
                      update({ ...board, description: e.target.value })
                    }
                    rows={3}
                  />
                </label>
                <div className="board-facts">
                  <div>
                    <span>Ideas mapped</span>
                    <strong>{board.nodes.length}</strong>
                  </div>
                  <div>
                    <span>Decisions made</span>
                    <strong>
                      {
                        board.nodes.filter((n) => n.data.status === 'Decided')
                          .length
                      }
                    </strong>
                  </div>
                  <div>
                    <span>Open questions</span>
                    <strong>
                      {
                        board.nodes.filter((n) => n.data.status === 'Question')
                          .length
                      }
                    </strong>
                  </div>
                </div>
                <div className="inspector-hint">
                  <MousePointer2 size={16} />
                  <p>
                    Select a node to edit its details and link it to your
                    requirements.
                  </p>
                </div>
              </div>
            )}
          </ResizableInspector>
        )}
      </div>
    </div>
  )
}
function LayersIllustration() {
  return (
    <svg
      width="160"
      height="100"
      viewBox="0 0 160 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M27 49L77 75L132 45M27 64L77 90L132 60"
        stroke="#c8b6d0"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M27 32L78 7L132 32L78 59L27 32Z"
        fill="#f0e6ee"
        stroke="#b78ca5"
        strokeWidth="1.5"
      />
      <path
        d="M53 32L78 20L104 32L78 45L53 32Z"
        fill="#b34568"
        fillOpacity=".15"
      />
      <circle cx="78" cy="32" r="5" fill="#b34568" />
      <circle cx="27" cy="64" r="3" fill="#b78ca5" />
      <circle cx="132" cy="60" r="3" fill="#b78ca5" />
    </svg>
  )
}
