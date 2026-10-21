import type { LinkedAccount } from '@aril/domain/accounts'
import type { Profile } from '@aril/domain/collaboration'
import { randomBytes, randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { guestTables } from './guestLinks.ts'
import { hash } from './utils/hash.ts'

const colors = [
  '#b34568',
  '#426cbd',
  '#27816b',
  '#9854b2',
  '#a66a25',
  '#287b94',
]
export function identityStore(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar TEXT NOT NULL, color TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS invites (token_hash TEXT PRIMARY KEY, created_by TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS accounts (subject TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE, email TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_challenges (token_hash TEXT PRIMARY KEY, nonce TEXT NOT NULL, user_id TEXT, expires_at INTEGER NOT NULL);`)
  if (
    !db
      .prepare('PRAGMA table_info(invites)')
      .all()
      .some((column) => column.name === 'workspace_id')
  )
    db.exec(
      "ALTER TABLE invites ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'default'",
    )
  if (
    !db
      .prepare('PRAGMA table_info(accounts)')
      .all()
      .some((column) => column.name === 'provider')
  ) {
    db.exec(`BEGIN IMMEDIATE;
      ALTER TABLE accounts RENAME TO accounts_legacy;
      CREATE TABLE accounts (provider TEXT NOT NULL, issuer TEXT NOT NULL, subject TEXT NOT NULL, user_id TEXT NOT NULL, email TEXT NOT NULL, PRIMARY KEY(provider,issuer,subject), UNIQUE(user_id,provider,issuer));
      INSERT INTO accounts SELECT 'google','https://accounts.google.com',subject,user_id,email FROM accounts_legacy;
      DROP TABLE accounts_legacy;
      COMMIT;`)
  }
  db.exec(
    'CREATE TABLE IF NOT EXISTS usernames (user_id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE)',
  )
  db.exec(guestTables.replaceAll('studio.', ''))
  if (
    !db
      .prepare('PRAGMA table_info(guest_links)')
      .all()
      .some((column) => column.name === 'role')
  )
    db.exec(
      "ALTER TABLE guest_links ADD COLUMN role TEXT NOT NULL DEFAULT 'member'",
    )
  const count = () =>
    Number(db.prepare('SELECT COUNT(*) AS count FROM profiles').get()!.count)
  const profile = (id: string) =>
    db
      .prepare(
        `SELECT p.*,COALESCE((SELECT username FROM usernames u WHERE u.user_id=p.id),'user_' || replace(p.id,'-','')) AS username,g.expires_at AS guestExpiresAt FROM profiles p LEFT JOIN guest_profiles gp ON gp.user_id=p.id LEFT JOIN guest_links g ON g.id=gp.link_id WHERE p.id = ?`,
      )
      .get(id) as Profile | undefined
  function create(name = 'New collaborator') {
    const id = randomUUID()
    const token = randomBytes(32).toString('base64url')
    db.prepare('INSERT INTO profiles VALUES (?, ?, ?, ?)').run(
      id,
      name,
      '',
      colors[count() % colors.length],
    )
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(
      hash(token),
      id,
      Date.now() + 30 * 86400000,
    )
    return { profile: profile(id)!, token }
  }
  function session(id: string) {
    const token = randomBytes(32).toString('base64url')
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(
      hash(token),
      id,
      Date.now() + 30 * 86400000,
    )
    return { profile: profile(id)!, token }
  }
  function linkAccount(
    id: string,
    provider: string,
    issuer: string,
    subject: string,
    email: string,
  ) {
    if (!profile(id) || profile(id)?.guestExpiresAt) return false
    const rows = db
      .prepare(
        'SELECT subject,user_id FROM accounts WHERE provider=? AND issuer=? AND (subject=? OR user_id=?)',
      )
      .all(provider, issuer, subject, id)
    if (rows.some((row) => row.subject !== subject || row.user_id !== id))
      return false
    db.prepare(
      'INSERT INTO accounts VALUES (?,?,?,?,?) ON CONFLICT(provider,issuer,subject) DO UPDATE SET email=excluded.email',
    ).run(provider, issuer, subject, id, email)
    return true
  }
  function registerAccount(
    provider: string,
    issuer: string,
    subject: string,
    email: string,
    name: string,
  ) {
    db.exec('BEGIN IMMEDIATE')
    try {
      const existing = db
        .prepare(
          'SELECT user_id FROM accounts WHERE provider=? AND issuer=? AND subject=?',
        )
        .get(provider, issuer, subject)
      const user = existing
        ? session(String(existing.user_id))
        : create(name.trim().slice(0, 60) || 'New collaborator')
      db.prepare(
        'INSERT INTO accounts VALUES (?,?,?,?,?) ON CONFLICT(provider,issuer,subject) DO UPDATE SET email=excluded.email',
      ).run(provider, issuer, subject, user.profile.id, email)
      db.exec('COMMIT')
      return user
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
  return {
    count,
    profile,
    redeemGuest: (token: string, name: string) => {
      db.exec('BEGIN IMMEDIATE')
      try {
        const link = db
          .prepare(
            'SELECT id,workspace_id,expires_at,role FROM guest_links WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?',
          )
          .get(hash(token), Date.now())
        if (!link) {
          db.exec('ROLLBACK')
          return null
        }
        const user = create(name)
        db.prepare('INSERT INTO guest_profiles VALUES (?,?)').run(
          user.profile.id,
          String(link.id),
        )
        db.prepare('INSERT INTO members VALUES (?,?,?)').run(
          String(link.workspace_id),
          user.profile.id,
          link.role === 'viewer' ? 'viewer' : 'guest',
        )
        db.prepare('UPDATE sessions SET expires_at=? WHERE token_hash=?').run(
          Math.min(Number(link.expires_at), Date.now() + 30 * 86400000),
          hash(user.token),
        )
        db.exec('COMMIT')
        return {
          ...user,
          profile: profile(user.profile.id)!,
          workspaceId: String(link.workspace_id),
          expiresAt: Number(link.expires_at),
        }
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
    accounts: (id: string) =>
      db
        .prepare('SELECT provider,issuer,email FROM accounts WHERE user_id=?')
        .all(id) as LinkedAccount[],
    account: (id: string) =>
      db
        .prepare(
          "SELECT email FROM accounts WHERE user_id=? AND provider='google'",
        )
        .get(id) as { email: string } | undefined,
    challenge: (userId?: string) => {
      db.prepare('DELETE FROM auth_challenges WHERE expires_at < ?').run(
        Date.now(),
      )
      const challenge = randomBytes(32).toString('base64url')
      const nonce = randomBytes(32).toString('base64url')
      db.prepare('INSERT INTO auth_challenges VALUES (?,?,?,?)').run(
        hash(challenge),
        nonce,
        userId || null,
        Date.now() + 5 * 60000,
      )
      return { challenge, nonce }
    },
    consumeChallenge: (challenge: string, userId?: string) => {
      const row = db
        .prepare(
          'DELETE FROM auth_challenges WHERE token_hash=? AND expires_at>? RETURNING nonce,user_id',
        )
        .get(hash(challenge), Date.now())
      return row && row.user_id === (userId || null)
        ? String(row.nonce)
        : undefined
    },
    linkAccount,
    registerAccount,
    linkGoogle: (id: string, subject: string, email: string) =>
      linkAccount(id, 'google', 'https://accounts.google.com', subject, email),
    registerGoogle: (subject: string, email: string, name: string) =>
      registerAccount(
        'google',
        'https://accounts.google.com',
        subject,
        email,
        name,
      ),
    signInGoogle: (subject: string) => {
      const row = db
        .prepare(
          "SELECT user_id FROM accounts WHERE provider='google' AND subject=?",
        )
        .get(subject)
      return row ? session(String(row.user_id)) : null
    },
    bootstrap: () => {
      if (count()) return null
      const user = create('Workspace owner')
      db.prepare('INSERT OR IGNORE INTO members VALUES (?,?,?)').run(
        'default',
        user.profile.id,
        'owner',
      )
      return user
    },
    authenticate: (token: string) => {
      if (!/^[\w-]{43}$/.test(token)) return undefined
      const row = db
        .prepare(
          `SELECT s.user_id FROM sessions s LEFT JOIN guest_profiles gp ON gp.user_id=s.user_id LEFT JOIN guest_links g ON g.id=gp.link_id WHERE s.token_hash = ? AND s.expires_at > ? AND (gp.user_id IS NULL OR (g.revoked_at IS NULL AND g.expires_at>?))`,
        )
        .get(hash(token), Date.now(), Date.now())
      return row ? profile(String(row.user_id)) : undefined
    },
    revokeSession: (token: string) => {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash(token))
    },
    update: (id: string, name: string, avatar: string) => {
      db.prepare('UPDATE profiles SET name = ?, avatar = ? WHERE id = ?').run(
        name,
        avatar,
        id,
      )
      return profile(id)!
    },
    invite: (id: string, workspaceId = 'default') => {
      if (
        !db
          .prepare('SELECT 1 FROM members WHERE user_id=? AND workspace_id=?')
          .get(id, workspaceId)
      )
        throw new Error('Workspace access required')
      const token = randomBytes(24).toString('base64url')
      const expiresAt = Date.now() + 86400000
      db.prepare('DELETE FROM invites WHERE expires_at < ? OR used = 1').run(
        Date.now(),
      )
      db.prepare(
        'INSERT INTO invites (token_hash, created_by, expires_at, workspace_id) VALUES (?, ?, ?, ?)',
      ).run(hash(token), id, expiresAt, workspaceId)
      return { token, expiresAt }
    },
    join: (token: string, name: string, existingId?: string) => {
      db.exec('BEGIN IMMEDIATE')
      try {
        const invitation = db
          .prepare(
            'SELECT workspace_id FROM invites WHERE token_hash=? AND used=0 AND expires_at>?',
          )
          .get(hash(token), Date.now())
        if (!invitation) {
          db.exec('ROLLBACK')
          return null
        }
        const result = db
          .prepare(
            'UPDATE invites SET used = 1 WHERE token_hash = ? AND used = 0 AND expires_at > ?',
          )
          .run(hash(token), Date.now())
        if (result.changes !== 1) {
          db.exec('ROLLBACK')
          return null
        }
        const user = existingId
          ? { profile: profile(existingId)!, token: '' }
          : create(name)
        db.prepare('INSERT OR IGNORE INTO members VALUES (?,?,?)').run(
          String(invitation.workspace_id),
          user.profile.id,
          'member',
        )
        db.exec('COMMIT')
        return { ...user, workspaceId: String(invitation.workspace_id) }
      } catch (err) {
        db.exec('ROLLBACK')
        throw err
      }
    },
  }
}
