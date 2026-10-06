import { demoTopics } from '../src/app/config/demoTopics.ts'
import { demoNodeBounds } from '../src/app/utils/demoNodeBounds.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoState } from '../src/app/utils/createDemoState.ts'
import { advanceDemoPlanner } from '../src/app/utils/advanceDemoPlanner.ts'
import { sampleDemoPlannerPresence } from '../src/app/utils/sampleDemoPlannerPresence.ts'
import { isDemoPlacementClear } from '../src/app/utils/isDemoPlacementClear.ts'
import { commitDemoChange } from '../src/app/utils/commitDemoChange.ts'
import { workspaceSchema } from '@pomegranate/domain/workspace'

test('adaptive demo evolves with varied actions and collision-free drags at bounded speed', () => {
  const state = createDemoState({ getItem: () => null })
  state.planner.seed = 8675309
  const start = Date.parse(state.studio.createdAt)
  const originals = structuredClone(state.envelope.workspace.boards[0].nodes)
  let previous = sampleDemoPlannerPresence(state, start)
  let revision = 1
  const intents: string[] = []
  const moved = new Set<string>()
  const maxY =
    Math.max(
      ...originals.map((node) => node.position.y + demoNodeBounds(node).height),
    ) + 156
  let activeIdea: string | null = null
  for (let time = 0; time < 600000; time += 100) {
    const planned = state.planner.action
    const intent = planned?.intent
    advanceDemoPlanner(state, { setItem: () => {} }, start + time)
    const pose = sampleDemoPlannerPresence(state, start + time)
    assert.ok(
      Math.hypot(
        pose.cursor!.x - previous.cursor!.x,
        pose.cursor!.y - previous.cursor!.y,
      ) < 60,
      `cursor jump at ${time}`,
    )
    assert.ok(
      Math.hypot(
        pose.camera!.x - previous.camera!.x,
        pose.camera!.y - previous.camera!.y,
      ) < 60,
      `camera jump at ${time}`,
    )
    const board = state.envelope.workspace.boards[0]
    for (const drag of pose.dragging) {
      const node = board.nodes.find((node) => node.id === drag.id)!
      assert.ok(
        isDemoPlacementClear(board.nodes, node, drag.position),
        `drag crossed another node at ${time}`,
      )
      assert.ok(Math.abs(pose.cursor!.x - drag.position.x - 70) < 0.001)
      assert.ok(Math.abs(pose.cursor!.y - drag.position.y - 25) < 0.001)
    }
    if (state.envelope.revision !== revision) {
      intents.push(intent!)
      if (intent === 'create') {
        assert.equal(
          activeIdea,
          null,
          'finish the previous idea before adding another',
        )
        activeIdea = planned!.targetId
      }
      if (intent === 'refine') activeIdea = null
      if (intent === 'move') {
        assert.ok(
          !moved.has(planned!.targetId),
          'never shuffle an idea repeatedly',
        )
        moved.add(planned!.targetId)
        assert.ok(
          Math.hypot(
            planned!.drag!.to.x - planned!.drag!.from.x,
            planned!.drag!.to.y - planned!.drag!.from.y,
          ) <= 140,
        )
      }
      for (const node of Object.values(state.planner.owned)) {
        assert.ok(
          node.position.x >= 0 &&
            node.position.x <= 1016 &&
            node.position.y <= maxY,
          'working area cannot drift',
        )
        const topic = demoTopics.find(
          (topic) => topic.title === node.data.title,
        )!
        assert.deepEqual(node.data.requirements, [topic.requirement])
        const incoming = board.edges.filter((edge) => edge.target === node.id)
        assert.ok(
          incoming.every((edge) => edge.source === topic.anchor),
          'connect to the relevant concept, not a random neighbor',
        )
      }
      for (const node of Object.values(state.planner.owned))
        assert.ok(
          isDemoPlacementClear(board.nodes, node, node.position),
          `overlap after ${intent}`,
        )
      assert.ok(board.nodes.length <= originals.length + 3)
      revision = state.envelope.revision
    }
    previous = pose
  }
  assert.ok(intents.length > 25)
  assert.deepEqual([...new Set(intents)].sort(), [
    'connect',
    'create',
    'move',
    'refine',
    'remove',
  ])
  assert.ok(
    intents.every(
      (intent, index) => index === 0 || intent !== intents[index - 1],
    ),
    'avoid repeating the previous action',
  )
  assert.notDeepEqual(
    intents.slice(0, 6),
    intents.slice(6, 12),
    'no fixed six-step cycle',
  )
  for (const node of originals)
    assert.deepEqual(
      state.envelope.workspace.boards[0].nodes.find(
        (item) => item.id === node.id,
      ),
      node,
    )
  workspaceSchema.parse(state.envelope.workspace)
  assert.ok(state.history.length <= 30)
})

test('visitor edits and connections protect individual planner nodes across refresh', () => {
  for (const mode of ['rename', 'connect']) {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }
    const state = createDemoState(storage)
    state.planner.seed = 42
    const start = Date.parse(state.studio.createdAt)
    for (
      let time = 0;
      time < 30000 && state.envelope.revision === 1;
      time += 100
    )
      advanceDemoPlanner(state, storage, start + time)
    const id = Object.keys(state.planner.owned)[0]
    assert.ok(id)
    const edited = structuredClone(state.envelope.workspace)
    if (mode === 'rename')
      edited.boards[0].nodes.find((node) => node.id === id)!.data.title =
        'Keep my idea'
    else
      edited.boards[0].edges.push({
        id: 'visitor-link',
        source: 'game',
        target: id,
        type: 'smoothstep',
      })
    commitDemoChange(state, storage, edited, state.profile, 'Visitor edit')
    const restored = createDemoState(storage)
    assert.ok(restored.planner.protectedIds.includes(id))
    assert.equal(restored.planner.owned[id], undefined)
    const restart = Date.parse(restored.studio.createdAt)
    for (let time = 0; time < 90000; time += 200)
      advanceDemoPlanner(restored, storage, restart + time)
    assert.deepEqual(
      restored.envelope.workspace.boards[0].nodes.find(
        (node) => node.id === id,
      ),
      edited.boards[0].nodes.find((node) => node.id === id),
    )
    if (mode === 'connect')
      assert.ok(
        restored.envelope.workspace.boards[0].edges.some(
          (edge) => edge.id === 'visitor-link',
        ),
      )
  }
})

test('planner cancels occupied destinations, active visitor selections, suspension and failed saves', () => {
  for (const situation of ['occupied', 'selected', 'suspended', 'storage']) {
    const state = createDemoState({ getItem: () => null })
    state.planner.seed = 123
    const start = Date.parse(state.studio.createdAt)
    const storage = {
      setItem: () => {
        if (situation === 'storage') throw new Error('Quota')
      },
    }
    advanceDemoPlanner(state, storage, start + 3500)
    const action = state.planner.action!
    assert.equal(action.intent, 'create')
    if (situation === 'occupied') {
      const node = structuredClone(state.envelope.workspace.boards[0].nodes[0])
      node.id = 'visitor-node'
      node.position = action.focus!
      state.envelope.workspace.boards[0].nodes.push(node)
    }
    if (situation === 'selected')
      state.presence = {
        view: 'canvas',
        boardId: 'layers',
        selected: [action.targetId],
      }
    const before = structuredClone(state.envelope)
    if (situation === 'suspended')
      advanceDemoPlanner(state, storage, start + 30000)
    else
      for (let time = 3600; time < 3500 + action.duration + 100; time += 100)
        advanceDemoPlanner(state, storage, start + time)
    assert.deepEqual(state.envelope, before, situation)
    assert.equal(Object.keys(state.planner.owned).length, 0)
  }
})
