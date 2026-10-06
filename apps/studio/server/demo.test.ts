import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoTransport } from '../src/app/utils/createDemoTransport.ts'
import { createDemoWorkspace } from '../src/app/utils/createDemoWorkspace.ts'
import { createDemoPeers } from '../src/app/utils/createDemoPeers.ts'
import { sampleDemoCursor } from '../src/app/utils/sampleDemoCursor.ts'
import { sampleDemoCurve } from '../src/app/utils/sampleDemoCurve.ts'
import { advanceDemoActions } from '../src/app/utils/advanceDemoActions.ts'
import { applyDemoActionPresence } from '../src/app/utils/applyDemoActionPresence.ts'
import { createDemoStream } from '../src/app/utils/createDemoStream.ts'
import { createDemoState } from '../src/app/utils/createDemoState.ts'
import { apiTransport } from '../src/shared/api/apiTransport.ts'
import { request } from '../src/shared/api/request.ts'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { workspaceSchema, type Envelope, type Workspace } from '@pomegranate/domain/workspace'
import { demoStorageKey } from '../src/app/config/demoStorageKey.ts'

test('simulated edits preview drags then persist attributed revisions without replaying after refresh', () => {
  const values=new Map<string,string>()
  const storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value)}}
  const state=createDemoState(storage)
  const started=Date.parse(state.studio.createdAt)
  const initial=structuredClone(state.envelope.workspace)
  for(const action of state.actions) {
    const during=started+action.at+action.duration/2
    advanceDemoActions(state,storage,during)
    assert.equal(state.activeAction?.id,action.id)
    const peer=applyDemoActionPresence(createDemoPeers(state,during),state,during).find(peer=>peer.clientId===action.peerId)!
    assert.equal(peer.view,action.view)
    if(action.drag) {
      assert.equal(peer.dragging?.[0].id,action.targetId)
      assert.notDeepEqual(peer.dragging?.[0].position,action.drag.from)
      assert.notDeepEqual(peer.dragging?.[0].position,action.drag.to)
    }
    const revision=state.envelope.revision
    advanceDemoActions(state,storage,started+action.at+action.duration)
    assert.equal(state.envelope.revision,revision+1)
    assert.equal(state.activeAction,null)
    assert.equal(state.activity[0].userId,action.peerId)
    workspaceSchema.parse(state.envelope.workspace)
  }
  assert.notDeepEqual(state.envelope.workspace,initial)
  assert.equal(state.history.length,7)
  const restored=createDemoState(storage)
  assert.equal(restored.completedActions.length,6)
  advanceDemoActions(restored,storage,Date.parse(restored.studio.createdAt)+60000)
  assert.deepEqual(restored.envelope,state.envelope)
})

test('demo stream publishes simulated revisions through the normal workspace event', async () => {
  const state=createDemoState({getItem:()=>null})
  const abort=new AbortController()
  const reader=createDemoStream(state,abort.signal).body!.getReader()
  try {
    await reader.read()
    advanceDemoActions(state,{setItem:()=>{}},Date.parse(state.studio.createdAt)+state.actions[0].at+state.actions[0].duration)
    let received=''
    for(let i=0;i<8 && !received.includes('event: workspace');i++) received+=new TextDecoder().decode((await reader.read()).value)
    assert.match(received,/event: workspace/)
    assert.match(received,/"revision":2/)
  } finally { abort.abort(); await reader.cancel() }
})

test('demo teammates stay on independent tasks regardless of visitor navigation or selections', () => {
  const state = createDemoState({getItem:()=>null})
  const time = Date.parse(state.studio.createdAt)+1000
  const before = createDemoPeers(state,time)
  state.presence = {view:'design',boardId:'system',selected:['panel'],requirement:{id:'R05',field:'title',typing:true}}
  assert.deepEqual(createDemoPeers(state,time),before)
  assert.deepEqual(before.map(peer=>peer.view),['canvas','wireframes','requirements','notes'])
  assert.equal(before[2].requirement?.id,'R13')
  assert.deepEqual(before[3].selected,['note:recipe-decisions'])
  state.envelope.workspace.boards = state.envelope.workspace.boards.filter(board=>board.id!=='layers')
  assert.ok(createDemoPeers(state,time).slice(0,2).every(peer=>peer.cursor===null && peer.boardId===null))
})

test('demo gestures pause to read, move continuously, and arrive without an orbit or wrap jump', () => {
  const targets=[{id:'a',x:0,y:0,pause:2000},{id:'b',x:300,y:180,pause:3000}]
  assert.deepEqual(sampleDemoCursor(targets,500),sampleDemoCursor(targets,1500))
  let previous=sampleDemoCursor(targets,0).cursor!
  let moved=0
  for(let time=40;time<18000;time+=40) {
    const current=sampleDemoCursor(targets,time).cursor!
    const distance=Math.hypot(current.x-previous.x,current.y-previous.y)
    assert.ok(distance<60,`unexpected jump at ${time}: ${distance}`)
    if(distance>0) moved++
    previous=current
  }
  assert.ok(moved>0)
  assert.deepEqual(sampleDemoCursor([],100),{cursor:null,camera:null,selected:[]})
})

test('demo Bézier gestures curve in either axis and settle exactly at their endpoints', () => {
  for (const end of [{x:400,y:0},{x:0,y:400},{x:300,y:200}]) {
    const start={x:0,y:0}
    assert.deepEqual(sampleDemoCurve(start,end,0),start)
    assert.deepEqual(sampleDemoCurve(start,end,1),end)
    const middle=sampleDemoCurve(start,end,0.5)
    assert.ok(Math.abs(middle.x*end.y-middle.y*end.x)>1000,'path must bend away from the straight line')
    const early=sampleDemoCurve(start,end,0.001)
    assert.ok(Math.hypot(early.x,early.y)<0.001,'depart with near-zero velocity')
  }
  const target={id:'only',x:20,y:30,pause:2000,camera:{x:50,y:80,zoom:0.8}}
  assert.deepEqual(sampleDemoCursor([target],0),sampleDemoCursor([target],99999))
})

test('demo cameras pan and zoom continuously, rest between gestures, and stay independent', () => {
  const state=createDemoState({getItem:()=>null})
  const start=Date.parse(state.studio.createdAt)
  const initial=createDemoPeers(state,start).slice(0,2)
  assert.deepEqual(createDemoPeers(state,start+500)[0].camera,initial[0].camera)
  let previous=initial
  const moved=[false,false], zoomed=[false,false]
  for(let elapsed=40;elapsed<70000;elapsed+=40) {
    const peers=createDemoPeers(state,start+elapsed).slice(0,2)
    peers.forEach((peer,index)=>{
      const camera=peer.camera!, last=previous[index].camera!
      const distance=Math.hypot(camera.x-last.x,camera.y-last.y)
      assert.ok(distance<100,`camera jumped at ${elapsed}`)
      assert.ok(Math.abs(camera.zoom-last.zoom)<0.035,'zoom must change gradually')
      assert.ok(camera.zoom>=0.7 && camera.zoom<=1.05)
      moved[index] ||= distance>0.1
      zoomed[index] ||= Math.abs(camera.zoom-last.zoom)>0.001
    })
    previous=peers
  }
  assert.deepEqual(moved,[false,true])
  assert.deepEqual(zoomed,[false,true])
})

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
