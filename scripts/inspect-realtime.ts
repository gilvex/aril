import { openPostgres } from '../apps/studio/server/postgres.ts'
const store = await openPostgres()
try {
  console.log(
    JSON.stringify(
      (
        await store.query(
          "SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='realtime' AND tablename='messages'",
        )
      ).rows,
      null,
      2,
    ),
  )
} finally {
  await store.close()
}
