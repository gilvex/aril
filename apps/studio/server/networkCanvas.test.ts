import { makeDesignElement } from '@aril/domain/design'
import { createExampleDesignLibrary } from '@aril/domain/designLibrary'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createSeed } from '@aril/domain/seed'
import { networkNodeKinds, workspaceSchema } from '@aril/domain/workspace'
import { makeWireNode } from '@aril/domain/wireframe'
import {
  applyOperations,
  diffWorkspace,
  documentOf,
} from '@aril/domain/collaboration'
import { openStore } from './store.ts'
import { updateNote } from '../src/widgets/notes/utils/updateNote.ts'
import { noteDocuments } from '../src/widgets/notes/utils/noteDocuments.ts'

test('empty editable titles and every network kind round-trip through operations, persistence and reload', () => {
  const dir = mkdtempSync(join(tmpdir(), 'aril-network-'))
  const file = join(dir, 'fixture.sqlite')
  let store = openStore(file)
  try {
    const before = createSeed()
    const next = structuredClone(before)
    const legacyNodes = networkNodeKinds.map((kind, index) => ({
      id: kind,
      type: 'idea',
      position: { x: index * 300, y: 100 },
      data: {
        title: '',
        kind,
        description: '',
        notes: '',
        status: 'Exploring',
        requirements: [],
        network: {
          address: '192.0.2.10/24',
          hostname: 'fixture.example.test',
          mac: '02:00:00:00:00:01',
          vlan: '10',
          model: 'Demo',
          location: 'Lab',
        },
      },
    }))
    next.boards[0].edges = [
      {
        id: 'link',
        source: 'router',
        target: 'switch',
        type: 'smoothstep',
        label: 'Ethernet · port 1',
      },
    ]
    const screen = makeWireNode('screen', 'fixture-screen', { x: 0, y: 0 })
    screen.data.title = ''
    next.boards[0].wireframe = { nodes: [screen], edges: [] }
    next.requirements[0].title = ''
    next.notesTitle = ''
    next.documents = [{ id: 'fixture-note', title: '', body: 'Keep this body' }]
    next.design.pages = [
      {
        id: 'empty-design',
        name: '',
        nodes: [makeDesignElement('text', 'empty-name', { name: '' })],
      },
    ]
    const library = createExampleDesignLibrary('empty')
    for (const component of Object.values(library.components)) {
      component.name = ''
      for (const variant of Object.values(component.variants)) variant.name = ''
    }
    for (const item of Object.values(library.variables)) item.name = ''
    for (const item of Object.values(library.collections)) item.name = ''
    for (const machine of Object.values(library.machines)) {
      machine.name = ''
      for (const state of Object.values(machine.states)) state.name = ''
    }
    next.design.library = library
    const parsed = workspaceSchema.parse({
      ...next,
      boards: next.boards.map((board, index) =>
        index === 0 ? { ...board, nodes: legacyNodes } : board,
      ),
    })
    assert.deepEqual(
      documentOf(applyOperations(before, diffWorkspace(before, parsed))),
      documentOf(parsed),
    )
    assert.equal(noteDocuments(parsed, 'Default')[0].title, '')
    assert.equal(
      updateNote(parsed, 'project-notes', { title: '' }).notesTitle,
      '',
    )
    assert.equal(
      updateNote(parsed, 'fixture-note', { title: '' }).documents?.[0].title,
      '',
    )
    const owner = store.identity.bootstrap()!
    const current = store.read()
    assert.ok(
      store.save(
        parsed,
        current.revision,
        undefined,
        'default',
        owner.profile.id,
      ),
    )
    store.close()
    store = openStore(file)
    assert.deepEqual(store.read().workspace, parsed)
    const invalid = structuredClone(parsed)
    invalid.boards[0].nodes[0].data.title = 'x'.repeat(121)
    assert.equal(workspaceSchema.safeParse(invalid).success, false)
    invalid.boards[0].nodes[0].data.title = ''
    invalid.boards[0].nodes[0].data.network!.address = 'x'.repeat(256)
    assert.equal(workspaceSchema.safeParse(invalid).success, false)
  } finally {
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
