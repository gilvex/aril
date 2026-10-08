import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  workspaceSchema,
  requirementSchema,
} from '@pomegranate/domain/workspace'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import { collectScope } from '../src/widgets/requirements/utils/collectScope.ts'
import { scopeTargets } from '../src/widgets/requirements/utils/scopeTargets.ts'

test('Scope additions round-trip without reinterpreting legacy delivery status', () => {
  const before = createSeed()
  const after = structuredClone(before)
  const item = after.requirements[0]
  item.decision = 'Agreed'
  item.questions = [
    { id: 'question', text: 'What happens on failure?', resolved: false },
  ]
  item.links = [{ kind: 'wireframes', boardId: before.boards[0].id }]
  const saved = workspaceSchema.parse(
    applyOperations(before, diffWorkspace(before, after)),
  )
  assert.deepEqual(saved.requirements[0], item)
  assert.equal(saved.requirements[0].status, before.requirements[0].status)
  assert.equal(
    workspaceSchema.parse(before).requirements[0].decision,
    undefined,
  )
  const remote = structuredClone(before)
  remote.requirements[1].title = 'A remote edit'
  const merged = applyOperations(remote, diffWorkspace(before, after))
  assert.equal(merged.requirements[1].title, 'A remote edit')
  assert.deepEqual(merged.requirements[0].questions, item.questions)
  const undo = applyOperations(merged, diffWorkspace(after, before))
  assert.equal(undo.requirements[0].decision, undefined)
  assert.equal(undo.requirements[1].title, 'A remote edit')
})

test('Scope groups links across boards and keeps unlinked and workspace items reachable', () => {
  const w = createSeed()
  w.boards.forEach((b) =>
    b.nodes.forEach((n) => {
      n.data.requirements = []
    }),
  )
  w.requirements = w.requirements.slice(0, 4)
  const [shared, global, orphan, design] = w.requirements
  shared.links = w.boards
    .slice(0, 2)
    .map((b) => ({ kind: 'canvas' as const, boardId: b.id }))
  shared.decision = 'Agreed'
  shared.questions = [{ id: 'q', text: 'Review?', resolved: false }]
  global.workspaceWide = true
  global.decision = 'Deferred'
  orphan.links = [{ kind: 'design', boardId: 'removed', pageId: 'gone' }]
  w.design.pages = [{ id: 'page', name: 'Desktop', nodes: [] }]
  design.links = [{ kind: 'design', pageId: 'page' }]
  const all = collectScope(w, w.requirements, '', 'all')
  assert.equal(all.counts.all, 4)
  assert.equal(all.counts.unlinked, 1)
  assert.equal(all.counts.decision, 3)
  assert.ok(
    all.groups
      .find((g) => g.id === w.boards[1].id)
      ?.rows.some((r) => r.item.id === shared.id),
  )
  assert.equal(
    collectScope(w, w.requirements, 'workspace', 'all').visibleCount,
    2,
  )
  assert.equal(
    collectScope(w, w.requirements, w.boards[0].id, 'all').visibleCount,
    1,
  )
  assert.deepEqual(
    collectScope(w, w.requirements, '', 'unlinked').groups[0].rows.map(
      (r) => r.item.id,
    ),
    [orphan.id],
  )
  shared.questions[0].resolved = true
  assert.equal(collectScope(w, w.requirements, '', 'decision').visibleCount, 2)
})

test('Scope preserves node associations and only offers available visual destinations', () => {
  const w = createSeed()
  const board = w.boards[0]
  const item = w.requirements[0]
  board.nodes[0].data.requirements = [item.id]
  assert.ok(collectScope(w, [item], board.id, 'all').visibleCount)
  board.sections = ['design']
  board.design = {
    ...w.design,
    pages: [{ id: 'board-page', name: 'Mockup', nodes: [] }],
  }
  const targets = scopeTargets(w).filter((t) => t.boardId === board.id)
  assert.deepEqual(
    targets.map((t) => t.kind),
    ['design'],
  )
  assert.equal(targets[0].pageId, 'board-page')
  assert.equal(
    requirementSchema.safeParse({ ...item, links: [{ kind: 'wireframes' }] })
      .success,
    false,
  )
  assert.equal(
    requirementSchema.safeParse({
      ...item,
      questions: Array.from({ length: 51 }, (_, i) => ({
        id: String(i),
        text: '',
        resolved: false,
      })),
    }).success,
    false,
  )
  assert.equal(
    requirementSchema.safeParse({ ...item, decision: 'Done' }).success,
    false,
  )
})
