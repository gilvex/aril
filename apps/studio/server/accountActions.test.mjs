import assert from 'node:assert/strict'
import {test} from 'node:test'
import {endSession} from '../src/features/accountActions/model/iterators/endSession.ts'
import {accountActionsSlice} from '../src/features/accountActions/model/slices/accountActionsSlice.ts'
import {logoutSession} from '../src/features/accountActions/model/requests/logoutSession.ts'

test('logout waits for a successful save and warns before leaving an unlinked profile',()=>{
 const guard=async()=>false
 const blocked=endSession(guard,accountActionsSlice.actions.requested({mode:'logout'}))
 blocked.next(); blocked.next()
 assert.equal(blocked.next({google:{email:'test@example.test'}}).value.payload.fn,guard)
 assert.equal(blocked.next(false).value.payload.action.type,accountActionsSlice.actions.failed.type)
 assert.equal(blocked.next().done,true)
 const guest=endSession(guard,accountActionsSlice.actions.requested({mode:'switch'}))
 guest.next();guest.next()
 assert.deepEqual(guest.next({google:null}).value.payload.action,accountActionsSlice.actions.confirm('switch'))
 assert.equal(guest.next().done,true)
 const confirmed=endSession(guard,accountActionsSlice.actions.requested({mode:'switch',confirmed:true}))
 confirmed.next()
 assert.equal(confirmed.next().value.payload.fn,guard)
 assert.equal(confirmed.next(true).value.payload.fn,logoutSession)
})
