import { ThemePicker } from '../../../shared/ui/ThemePicker'
import { useCanvasFullscreen } from '../model/use-canvas-fullscreen'
import { CanvasNavigation } from './CanvasNavigation'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Workflow,
  ListChecks,
  Palette,
  NotebookPen,
  ChevronDown,
  ArrowUpRight,
  Undo2,
  Redo2,
  Download,
  Upload,
  History,
  Check,
  LoaderCircle,
  AlertCircle,
  X,
  Menu,
  Activity as ActivityIcon,
  FileJson,
  RotateCcw,
  MoreHorizontal,
  Minimize2,
} from 'lucide-react'
import {
  downloadJson,
  request,
  workspaceHeaders,
  workspaceSchema,
  type Workspace,
  type Envelope,
} from '../../../shared/api/workspace'
import { useWorkspace, type Recovery } from '../model/use-workspace'
import { useMultiplayer } from '../model/use-multiplayer'
import { Avatar, CollaborationBar, PresenceAvatars } from './CollaborationBar'
import type { Profile } from '../../../../domain/collaboration'
import type { StudioSummary } from '../../../../domain/studios'
import { useCompactLayout } from '../../../shared/lib/use-compact-layout'
import {
  readStudioRoute,
  saveStudioRoute,
} from '../../../shared/lib/browser-route'
const CanvasBoard = lazy(() =>
  import('./CanvasBoard').then((module) => ({ default: module.CanvasBoard })),
)
const WireframeBoard = lazy(() =>
  import('./WireframeBoard').then((module) => ({
    default: module.WireframeBoard,
  })),
)
import { Requirements } from './Requirements'
import { DesignBoard } from './DesignBoard'

type View = 'canvas' | 'requirements' | 'design' | 'notes'
const navigation = [
  { id: 'canvas' as const, name: 'Canvas', icon: Workflow },
  { id: 'requirements' as const, name: 'Requirements', icon: ListChecks },
  { id: 'design' as const, name: 'Design direction', icon: Palette },
  { id: 'notes' as const, name: 'Project notes', icon: NotebookPen },
]
export function Studio({
  initial,
  recovery,
  initialProfile,
  studio,
  onWorkspaces,
}: {
  initial: Envelope
  recovery?: Recovery
  initialProfile: Profile
  studio: StudioSummary
  onWorkspaces: (profile: Profile) => void
}) {
  const full = useCanvasFullscreen()
  const state = useWorkspace(initial, studio.id, initialProfile.id, recovery)
  const multiplayer = useMultiplayer(initialProfile, state.receive, studio.id)
  const { workspace, change } = state
  const [initialRoute] = useState(() => readStudioRoute(location.search))
  const [view, setView] = useState<View>(initialRoute.view)
  const [canvasMode, setCanvasMode] = useState<'canvas' | 'wireframes'>(
    initialRoute.canvasMode,
  )
  const BoardCanvas = canvasMode === 'wireframes' ? WireframeBoard : CanvasBoard
  const [boardId, setBoardId] = useState(
    initialRoute.boardId || workspace.boards[0].id,
  )
  const [requirementId, setRequirementId] = useState<string | null>(() =>
    workspace.requirements.some(
      (item) => item.id === initialRoute.requirementId,
    )
      ? initialRoute.requirementId!
      : null,
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const compact = useCompactLayout()
  const [collaborationPanel, setCollaborationPanel] = useState<
    'profile' | 'people' | 'activity' | null
  >(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const actionsMenu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!actionsMenu.current?.contains(event.target as Node))
        actionsMenu.current?.removeAttribute('open')
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && actionsMenu.current?.open) {
        actionsMenu.current.removeAttribute('open')
        actionsMenu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  const mobileMenuToggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!compact || !sidebarOpen) return
    const panel = sidebarRef.current
    const fields = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]') ||
          [],
      ).filter((element) => element.getClientRects().length)
    fields()[0]?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = fields()
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault()
        items.at(-1)?.focus()
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault()
        items[0]?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      mobileMenuToggle.current?.focus()
    }
  }, [compact, sidebarOpen])
  const [notice, setNotice] = useState(
    recovery ? 'Recovered unsaved edits from this tab.' : '',
  )
  const [modal, setModal] = useState<
    'new' | 'history' | 'delete' | 'import' | 'export' | 'reload' | null
  >(null)
  const [boardName, setBoardName] = useState('')
  const [pendingImport, setPendingImport] = useState<Workspace | null>(null)
  const [snapshots, setSnapshots] = useState<
    { revision: number; savedAt: string }[]
  >([])
  const [historyLoading, setHistoryLoading] = useState(false)
  useEffect(() => {
    if (!modal) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const selector =
      'button:not(:disabled),input:not(:disabled),select,textarea,a[href]'
    const fields = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selector) || [])
    const autofocus = dialog?.querySelector<HTMLElement>('[autofocus],input')
    ;(autofocus || fields()[0])?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const list = fields()
      const first = list[0]
      const last = list[list.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      previous?.focus()
    }
  }, [modal])
  const importRef = useRef<HTMLInputElement>(null)
  const board =
    workspace.boards.find((b) => b.id === boardId) || workspace.boards[0]
  const routedRequirementId = workspace.requirements.find(
    (item) => item.id === requirementId,
  )?.id
  useEffect(() => {
    saveStudioRoute({
      workspaceId: studio.id,
      boardId: board.id,
      view,
      canvasMode,
      requirementId: routedRequirementId,
    })
  }, [studio.id, board.id, view, canvasMode, routedRequirementId])
  const { sendPresence } = multiplayer
  const [followId, setFollowId] = useState<string | null>(null)
  const followedPeer = multiplayer.connected
    ? multiplayer.peers.find((p) => p.clientId === followId)
    : undefined
  const followed = followedPeer && !followedPeer.following ? followedPeer : null
  useEffect(() => {
    sendPresence({ following: followed?.clientId || null, cursor: null }, true)
  }, [followed?.clientId, sendPresence])
  useEffect(() => {
    if (!followId) return
    if (!followed) {
      setFollowId(null)
      setNotice(
        'Follow ended: that session disconnected or started following someone else.',
      )
      return
    }
    if (followed.view === 'canvas' || followed.view === 'wireframes') {
      if (!workspace.boards.some((b) => b.id === followed.boardId)) return
      setView('canvas')
      setCanvasMode(followed.view)
      setBoardId(followed.boardId!)
    } else if (['requirements', 'design', 'notes'].includes(followed.view)) {
      setView(followed.view as View)
      if (followed.view === 'requirements')
        setRequirementId(followed.requirement?.id || null)
    }
  }, [followId, followed, workspace.boards])
  useEffect(() => {
    if (!followId) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFollowId(null)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [followId])
  const followStatus = followed && (
    <div
      className="follow-status"
      data-follow-controls
      role="status"
      style={{ borderColor: followed.profile.color }}
    >
      <Avatar profile={followed.profile} />
      <span>
        Following <strong>{followed.profile.name}</strong>
      </span>
      <button onClick={() => setFollowId(null)}>Stop following</button>
    </div>
  )
  const present = [
    ...(multiplayer.connected
      ? [
          {
            profile: multiplayer.profile,
            view: view === 'canvas' ? canvasMode : view,
            boardId: view === 'canvas' ? board.id : null,
          },
        ]
      : []),
    ...multiplayer.peers,
  ]
  useEffect(() => {
    sendPresence(
      {
        view: view === 'canvas' ? canvasMode : view,
        boardId: view === 'canvas' ? board.id : null,
        cursor: null,
        selected: [],
        selectedEdges: [],
        camera: null,
        dragging: [],
        ...(view !== 'requirements' ? { requirement: null } : {}),
      },
      true,
    )
  }, [view, canvasMode, board.id, sendPresence])
  const navigateBoard = (id: string) => {
    setBoardId(id)
    setView('canvas')
    setSidebarOpen(false)
  }
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal(null)
        setSidebarOpen(false)
      }
      const target = e.target as HTMLElement
      if (target.closest('input,textarea,select,[contenteditable]')) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) state.redo()
        else state.undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void state.flush()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [state.undo, state.redo, state.flush])
  const exportWorkspace = () => setModal('export')
  const downloadWorkspace = () =>
    downloadJson(
      workspace,
      `pomegranate-workspace-${new Date().toISOString().slice(0, 10)}.json`,
    )
  const loadHistory = async () => {
    setModal('history')
    setHistoryLoading(true)
    try {
      await state.flush()
      setSnapshots(
        await request('/api/history', { headers: workspaceHeaders(studio.id) }),
      )
    } catch (err) {
      setNotice(String(err))
    } finally {
      setHistoryLoading(false)
    }
  }
  return (
    <div
      ref={full.element}
      className={`studio-shell canvas-first top-navigation${full.fullscreen ? ' studio-fullscreen' : ''}${followed ? ' is-following' : ''}`}
      onPointerDownCapture={(event) => {
        if (
          followId &&
          !(event.target as Element).closest('[data-follow-controls]')
        )
          setFollowId(null)
      }}
      onKeyDownCapture={(event) => {
        if (
          followId &&
          !['Tab', 'Shift', 'Control', 'Meta', 'Alt'].includes(event.key)
        )
          setFollowId(null)
      }}
      onWheelCapture={() => {
        if (followId) setFollowId(null)
      }}
    >
      {compact && sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {compact && (
        <aside
          ref={sidebarRef}
          role={sidebarOpen ? 'dialog' : undefined}
          aria-modal={sidebarOpen ? true : undefined}
          aria-label="Workspace menu"
          id="studio-navigation"
          className={`sidebar workspace-more-sheet ${sidebarOpen ? 'open' : ''}`}
        >
          <div className="mobile-sheet-heading">
            <strong>Workspace</strong>
            <button
              className="icon-button"
              aria-label="Close workspace menu"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <button
            className="workspace-switch"
            aria-label="Switch workspace"
            onClick={async () => {
              if (await state.flush()) onWorkspaces(multiplayer.profile)
              else
                setNotice(
                  'Finish saving or resolve your unsaved edits before switching workspaces.',
                )
            }}
          >
            <span className="workspace-letter">
              {studio.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              {studio.name}
              <small>Switch workspace</small>
            </span>
            <ChevronDown size={14} />
          </button>
          <ThemePicker />
          <div className="mobile-workspace-tools">
            <button
              onClick={() => {
                setSidebarOpen(false)
                setCollaborationPanel('activity')
              }}
            >
              <ActivityIcon size={18} />
              Team activity
            </button>
            <span>Tools</span>
            <button disabled={!state.canUndo} onClick={state.undo}>
              <Undo2 size={18} />
              Undo
            </button>
            <button disabled={!state.canRedo} onClick={state.redo}>
              <Redo2 size={18} />
              Redo
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false)
                void loadHistory()
              }}
            >
              <History size={18} />
              Revision history
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false)
                importRef.current?.click()
              }}
            >
              <Upload size={18} />
              Import workspace
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false)
                exportWorkspace()
              }}
            >
              <Download size={18} />
              Export workspace
            </button>
          </div>
        </aside>
      )}
      <main className="main-area" inert={compact && sidebarOpen}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="app-workspace-picker"
              title="Switch workspace"
              onClick={async () => {
                if (await state.flush()) onWorkspaces(multiplayer.profile)
                else
                  setNotice(
                    'Finish saving or resolve your unsaved edits before switching workspaces.',
                  )
              }}
            >
              <img src="/mark.svg" alt="" />
              <span>{studio.name}</span>
              <ChevronDown size={14} />
            </button>
          </div>
          {!compact && (
            <div className="header-navigation">
              <nav className="desktop-page-nav" aria-label="Main navigation">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    aria-label={item.name}
                    aria-current={view === item.id ? 'page' : undefined}
                    onClick={() => {
                      setView(item.id)
                      if (item.id === 'requirements') setRequirementId(null)
                    }}
                  >
                    <span>
                      {item.id === 'design'
                        ? 'Design'
                        : item.id === 'notes'
                          ? 'Notes'
                          : item.name}
                    </span>
                    <PresenceAvatars
                      limit={1}
                      profiles={present
                        .filter(
                          (person) =>
                            person.view === item.id ||
                            (item.id === 'canvas' &&
                              person.view === 'wireframes'),
                        )
                        .map((person) => person.profile)}
                    />
                  </button>
                ))}
              </nav>
              <details ref={actionsMenu} className="workspace-actions-menu">
                <summary
                  aria-label="Workspace actions"
                  title="Workspace actions"
                >
                  <MoreHorizontal size={19} />
                </summary>
                <div
                  className="workspace-actions-popover"
                  onClick={(e) => {
                    const menu = e.currentTarget.closest('details')
                    menu?.removeAttribute('open')
                    menu?.querySelector('summary')?.focus()
                  }}
                >
                  <span className="overflow-group-label">Workspace</span>
                  <button
                    onClick={() => {
                      actionsMenu.current?.querySelector('summary')?.focus()
                      setCollaborationPanel('activity')
                    }}
                  >
                    <ActivityIcon size={16} />
                    Team activity
                  </button>
                  <ThemePicker />
                  <span className="overflow-group-label">Tools</span>
                  <button onClick={() => void loadHistory()}>
                    <History size={16} />
                    Revision history
                  </button>
                  <button onClick={() => importRef.current?.click()}>
                    <Upload size={16} />
                    Import workspace
                  </button>
                  <button onClick={exportWorkspace}>
                    <Download size={16} />
                    Export workspace
                  </button>
                </div>
              </details>
            </div>
          )}
          <div className="topbar-actions">
            {full.fullscreen && view !== 'canvas' && (
              <button
                ref={full.button}
                className="icon-button"
                aria-label="Exit fullscreen"
                title="Exit fullscreen (Esc)"
                onClick={() => void full.toggle()}
              >
                <Minimize2 size={18} />
              </button>
            )}
            <button
              className={`save-indicator ${state.saveState}`}
              onClick={() => void state.flush()}
              title={state.error || 'Changes save automatically'}
            >
              {state.saveState === 'saved' ? (
                <Check size={14} />
              ) : state.saveState === 'error' ? (
                <AlertCircle size={14} />
              ) : (
                <LoaderCircle className="spinning" size={14} />
              )}
              <span>
                {state.saveState === 'saved'
                  ? 'All changes saved'
                  : state.saveState === 'error'
                    ? 'Not saved · retry'
                    : 'Saving changes'}
              </span>
            </button>
            <span className="toolbar-divider" />
            <button
              className="icon-button"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={!state.canUndo}
              onClick={state.undo}
            >
              <Undo2 size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              disabled={!state.canRedo}
              onClick={state.redo}
            >
              <Redo2 size={17} />
            </button>
            <CollaborationBar
              panel={collaborationPanel}
              setPanel={setCollaborationPanel}
              workspaceId={studio.id}
              profile={multiplayer.profile}
              peers={multiplayer.peers}
              activity={multiplayer.activity}
              connected={multiplayer.connected}
              onProfile={multiplayer.setProfile}
              followId={followId}
              onFollow={setFollowId}
            />
          </div>
        </header>
        {view !== 'canvas' && followStatus}
        <input
          className="visually-hidden"
          ref={importRef}
          type="file"
          accept=".json,application/json"
          aria-label="Import workspace file"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            if (file.size > 5 * 1024 * 1024) {
              setNotice('That file is too large. Use a workspace under 5 MB.')
              return
            }
            try {
              const parsed = workspaceSchema.parse(
                JSON.parse(await file.text()),
              )
              setPendingImport(parsed)
              setModal('import')
            } catch {
              setNotice(
                'That file is not a valid Pomegranate workspace. Your existing work is unchanged.',
              )
            }
          }}
        />
        {state.error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{state.error}</span>
            <button onClick={exportWorkspace}>Export my edits</button>
            <button onClick={() => setModal('reload')}>
              Reload saved version
            </button>
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setNotice('')}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {view === 'canvas' && (
          <>
            <Suspense
              fallback={
                <div className="empty-message">Opening your canvas…</div>
              }
            >
              <BoardCanvas
                full={full}
                key={board.id + ':' + canvasMode}
                following={
                  followed?.boardId === board.id &&
                  followed?.view === canvasMode
                    ? followed
                    : null
                }
                navigation={
                  <>
                    {followStatus}
                    <CanvasNavigation
                      board={board}
                      boards={workspace.boards}
                      mode={canvasMode}
                      onBoard={setBoardId}
                      onMode={setCanvasMode}
                      present={present}
                      onNew={() => {
                        setBoardName('')
                        setModal('new')
                      }}
                      onDelete={() => setModal('delete')}
                      onRename={(name) =>
                        change((w) => ({
                          ...w,
                          boards: w.boards.map((b) =>
                            b.id === board.id ? { ...b, name } : b,
                          ),
                        }))
                      }
                    />
                  </>
                }
                board={board}
                requirements={workspace.requirements}
                peers={multiplayer.peers.filter(
                  (peer) =>
                    peer.view === canvasMode && peer.boardId === board.id,
                )}
                sendPresence={sendPresence}
                saveState={state.saveState}
                profile={multiplayer.profile}
                update={(next, record) =>
                  change(
                    (w) => ({
                      ...w,
                      boards: w.boards.map((b) =>
                        b.id === next.id ? next : b,
                      ),
                    }),
                    record,
                  )
                }
                checkpoint={state.checkpoint}
                openRequirement={(id) => {
                  setRequirementId(id)
                  setView('requirements')
                }}
              />
            </Suspense>
          </>
        )}
        {view === 'requirements' && (
          <Requirements
            workspace={workspace}
            change={change}
            selected={requirementId}
            onSelect={setRequirementId}
            openBoard={navigateBoard}
            profile={multiplayer.profile}
            peers={multiplayer.peers}
            sendPresence={sendPresence}
          />
        )}
        {view === 'design' && (
          <DesignBoard
            design={workspace.design}
            update={(design) => change((w) => ({ ...w, design }))}
          />
        )}
        {view === 'notes' && (
          <div className="content-page notes-page">
            <div className="page-heading">
              <div>
                <div className="eyebrow">Keep the thinking together</div>
                <h1>The idea behind Pomegranate.</h1>
                <p>
                  Decisions, questions, and all the things that don’t fit in a
                  box.
                </p>
              </div>
              <NotebookPen size={30} strokeWidth={1.3} />
            </div>
            <div className="notes-layout">
              <textarea
                className="notes-editor"
                aria-label="Project notes"
                value={workspace.notes}
                maxLength={50000}
                onChange={(e) =>
                  change((w) => ({ ...w, notes: e.target.value }))
                }
                spellCheck={false}
              />
              <aside className="notes-aside">
                <h3>A living brief</h3>
                <p>
                  Use this space for your product goals, open questions, and
                  decisions. Plain text and Markdown are welcome.
                </p>
                <div className="note-divider" />
                <h3>Our starting point</h3>
                <p>
                  Self-hosted, open-source deployment. A managed SaaS option.
                  Reusable layers and operations that feel comfortable.
                </p>
                <a
                  href="https://pterodactyl.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pterodactyl reference
                  <ArrowUpRight size={14} />
                </a>
                <a
                  href="https://www.youtube.com/@juxtopposed/videos"
                  target="_blank"
                  rel="noreferrer"
                >
                  Design inspiration
                  <ArrowUpRight size={14} />
                </a>
                <div className="note-divider" />
                <small>
                  {workspace.notes.length.toLocaleString()} / 50,000 characters
                </small>
              </aside>
            </div>
          </div>
        )}
        <footer className="statusbar">
          <span>
            <span className="small-dot" />
            Planning, not production
          </span>
          <span>
            {workspace.boards.length} boards
            <span className="status-separator">·</span>
            {workspace.requirements.length} requirements
            <span className="status-separator">·</span>Revision {state.revision}
          </span>
        </footer>
        <nav className="mobile-bottom-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              aria-label={item.name}
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => {
                setView(item.id)
                setSidebarOpen(false)
              }}
            >
              <item.icon size={21} />
              <span>
                {item.id === 'requirements'
                  ? 'Brief'
                  : item.id === 'design'
                    ? 'Design'
                    : item.id === 'notes'
                      ? 'Notes'
                      : 'Canvas'}
              </span>
              <PresenceAvatars
                profiles={present
                  .filter(
                    (person) =>
                      person.view === item.id ||
                      (item.id === 'canvas' && person.view === 'wireframes'),
                  )
                  .map((person) => person.profile)}
              />
            </button>
          ))}
          <button
            ref={mobileMenuToggle}
            aria-label="Open workspace menu"
            aria-expanded={sidebarOpen}
            aria-controls="studio-navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
            <span>More</span>
          </button>
        </nav>
      </main>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null)
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="icon-button modal-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={18} />
            </button>
            {modal === 'reload' && (
              <>
                <h2 id="modal-title">Reload the saved workspace?</h2>
                <p>
                  This discards this tab’s unsaved edits and opens the latest
                  server version. Export your edits first if you want to keep
                  them.
                </p>
                <div className="modal-actions">
                  <button className="button" onClick={() => setModal(null)}>
                    Keep editing
                  </button>
                  <button className="button" onClick={exportWorkspace}>
                    Export my edits
                  </button>
                  <button
                    className="button destructive"
                    onClick={async () => {
                      await state.reloadSaved()
                      setModal(null)
                    }}
                  >
                    Discard edits and reload
                  </button>
                </div>
              </>
            )}
            {modal === 'export' && (
              <>
                <div className="modal-symbol">
                  <FileJson size={25} />
                </div>
                <h2 id="modal-title">Take your ideas with you.</h2>
                <p>
                  Download your workspace as JSON, or copy it if your browser
                  does not support downloads.
                </p>
                <textarea
                  className="export-json"
                  aria-label="Workspace JSON"
                  readOnly
                  value={JSON.stringify(workspace, null, 2)}
                  onFocus={(e) => e.target.select()}
                />
                <div className="modal-actions">
                  <button
                    className="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          JSON.stringify(workspace, null, 2),
                        )
                        setNotice('Workspace JSON copied.')
                        setModal(null)
                      } catch {
                        setNotice(
                          'Select the workspace JSON and copy it with Ctrl/Cmd+C.',
                        )
                      }
                    }}
                  >
                    Copy JSON
                  </button>
                  <button
                    className="button primary"
                    onClick={downloadWorkspace}
                  >
                    <Download size={15} />
                    Download JSON
                  </button>
                </div>
              </>
            )}
            {modal === 'new' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const id = crypto.randomUUID()
                  state.checkpoint()
                  change(
                    (w) => ({
                      ...w,
                      boards: [
                        ...w.boards,
                        {
                          id,
                          name: boardName.trim(),
                          description: 'A new space to connect your ideas.',
                          nodes: [],
                          edges: [],
                        },
                      ],
                    }),
                    false,
                  )
                  setBoardId(id)
                  setView('canvas')
                  setModal(null)
                }}
              >
                <div className="modal-symbol">
                  <Workflow size={25} />
                </div>
                <h2 id="modal-title">Room for another idea.</h2>
                <p>
                  Create a board for a user flow, a system, or something you
                  haven’t quite figured out yet.
                </p>
                <label>
                  Board name
                  <input
                    autoFocus
                    placeholder="e.g. Team onboarding"
                    required
                    maxLength={100}
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                  />
                </label>
                <div className="modal-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="button primary"
                    disabled={
                      !boardName.trim() || workspace.boards.length >= 50
                    }
                  >
                    Create board
                  </button>
                </div>
              </form>
            )}
            {modal === 'delete' && (
              <>
                <h2 id="modal-title">Delete “{board.name}”?</h2>
                <p>
                  Its nodes and connections will be removed. You can undo this
                  or restore a saved revision.
                </p>
                <div className="modal-actions">
                  <button className="button" onClick={() => setModal(null)}>
                    Keep board
                  </button>
                  <button
                    className="button destructive"
                    onClick={() => {
                      state.checkpoint()
                      change(
                        (w) => ({
                          ...w,
                          boards: w.boards.filter((b) => b.id !== board.id),
                        }),
                        false,
                      )
                      setModal(null)
                    }}
                  >
                    Delete board
                  </button>
                </div>
              </>
            )}
            {modal === 'import' && pendingImport && (
              <>
                <div className="modal-symbol">
                  <FileJson size={25} />
                </div>
                <h2 id="modal-title">Import this workspace?</h2>
                <p>
                  This replaces your current boards, requirements, notes, and
                  design direction with {pendingImport.boards.length} boards and{' '}
                  {pendingImport.requirements.length} requirements. Export first
                  if you want a separate backup.
                </p>
                <div className="modal-actions">
                  <button className="button" onClick={exportWorkspace}>
                    Export current
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      state.checkpoint()
                      change(() => pendingImport, false)
                      setBoardId(pendingImport.boards[0].id)
                      setModal(null)
                      setView('canvas')
                      setNotice('Workspace imported. You can undo this change.')
                    }}
                  >
                    Import workspace
                  </button>
                </div>
              </>
            )}
            {modal === 'history' && (
              <>
                <div className="modal-symbol">
                  <History size={25} />
                </div>
                <h2 id="modal-title">Your ideas have a history.</h2>
                <p>
                  Up to 30 previous saves are kept locally. Restoring a revision
                  replaces the entire workspace and can be undone.
                </p>
                <div className="snapshot-list">
                  {historyLoading ? (
                    <p>Loading saved revisions…</p>
                  ) : !snapshots.length ? (
                    <p>
                      No previous saves yet. Make your first change to begin.
                    </p>
                  ) : (
                    snapshots.map((s) => (
                      <div key={s.revision}>
                        <span>
                          <strong>Revision {s.revision}</strong>
                          <small>{new Date(s.savedAt).toLocaleString()}</small>
                        </span>
                        <button
                          className="button"
                          aria-label={`Restore revision ${s.revision}`}
                          onClick={async () => {
                            try {
                              const snapshot = workspaceSchema.parse(
                                await request(`/api/history/${s.revision}`, {
                                  headers: workspaceHeaders(studio.id),
                                }),
                              )
                              state.checkpoint()
                              change(() => snapshot, false)
                              setModal(null)
                              setNotice(
                                `Restored revision ${s.revision}. Your previous work is available with Undo.`,
                              )
                            } catch (e) {
                              setNotice(String(e))
                            }
                          }}
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
