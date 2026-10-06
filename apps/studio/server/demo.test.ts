import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoTransport } from '../src/app/utils/createDemoTransport.ts'
import { createDemoWorkspace } from '../src/app/utils/createDemoWorkspace.ts'
import { createDemoPeers } from '../src/app/utils/createDemoPeers.ts'
import { createDemoState } from '../src/app/utils/createDemoState.ts'
import { apiTransport } from '../src/shared/api/apiTransport.ts'
import { request } from '../src/shared/api/request.ts'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { workspaceSchema, type Envelope, type Workspace } from '@pomegranate/domain/workspace'
import { demoStorageKey } from '../src/app/config/demoStorageKey.ts'

test('demo contains valid editable project data, connected recipe screens and varied requirements', () => {
  const workspace = workspaceSchema.parse(createDemoWorkspace())
  assert.equal(workspace.boards.length, 4)
  assert.equal(workspace.boards[0].wireframe!.nodes.filter(node=>node.data.kind==='screen').length,6)
  assert.equal(workspace.boards[0].wireframe!.edges.length,6)
  assert.equal(new Set(workspace.requirements.map(item=>item.status)).size,3)
  assert.equal(new Set(workspace.requirements.map(item=>item.priority)).size,3)
  assert.equal(workspace.documents!.length,2)
})

test('demo edits persist only to its own storage, reject stale changes, and support history', async () => {
  const values = new Map<string,string>([['real-session','keep-me']])
  const storage = {getItem:(key:string)=>values.get(key) || null,setItem:(key:string,value:string)=>{values.set(key,value)}}
  const demo = createDemoTransport(storage)
  const original = await (await demo('/api/workspace')).json() as Envelope
  const workspace = structuredClone(original.workspace)
  workspace.boards[0].nodes[0].data.title = 'Edited runtime'
  const init = {method:'PATCH',headers:{'x-workspace-id':'demo'},body:JSON.stringify({baseRevision:1,operations:diffWorkspace(original.workspace,workspace)})}
  assert.equal((await demo('/api/workspace',init)).status,200)
  assert.equal((await demo('/api/workspace',init)).status,409)
  assert.equal((await (await createDemoTransport(storage)('/api/workspace')).json() as Envelope).workspace.boards[0].nodes[0].data.title,'Edited runtime')
  assert.equal((await (await demo('/api/history/1')).json() as Workspace).boards[0].nodes[0].data.title,'Runtime image')
  assert.equal((await (await demo('/api/history')).json() as unknown[]).length,2)
  assert.deepEqual([...values.keys()].sort(),[demoStorageKey,'real-session'].sort())
  assert.equal(values.get('real-session'),'keep-me')
  const isolated = createDemoTransport({getItem:()=>null,setItem:()=>{}})
  assert.equal((await (await isolated('/api/workspace')).json() as Envelope).revision,1)
})

test('demo transport never falls through to authenticated HTTP, including unsupported actions', async t => {
  const previous = apiTransport.request
  apiTransport.request = createDemoTransport({getItem:()=>null,setItem:()=>{}})
  t.after(()=>{apiTransport.request=previous})
  t.mock.method(globalThis,'fetch',()=>{throw new Error('Demo must not contact the network')})
  assert.equal((await request<{profile:{id:string}}>('/api/session')).profile.id,'demo-visitor')
  for (const path of ['/api/invites','/api/auth/logout','/api/auth/google','/api/agent-access','/api/studios','https://example.com/api/workspace']) {
    await assert.rejects(request(path,{method:'POST'}))
  }
  await assert.rejects(request('/api/workspace',{headers:{'x-workspace-id':'default'}}))
})

test('demo stream shows identified simulated peers and stops on abort; storage failures preserve last save', async () => {
  const storage = {getItem:()=>null,setItem:()=>{throw new Error('Quota')}}
  const demo = createDemoTransport(storage)
  const state = createDemoState(storage)
  assert.ok(createDemoPeers(state).every(peer=>peer.profile.name.endsWith('· demo')))
  const controller = new AbortController()
  const response = await demo('/api/events',{signal:controller.signal})
  const reader = response.body!.getReader()
  assert.match(new TextDecoder().decode((await reader.read()).value),/event: presence/)
  controller.abort()
  while (!(await reader.read()).done) { /* Drain the initial activity frame. */ }
  const original = await (await demo('/api/workspace')).json() as Envelope
  const changed = structuredClone(original.workspace)
  changed.notes = 'unsaved'
  assert.equal((await demo('/api/workspace',{method:'PATCH',body:JSON.stringify({baseRevision:1,operations:diffWorkspace(original.workspace,changed)})})).status,507)
  assert.equal((await (await demo('/api/workspace')).json() as Envelope).revision,1)
})
