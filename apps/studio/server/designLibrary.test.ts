import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  makeDesignElement,
  designPageSchema,
  duplicateDesignElements,
} from '@pomegranate/domain/design'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import {
  createDesignComponent,
  createExampleDesignLibrary,
  designLibrarySchema,
  instantiateDesignComponent,
  syncDesignInstances,
  markDesignOverrides,
  resolveDesignBindings,
  stepDesignMachine,
} from '@pomegranate/domain/designLibrary'

test('library validates typed variables, references, and legacy designs', () => {
  const library = createExampleDesignLibrary('test')
  assert.ok(designLibrarySchema.safeParse(library).success)
  assert.equal(createSeed().design.library, undefined)
  const invalid = structuredClone(library)
  invalid.variables['test-busy'].values.Light = 'true'
  assert.equal(designLibrarySchema.safeParse(invalid).success, false)
  const dangling = structuredClone(library)
  dangling.machines['test-deploy'].transitions.start.to = 'missing'
  assert.equal(designLibrarySchema.safeParse(dangling).success, false)
  const nested = structuredClone(library)
  nested.components['test-button'].variants.idle.nodes =
    instantiateDesignComponent(
      library.components['test-button'],
      'idle',
      'instance',
      { x: 0, y: 0 },
    )
  assert.equal(designLibrarySchema.safeParse(nested).success, false)
})

test('components preserve nested masks and produce independent valid instances', () => {
  const nodes = [
    makeDesignElement('group', 'g', { x: 100, y: 200, maskId: 'mask' }),
    makeDesignElement('ellipse', 'mask', {
      parentId: 'g',
      width: 90,
      height: 90,
    }),
    makeDesignElement('text', 'text', {
      parentId: 'g',
      x: 20,
      y: 30,
      text: 'Hello',
    }),
  ]
  const component = createDesignComponent(nodes, ['g'], 'component', 'Card')
  const instance = instantiateDesignComponent(
    component,
    'default',
    'instance',
    { x: 800, y: 400 },
  )
  assert.ok(
    designPageSchema.safeParse({ id: 'p', name: 'Page', nodes: instance })
      .success,
  )
  const group = instance.find((n) => n.instance?.sourceId === 'g')!
  assert.equal(instance.find((n) => n.id === group.maskId)?.parentId, group.id)
  let id = 0
  const duplicate = duplicateDesignElements(
    instance,
    [instance[0].id],
    () => `copy-${id++}`,
  )
  assert.equal(duplicate.length, instance.length)
  assert.notEqual(
    duplicate[0].instance?.instanceId,
    instance[0].instance?.instanceId,
  )
  assert.ok(
    designPageSchema.safeParse({
      id: 'p',
      name: 'Page',
      nodes: [...instance, ...duplicate],
    }).success,
  )
})

test('master updates preserve overrides, reset them, switch variants and detach safely', () => {
  const library = createExampleDesignLibrary('test')
  const asset = library.components['test-button']
  const nodes = instantiateDesignComponent(asset, 'idle', 'instance', {
    x: 800,
    y: 400,
  })
  const edited = markDesignOverrides(
    nodes,
    nodes.map((n) => ({ ...n, text: 'Override' })),
  )
  asset.variants.idle.nodes[0].radius = 12
  asset.variants.idle.nodes[0].text = 'Master'
  const synced = syncDesignInstances(edited, library)
  assert.equal(synced[0].text, 'Override')
  assert.equal(synced[0].radius, 12)
  assert.equal(synced[0].x, 800)
  synced[0].instance!.overrides = ['x', 'y', 'order', 'parentId']
  assert.equal(syncDesignInstances(synced, library)[0].text, 'Master')
  synced[0].instance!.variantId = 'success'
  assert.equal(syncDesignInstances(synced, library)[0].text, 'Deployed')
  delete library.components['test-button']
  assert.equal(syncDesignInstances(synced, library)[0].instance, undefined)
})

test('adding successive master children never reuses live instance IDs', () => {
  const component = createDesignComponent(
    [makeDesignElement('text', 'a')],
    ['a'],
    'component',
    'Card',
  )
  const library = {
    ...createExampleDesignLibrary('test'),
    components: { component },
  }
  let nodes = instantiateDesignComponent(component, 'default', 'instance', {
    x: 0,
    y: 0,
  })
  component.variants.default.nodes.push(
    makeDesignElement('text', 'b', { parentId: 'component:root' }),
  )
  nodes = syncDesignInstances(nodes, library)
  component.variants.default.nodes.unshift(
    makeDesignElement('text', 'c', { parentId: 'component:root' }),
  )
  nodes = syncDesignInstances(nodes, library)
  assert.equal(new Set(nodes.map((n) => n.id)).size, nodes.length)
  assert.ok(
    designPageSchema.safeParse({ id: 'p', name: 'Page', nodes }).success,
  )
})

test('bindings resolve modes and bounds without modifying saved layers', () => {
  const library = createExampleDesignLibrary('test')
  const nodes = library.components['test-button'].variants.idle.nodes
  const before = structuredClone(nodes)
  assert.equal(
    resolveDesignBindings(nodes, library, { 'test-theme': 'Dark' })[0].fill,
    '#d05d85',
  )
  assert.equal(
    resolveDesignBindings(
      nodes,
      library,
      {},
      { 'test-accent': 'not a color' },
    )[0].fill,
    nodes[0].fill,
  )
  assert.deepEqual(nodes, before)
})

test('simulation evaluates guards, entry actions and transitions locally', () => {
  const library = createExampleDesignLibrary('test')
  const before = structuredClone(library)
  const initial = stepDesignMachine(library, 'test-deploy')
  assert.equal(initial.stateId, 'idle')
  assert.equal(initial.values['test-busy'], false)
  const blocked = stepDesignMachine(
    library,
    'test-deploy',
    { ...initial, values: { ...initial.values, 'test-busy': true } },
    'DEPLOY',
  )
  assert.equal(blocked.stateId, 'idle')
  const loading = stepDesignMachine(library, 'test-deploy', initial, 'DEPLOY')
  assert.equal(loading.stateId, 'loading')
  assert.equal(loading.values['test-busy'], true)
  const success = stepDesignMachine(library, 'test-deploy', loading, 'READY')
  assert.equal(success.stateId, 'success')
  assert.equal(success.values['test-busy'], false)
  assert.equal(
    stepDesignMachine(library, 'test-deploy', success).stateId,
    'idle',
  )
  assert.deepEqual(library, before)
  assert.equal(initial.values['test-busy'], false)
})

test('ID-addressed library changes roundtrip, merge and update saved instances atomically', () => {
  const workspace = createSeed()
  const library = createExampleDesignLibrary('test')
  workspace.design.library = library
  workspace.design.pages = [
    {
      id: 'page',
      name: 'Page',
      nodes: instantiateDesignComponent(
        library.components['test-button'],
        'idle',
        'instance',
        { x: 50, y: 60 },
      ),
    },
  ]
  assert.deepEqual(applyOperations(workspace, []).design, workspace.design)
  const next = structuredClone(workspace)
  next.design.library!.components['test-button'].variants.idle.nodes[0].radius =
    16
  const ops = diffWorkspace(workspace, next)
  assert.ok(
    ops.some(
      (op) =>
        op.path.join('/') ===
        'design/library/components/test-button/variants/idle/nodes/test-button-root/radius',
    ),
  )
  const concurrently = structuredClone(workspace)
  concurrently.design.library!.variables['test-accent'].values.Dark = '#ffffff'
  const merged = applyOperations(concurrently, ops)
  assert.equal(merged.design.pages![0].nodes[0].radius, 16)
  assert.equal(
    merged.design.library!.variables['test-accent'].values.Dark,
    '#ffffff',
  )
  assert.equal(merged.design.pages![0].nodes[0].x, 50)
})
