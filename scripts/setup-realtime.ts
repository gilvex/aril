// One-time, additive authorization setup. No planning documents are modified.
import { openPostgres } from '../server/postgres.ts'
const store = await openPostgres()
try {
  await store.transaction(async (client) => {
    const existing = await client.query(
      "SELECT policyname FROM pg_policies WHERE schemaname='realtime' AND tablename='messages' AND policyname LIKE 'pomegranate_live_%'",
    )
    if (existing.rows.length)
      throw new Error(
        'Pomegranate policies already exist; inspect them before changing anything.',
      )
    await client.query(`
      CREATE POLICY pomegranate_live_read ON realtime.messages FOR SELECT TO authenticated
        USING (realtime.topic() = (auth.jwt()->>'pomegranate_topic')
          AND realtime.topic() LIKE 'pomegranate:live:%' AND extension IN ('broadcast','presence'));
      CREATE POLICY pomegranate_live_write ON realtime.messages FOR INSERT TO authenticated
        WITH CHECK (realtime.topic() = (auth.jwt()->>'pomegranate_topic')
          AND realtime.topic() LIKE 'pomegranate:live:%' AND extension IN ('broadcast','presence'));
      CREATE POLICY pomegranate_live_read_guard ON realtime.messages AS RESTRICTIVE FOR SELECT TO public
        USING (realtime.topic() NOT LIKE 'pomegranate:live:%' OR realtime.topic() = (auth.jwt()->>'pomegranate_topic'));
      CREATE POLICY pomegranate_live_write_guard ON realtime.messages AS RESTRICTIVE FOR INSERT TO public
        WITH CHECK (realtime.topic() NOT LIKE 'pomegranate:live:%' OR realtime.topic() = (auth.jwt()->>'pomegranate_topic'));
    `)
  })
  console.log(
    'Private workspace WebSocket channel policies installed. No document or presence rows changed.',
  )
} finally {
  await store.close()
}
