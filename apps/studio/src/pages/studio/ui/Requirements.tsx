import { useEffect, useRef, useState } from 'react'
import {
  Search,
  Plus,
  Check,
  ArrowUpRight,
  X,
  Trash2,
  ListFilter,
} from 'lucide-react'
import type { Requirement, Workspace } from '../../../shared/api/workspace'
import type { Presence, Profile, RequirementField, RequirementPresence } from '@pomegranate/domain/collaboration'
import { RequirementPeople, requirementFieldLabels, type RequirementViewer } from './RequirementPresence'
export function Requirements({
  workspace,
  change,
  selected,
  onSelect,
  openBoard,
  profile,
  peers,
  sendPresence,
}: {
  workspace: Workspace
  change: (fn: (w: Workspace) => Workspace) => void
  selected: string | null
  onSelect: (id: string | null) => void
  openBoard: (id: string) => void
  profile: Profile
  peers: Presence[]
  sendPresence: (changes: { requirement: RequirementPresence | null }, force?: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All areas')
  const current = workspace.requirements.find((r) => r.id === selected)
  const [activity, setActivity] = useState<RequirementPresence | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const selectRequirement = (id: string | null) => {
    clearTimeout(typingTimer.current)
    setActivity(null)
    onSelect(id)
  }
  const currentId = current?.id || null
  const field = activity?.id === currentId ? activity.field : null
  const typing = activity?.id === currentId && activity.typing
  useEffect(() => {
    sendPresence({ requirement: currentId ? { id: currentId, field, typing } : null }, true)
  }, [currentId, field, typing, sendPresence])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        clearTimeout(typingTimer.current)
        setActivity(null)
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      clearTimeout(typingTimer.current)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [])
  const peopleFor = (id: string): RequirementViewer[] => {
    const people: RequirementViewer[] = peers
      .filter((peer) => peer.view === 'requirements' && peer.requirement?.id === id)
      .sort((a, b) => a.seenAt - b.seenAt)
      .map((peer) => ({ profile: peer.profile, requirement: peer.requirement! }))
    if (currentId === id) people.push({ profile, requirement: { id, field, typing } })
    return [...new Map(people.map((person) => [person.profile.id, person])).values()]
  }
  const fieldPeople = (name: RequirementField) => currentId
    ? peopleFor(currentId).filter((person) => person.profile.id !== profile.id && person.requirement.field === name)
    : []
  const fieldProps = (name: RequirementField) => {
    const editors = fieldPeople(name)
    return {
      onFocus: () => {
        clearTimeout(typingTimer.current)
        if (currentId) setActivity({ id: currentId, field: name, typing: false })
      },
      onBlur: () => {
        clearTimeout(typingTimer.current)
        setActivity(null)
      },
      onInput: () => {
        if (!currentId || !['title', 'description', 'acceptance'].includes(name)) return
        setActivity({ id: currentId, field: name, typing: true })
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setActivity((value) => value ? { ...value, typing: false } : null), 1500)
      },
      style: editors.length ? { outline: `2px solid ${editors[0].profile.color}99`, outlineOffset: 2 } : undefined,
    }
  }
  const fieldHint = (name: RequirementField) => {
    const editors = fieldPeople(name)
    return editors.length ? (
      <span className="requirement-field-presence">
        {editors.map((person) => person.profile.name).join(', ')} · {editors.some((person) => person.requirement.typing) ? 'typing in' : 'editing'} {requirementFieldLabels[name]}
      </span>
    ) : null
  }
  const results = workspace.requirements.filter(
    (r) =>
      (category === 'All areas' || r.category === category) &&
      `${r.id} ${r.title} ${r.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const update = (patch: Partial<Requirement>) => {
    const choice = (['priority', 'status', 'category'] as const).find((name) => name in patch)
    if (choice && currentId) {
      clearTimeout(typingTimer.current)
      setActivity({ id: currentId, field: choice, typing: false })
    }
    change((w) => ({
      ...w,
      requirements: w.requirements.map((r) =>
        r.id === selected ? { ...r, ...patch } : r,
      ),
    }))
  }
  const add = () => {
    const id = `R-${crypto.randomUUID().slice(0, 6)}`
    change((w) => ({
      ...w,
      requirements: [
        ...w.requirements,
        {
          id,
          title: 'New requirement',
          description: '',
          acceptance: '',
          category: 'Experience',
          priority: 'Should have',
          status: 'Captured',
        },
      ],
    }))
    selectRequirement(id)
  }
  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">The product brief</div>
          <h1>A better way to deploy.</h1>
          <p>Real pain points, turned into a plan you can build.</p>
        </div>
        <button className="button primary" onClick={add}>
          <Plus size={16} />
          Add requirement
        </button>
      </div>
      <div className="requirements-summary">
        <div>
          <strong>{workspace.requirements.length}</strong>
          <span>requirements captured</span>
        </div>
        <div>
          <strong>
            {
              workspace.requirements.filter((r) => r.priority === 'Must have')
                .length
            }
          </strong>
          <span>must-haves</span>
        </div>
        <div>
          <strong>
            {workspace.requirements.filter((r) => r.status === 'Ready').length}
          </strong>
          <span>ready for implementation</span>
        </div>
        <p>
          Start with the problems.
          <br />
          Connect them to the solution.
        </p>
      </div>
      <div className="requirements-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            placeholder="Find a requirement…"
            aria-label="Search requirements"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="filter-field">
          <ListFilter size={15} />
          <select
            aria-label="Filter requirements by area"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              'All areas',
              'Deployment',
              'Access',
              'Operations',
              'Experience',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <span className="muted">{results.length} results</span>
      </div>
      <div className="requirements-layout">
        <div className="requirements-list">
          <div className="requirement-table-head">
            <span>Requirement</span>
            <span>Priority</span>
            <span>Status</span>
          </div>
          {results.map((r) => (
            <button
              key={r.id}
              className={`requirement-row ${r.id === selected ? 'active' : ''}`}
              aria-label={`${r.id} ${r.title}`}
              aria-pressed={r.id === selected}
              onClick={() => selectRequirement(r.id)}
            >
              <span className="requirement-main">
                <span className="requirement-id">{r.id}</span>
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.category}</small>
                </span>
              </span>
              <span
                className={`priority ${r.priority === 'Must have' ? 'must' : ''}`}
              >
                <span />
                {r.priority}
              </span>
              <span className={`requirement-status ${r.status.toLowerCase()}`}>
                {r.status === 'Ready' ? (
                  <Check size={13} />
                ) : (
                  <span className="small-dot" />
                )}
                {r.status}
              </span>
              <RequirementPeople people={peopleFor(r.id)} currentUserId={profile.id} />
            </button>
          ))}
          {!results.length && (
            <div className="empty-message">
              <Search size={28} />
              <h3>No matching requirements</h3>
              <p>Try another search or add a new requirement.</p>
            </div>
          )}
        </div>
        {current && (
          <aside className="requirement-detail">
            <div className="inspector-heading">
              <span>{current.id}</span>
              <button
                className="icon-button"
                aria-label="Close requirement"
                onClick={() => selectRequirement(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="inspector-body">
              <RequirementPeople people={peopleFor(current.id)} currentUserId={profile.id} />
              <label>
                Requirement
                <input
                  aria-label="Requirement title"
                  {...fieldProps('title')}
                  value={current.title}
                  maxLength={160}
                  onChange={(e) =>
                    update({ title: e.target.value || 'Untitled requirement' })
                  }
                />
                {fieldHint('title')}
              </label>
              <label>
                The problem
                <textarea
                  aria-label="Requirement description"
                  {...fieldProps('description')}
                  rows={5}
                  maxLength={5000}
                  value={current.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
                {fieldHint('description')}
              </label>
              <div className="field-row">
                <label>
                  Priority
                  <select
                    {...fieldProps('priority')}
                    aria-label="Requirement priority"
                    value={current.priority}
                    onChange={(e) =>
                      update({
                        priority: e.target.value as Requirement['priority'],
                      })
                    }
                  >
                    {['Must have', 'Should have', 'Later'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  {fieldHint('priority')}
                </label>
                <label>
                  Status
                  <select
                    aria-label="Requirement status"
                    {...fieldProps('status')}
                    value={current.status}
                    onChange={(e) =>
                      update({
                        status: e.target.value as Requirement['status'],
                      })
                    }
                  >
                    {['Captured', 'Designing', 'Ready'].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  {fieldHint('status')}
                </label>
              </div>
              <label>
                Area
                <select
                  {...fieldProps('category')}
                  aria-label="Requirement area"
                  value={current.category}
                  onChange={(e) =>
                    update({
                      category: e.target.value as Requirement['category'],
                    })
                  }
                >
                  {['Deployment', 'Access', 'Operations', 'Experience'].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
                {fieldHint('category')}
              </label>
              <label>
                What does success look like?
                <textarea
                  aria-label="Acceptance criteria"
                  {...fieldProps('acceptance')}
                  rows={5}
                  maxLength={5000}
                  value={current.acceptance}
                  onChange={(e) => update({ acceptance: e.target.value })}
                />
                {fieldHint('acceptance')}
              </label>
              <div className="field-label">Connected boards</div>
              {workspace.boards
                .filter((b) =>
                  b.nodes.some((n) => n.data.requirements.includes(current.id)),
                )
                .map((b) => (
                  <button
                    className="board-link"
                    key={b.id}
                    onClick={() => openBoard(b.id)}
                  >
                    {b.name}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              <button
                className="button danger"
                onClick={() => {
                  change((w) => ({
                    ...w,
                    requirements: w.requirements.filter(
                      (r) => r.id !== current.id,
                    ),
                    boards: w.boards.map((b) => ({
                      ...b,
                      nodes: b.nodes.map((n) => ({
                        ...n,
                        data: {
                          ...n.data,
                          requirements: n.data.requirements.filter(
                            (id) => id !== current.id,
                          ),
                        },
                      })),
                    })),
                  }))
                  selectRequirement(null)
                }}
              >
                <Trash2 size={14} />
                Delete requirement
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
