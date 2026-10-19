import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { blankStudio } from '@aril/domain/studios'
import {
  workspaceSchema,
  canvasClipboardSchema,
  nodeKinds,
} from '@aril/domain/workspace'
import { openStore } from './store.ts'

test('legacy equipment becomes universal blocks once, preserving data, links and explicit icons across storage and clipboard', () => {
  const icons = {
    device: 'device',
    server: 'server',
    router: 'router',
    switch: 'switch',
    firewall: 'firewall',
    accessPoint: 'wifi',
    network: 'network',
    internet: 'internet',
  }
  const legacy = blankStudio('Legacy')
  const nodes = Object.keys(icons).map((kind, index) => ({
    id: 'legacy-' + kind,
    type: 'idea',
    position: { x: index * 100, y: 100 },
    data: {
      kind,
      title: 'Original ' + kind,
      description: 'Line one\nLine two',
      notes: 'Original notes',
      status: 'Decided',
      requirements: [],
      network: { address: '192.0.2.1', vlan: '10' },
    },
  }))
  const edges = [
    {
      id: 'legacy-link',
      type: 'smoothstep',
      source: 'legacy-router',
      target: 'legacy-server',
      label: 'Ethernet',
    },
  ]
  const raw = { ...legacy, boards: [{ ...legacy.boards[0], nodes, edges }] }
  const normalized = workspaceSchema.parse(raw)
  for (const [index, node] of normalized.boards[0].nodes.entries()) {
    assert.equal(node.data.kind, 'block')
    assert.equal(node.data.icon, Object.values(icons)[index])
    assert.equal(node.id, nodes[index].id)
    assert.deepEqual(node.position, nodes[index].position)
    assert.equal(node.data.title, nodes[index].data.title)
    assert.equal(node.data.description, nodes[index].data.description)
    assert.equal(node.data.notes, nodes[index].data.notes)
    assert.deepEqual(node.data.network, nodes[index].data.network)
  }
  assert.deepEqual(normalized.boards[0].edges, edges)
  assert.deepEqual(workspaceSchema.parse(normalized), normalized)
  const custom = structuredClone(raw)
  Object.assign(custom.boards[0].nodes[1].data, { icon: 'cloud' })
  assert.equal(
    workspaceSchema.parse(custom).boards[0].nodes[1].data.icon,
    'cloud',
  )
  assert.equal(
    canvasClipboardSchema.parse({
      format: 'aril-canvas',
      version: 1,
      nodes,
      edges,
    }).nodes[1].data.kind,
    'block',
  )
  assert.equal(
    nodeKinds.some((kind) => String(kind) === 'server'),
    false,
  )
  const dir = mkdtempSync(join(tmpdir(), 'aril-legacy-blocks-'))
  const file = join(dir, 'fixture.sqlite')
  let store = openStore(file)
  try {
    const owner = store.identity.bootstrap()!
    const db = new DatabaseSync(file)
    db.prepare('UPDATE documents SET body=? WHERE workspace_id=?').run(
      JSON.stringify(raw),
      'default',
    )
    const loaded = store.read()
    assert.equal(loaded.workspace.boards[0].nodes[1].data.kind, 'block')
    assert.equal(
      JSON.parse(
        String(
          db
            .prepare('SELECT body FROM documents WHERE workspace_id=?')
            .get('default')!.body,
        ),
      ).boards[0].nodes[1].data.kind,
      'server',
    )
    assert.equal(store.read().revision, loaded.revision)
    assert.ok(
      store.save(
        loaded.workspace,
        loaded.revision,
        undefined,
        'default',
        owner.profile.id,
      ),
    )
    assert.equal(
      JSON.parse(
        String(
          db
            .prepare('SELECT body FROM documents WHERE workspace_id=?')
            .get('default')!.body,
        ),
      ).boards[0].nodes[1].data.kind,
      'block',
    )
    assert.equal(
      store.snapshot(loaded.revision)?.boards[0].nodes[1].data.icon,
      'server',
    )
    db.close()
    store.close()
    store = openStore(file)
    assert.deepEqual(store.read().workspace, normalized)
  } finally {
    store.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
