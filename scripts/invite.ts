import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { openStore } from '../server/store.ts'
const path = resolve(
  process.env.POMEGRANATE_DATA_DIR || 'data',
  'studio.sqlite',
)
const store = openStore(path)
const db = new DatabaseSync(path)
let user = db.prepare('SELECT id FROM profiles LIMIT 1').get()
if (!user) {
  store.identity.bootstrap()
  user = db.prepare('SELECT id FROM profiles LIMIT 1').get()
}
const invite = store.identity.invite(String(user!.id))
const origin =
  process.env.POMEGRANATE_ORIGIN ||
  `http://127.0.0.1:${process.env.PORT || 5173}`
console.log(
  `Single-use studio invite (expires in 24 hours):\n${origin}/#invite=${invite.token}`,
)
db.close()
store.close()
