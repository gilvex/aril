import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from './app.ts'

test('logout revokes browser credentials, clears its cookie, and keeps accounts and other sessions', async () => {
 const directory = mkdtempSync(join(tmpdir(), 'pomegranate-logout-'))
 const {app,store,collaboration} = createApp(join(directory,'test.sqlite'))
 const server = app.listen(0,'127.0.0.1')
 await new Promise<void>(resolve=>server.once('listening',resolve))
 const url = `http://127.0.0.1:${(server.address() as {port:number}).port}`
 try {
  const owner=store.identity.bootstrap()!
  store.identity.linkGoogle(owner.profile.id,'fixture-google-subject','fixture@example.test')
  const cookieSession=store.identity.signInGoogle('fixture-google-subject')!
  const otherDevice=store.identity.signInGoogle('fixture-google-subject')!
  const headers={Authorization:`Bearer ${owner.token}`,Cookie:`pomegranate_session=${cookieSession.token}`}
  const rejected=await fetch(url+'/api/auth/logout',{method:'POST',headers})
  assert.equal(rejected.status,400)
  assert.ok(store.identity.authenticate(owner.token))
  const crossOrigin=await fetch(url+'/api/auth/logout',{method:'POST',headers:{...headers,'x-pomegranate-auth':'1',Origin:'https://attacker.example'}})
  assert.equal(crossOrigin.status,403)
  const response=await fetch(url+'/api/auth/logout',{method:'POST',headers:{...headers,'x-pomegranate-auth':'1'}})
  assert.equal(response.status,204)
  assert.match(response.headers.get('set-cookie') || '',/pomegranate_session=;.*Expires=Thu, 01 Jan 1970/)
  assert.equal(store.identity.authenticate(owner.token),undefined)
  assert.equal(store.identity.authenticate(cookieSession.token),undefined)
  assert.ok(store.identity.authenticate(otherDevice.token))
  assert.ok(store.member(owner.profile.id,'default'))
  assert.equal(store.identity.account(owner.profile.id)?.email,'fixture@example.test')
  assert.equal((await fetch(url+'/api/session',{headers})).status,401)
  assert.equal((await fetch(url+'/api/auth/logout',{method:'POST',headers:{...headers,'x-pomegranate-auth':'1'}})).status,204)
  assert.ok(store.identity.signInGoogle('fixture-google-subject'))
  const cookieOnly=await fetch(url+'/api/auth/logout',{method:'POST',headers:{Cookie:`pomegranate_session=${otherDevice.token}`,'x-pomegranate-auth':'1'}})
  assert.equal(cookieOnly.status,204)
  assert.equal(store.identity.authenticate(otherDevice.token),undefined)
 } finally {
  collaboration.close()
  await new Promise<void>(resolve=>server.close(()=>resolve()))
  store.close()
  rmSync(directory,{recursive:true,force:true})
 }
})

