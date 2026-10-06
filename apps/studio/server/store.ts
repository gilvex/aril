import type { Activity } from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import { blankStudio, type StudioSummary } from '@pomegranate/domain/studios'
import {
  workspaceSchema,
  type Envelope,
  type Workspace,
} from '@pomegranate/domain/workspace'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { agentCredentials, agentTable } from './agentCredentials.ts'
import { identityStore } from './identity.ts'

export function openStore(path: string) {
  mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS studios (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS members (workspace_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL, PRIMARY KEY(workspace_id,user_id));
    CREATE TABLE IF NOT EXISTS documents (workspace_id TEXT PRIMARY KEY, revision INTEGER NOT NULL, body TEXT NOT NULL, saved_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS studio_snapshots (workspace_id TEXT NOT NULL, revision INTEGER NOT NULL, body TEXT NOT NULL, saved_at TEXT NOT NULL, PRIMARY KEY(workspace_id,revision));
    CREATE TABLE IF NOT EXISTS studio_activity (id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS studio_receipts (workspace_id TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL, PRIMARY KEY(workspace_id,id));
    CREATE TABLE IF NOT EXISTS studio_migrations (id TEXT PRIMARY KEY);`)
  db.exec(agentTable.replaceAll('studio.', ''))
  const agents = agentCredentials(async (sql, values) => {
    const statement = db.prepare(
      sql.replaceAll('studio.', '').replace(/\$\d+/g, '?'),
    )
    if (sql.trimStart().startsWith('SELECT')) return statement.all(...values)
    statement.run(...values)
    return []
  })
  const identity = identityStore(db)
  if (
    !db
      .prepare('SELECT id FROM studio_migrations WHERE id = ?')
      .get('multiple-workspaces')
  ) {
    db.exec('BEGIN IMMEDIATE')
    try {
      const now = new Date().toISOString()
      db.prepare('INSERT OR IGNORE INTO studios VALUES (?, ?, ?)').run(
        'default',
        'Pomegranate',
        now,
      )
      const table = (name: string) =>
        !!db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          )
          .get(name)
      if (table('workspace'))
        db.exec(
          "INSERT OR IGNORE INTO documents SELECT 'default', revision, body, saved_at FROM workspace",
        )
      db.prepare('INSERT OR IGNORE INTO documents VALUES (?, 1, ?, ?)').run(
        'default',
        JSON.stringify(createSeed()),
        now,
      )
      if (table('snapshots'))
        db.exec(
          "INSERT OR IGNORE INTO studio_snapshots SELECT 'default', revision, body, saved_at FROM snapshots",
        )
      if (table('activity'))
        db.exec(
          "INSERT INTO studio_activity (workspace_id,user_id,name,message,created_at) SELECT 'default',user_id,name,message,created_at FROM activity",
        )
      if (table('receipts'))
        db.exec(
          "INSERT OR IGNORE INTO studio_receipts SELECT 'default',id,revision FROM receipts",
        )
      db.exec(
        "INSERT OR IGNORE INTO members SELECT 'default',id,'member' FROM profiles",
      )
      const owner = db
        .prepare('SELECT id FROM profiles ORDER BY rowid LIMIT 1')
        .get()
      if (owner)
        db.prepare(
          "UPDATE members SET role='owner' WHERE workspace_id='default' AND user_id=?",
        ).run(String(owner.id))
      db.prepare('INSERT INTO studio_migrations VALUES (?)').run(
        'multiple-workspaces',
      )
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
  function read(workspaceId = 'default'): Envelope {
    const row = db
      .prepare(
        'SELECT revision, body, saved_at FROM documents WHERE workspace_id=?',
      )
      .get(workspaceId)
    if (!row) throw new Error('Workspace not found')
    return {
      workspace: workspaceSchema.parse(JSON.parse(String(row.body))),
      revision: Number(row.revision),
      savedAt: String(row.saved_at),
    }
  }
  function save(
    workspace: Workspace,
    expected: number,
    actor?: { id: string; name: string; message: string; requestId: string },
    workspaceId = 'default',
  ): Envelope | null {
    const clean = workspaceSchema.parse(workspace)
    db.exec('BEGIN IMMEDIATE')
    try {
      const current = read(workspaceId)
      if (current.revision !== expected) {
        db.exec('ROLLBACK')
        return null
      }
      db.prepare(
        'INSERT OR IGNORE INTO studio_snapshots VALUES (?, ?, ?, ?)',
      ).run(
        workspaceId,
        current.revision,
        JSON.stringify(current.workspace),
        current.savedAt,
      )
      const savedAt = new Date().toISOString()
      db.prepare(
        'UPDATE documents SET revision=?,body=?,saved_at=? WHERE workspace_id=?',
      ).run(expected + 1, JSON.stringify(clean), savedAt, workspaceId)
      if (actor) {
        db.prepare(
          'INSERT INTO studio_activity (workspace_id,user_id,name,message,created_at) VALUES (?,?,?,?,?)',
        ).run(workspaceId, actor.id, actor.name, actor.message, savedAt)
        db.prepare('INSERT INTO studio_receipts VALUES (?,?,?)').run(
          workspaceId,
          actor.id + ':' + actor.requestId,
          expected + 1,
        )
        db.prepare(
          'DELETE FROM studio_activity WHERE workspace_id=? AND id NOT IN (SELECT id FROM studio_activity WHERE workspace_id=? ORDER BY id DESC LIMIT 200)',
        ).run(workspaceId, workspaceId)
        db.prepare(
          'DELETE FROM studio_receipts WHERE workspace_id=? AND rowid NOT IN (SELECT rowid FROM studio_receipts WHERE workspace_id=? ORDER BY rowid DESC LIMIT 1000)',
        ).run(workspaceId, workspaceId)
      }
      db.prepare(
        'DELETE FROM studio_snapshots WHERE workspace_id=? AND revision NOT IN (SELECT revision FROM studio_snapshots WHERE workspace_id=? ORDER BY revision DESC LIMIT 30)',
      ).run(workspaceId, workspaceId)
      db.exec('COMMIT')
      return { workspace: clean, revision: expected + 1, savedAt }
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
  return {
    read,
    save,
    identity,
    agents,
    member: (userId: string, workspaceId: string) =>
      !!db
        .prepare('SELECT 1 FROM members WHERE user_id=? AND workspace_id=?')
        .get(userId, workspaceId),
    studios: (userId: string) =>
      db
        .prepare(
          'SELECT s.id,s.name,s.created_at AS createdAt,m.role FROM studios s JOIN members m ON m.workspace_id=s.id WHERE m.user_id=? ORDER BY s.created_at,s.id',
        )
        .all(userId) as StudioSummary[],
    createStudio: (userId: string, name: string) => {
      const id = randomUUID(),
        createdAt = new Date().toISOString()
      db.exec('BEGIN IMMEDIATE')
      try {
        db.prepare('INSERT INTO studios VALUES (?,?,?)').run(
          id,
          name,
          createdAt,
        )
        db.prepare('INSERT INTO members VALUES (?,?,?)').run(
          id,
          userId,
          'owner',
        )
        db.prepare('INSERT INTO documents VALUES (?,1,?,?)').run(
          id,
          JSON.stringify(blankStudio(name)),
          createdAt,
        )
        db.exec('COMMIT')
        return { id, name, createdAt, role: 'owner' as const }
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
    receipt: (userId: string, requestId: string, workspaceId = 'default') =>
      !!db
        .prepare('SELECT id FROM studio_receipts WHERE workspace_id=? AND id=?')
        .get(workspaceId, userId + ':' + requestId),
    activity: (workspaceId = 'default') =>
      db
        .prepare(
          'SELECT id,user_id AS userId,name,message,created_at AS createdAt FROM studio_activity WHERE workspace_id=? ORDER BY id DESC LIMIT 50',
        )
        .all(workspaceId) as Activity[],
    history: (workspaceId = 'default') =>
      db
        .prepare(
          'SELECT revision,saved_at AS savedAt FROM studio_snapshots WHERE workspace_id=? ORDER BY revision DESC',
        )
        .all(workspaceId),
    snapshot: (revision: number, workspaceId = 'default') => {
      const row = db
        .prepare(
          'SELECT body FROM studio_snapshots WHERE workspace_id=? AND revision=?',
        )
        .get(workspaceId, revision)
      return row ? workspaceSchema.parse(JSON.parse(String(row.body))) : null
    },
    close: () => db.close(),
  }
}
