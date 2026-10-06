import type { Express, Response } from 'express'
import { z } from 'zod'
import type { Store } from '../storeContract.ts'

export function installGuestJoin(
  app: Express,
  store: Store,
  setSession: (res: Response, token: string) => unknown,
) {
  const attempts = new Map<string, { count: number; until: number }>()
  app.post('/api/auth/guest', async (req, res) => {
    const input = z
      .object({
        token: z.string().regex(/^[\w-]{43}$/),
        name: z.string().trim().min(1).max(60),
      })
      .safeParse(req.body)
    if (!input.success || req.get('x-pomegranate-auth') !== '1') {
      res.status(400).json({ error: 'Enter your name and a valid guest link.' })
      return
    }
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now(),
      previous = attempts.get(key)
    if (previous && previous.until > now && previous.count >= 20) {
      res
        .status(429)
        .json({ error: 'Too many attempts. Try again in a minute.' })
      return
    }
    if (attempts.size > 1000) attempts.clear()
    attempts.set(key, {
      count: previous && previous.until > now ? previous.count + 1 : 1,
      until: previous && previous.until > now ? previous.until : now + 60000,
    })
    const user = await store.identity.redeemGuest(
      input.data.token,
      input.data.name,
    )
    if (!user) {
      res
        .status(403)
        .json({ error: 'This guest link has expired or been revoked.' })
      return
    }
    setSession(res, user.token)
    res.status(201).json(user)
  })
}
