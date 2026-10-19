import { z } from 'zod'
import { authReturnUrl } from './authReturnUrl.ts'
import { createHash } from 'node:crypto'
import type { Express, Request, Response } from 'express'
import type { Profile } from '@aril/domain/collaboration'
import type { Store } from '../storeContract.ts'
import { discoverOidc } from './discoverOidc.ts'
import { verifyOidc } from './verifyOidc.ts'
import { authProviders } from './authProviders.ts'
import { verifyYandex } from './verifyYandex.ts'

export function installFederatedAuth(
  app: Express,
  store: Store,
  cookieProfile: (req: Request) => Promise<Profile | undefined>,
  setSession: (res: Response, token: string) => unknown,
  publicOrigin?: string,
) {
  for (const provider of ['yandex', 'oidc'] as const) {
    const cookie = `aril_${provider}_oauth`
    const options = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: publicOrigin?.startsWith('https:') || false,
      path: `/api/auth/${provider}`,
      maxAge: 300000,
    }
    const configured = () =>
      authProviders(publicOrigin)[
        provider === 'yandex' ? 'yandexEnabled' : 'oidcEnabled'
      ]
    app.post(`/api/auth/${provider}/start`, async (req, res) => {
      if (!configured()) {
        res
          .status(503)
          .json({ error: 'This sign-in provider is not configured.' })
        return
      }
      if (
        req.get('x-pomegranate-auth') !== '1' ||
        typeof req.body?.link !== 'boolean'
      ) {
        res.status(400).json({ error: 'Invalid authentication request.' })
        return
      }
      const current = await cookieProfile(req)
      if (current?.guestExpiresAt || (req.body.link ? !current : !!current)) {
        res.status(403).json({
          error: 'Sign out to switch accounts. Guests cannot link accounts.',
        })
        return
      }
      try {
        const { challenge, nonce } = await store.identity.challenge(current?.id)
        const target = authReturnUrl(req.body.returnTo, publicOrigin!)
        const returnTo = target.pathname + target.search + target.hash
        res.cookie(
          cookie,
          JSON.stringify({ challenge, userId: current?.id, returnTo }),
          options,
        )
        const url = new URL(
          provider === 'yandex'
            ? 'https://oauth.yandex.ru/authorize'
            : (await discoverOidc()).authorization_endpoint,
        )
        const parameters = new URLSearchParams({
          response_type: 'code',
          client_id: (provider === 'yandex'
            ? process.env.YANDEX_CLIENT_ID
            : process.env.OIDC_CLIENT_ID)!,
          redirect_uri: new URL(`/api/auth/${provider}/callback`, publicOrigin)
            .href,
          scope:
            provider === 'yandex'
              ? 'login:info login:email'
              : 'openid email profile',
          ...(provider === 'oidc'
            ? {
                nonce: createHash('sha256')
                  .update('oidc:' + nonce)
                  .digest('base64url'),
              }
            : {}),
          state: challenge,
          code_challenge: createHash('sha256')
            .update(nonce)
            .digest('base64url'),
          code_challenge_method: 'S256',
        })
        for (const [key, value] of parameters) url.searchParams.set(key, value)
        res.json({ url: url.href })
      } catch {
        res.status(503).json({
          error: 'The sign-in provider is unavailable. Please try again.',
        })
      }
    })
    app.get(`/api/auth/${provider}/callback`, async (req, res) => {
      res.setHeader('Referrer-Policy', 'no-referrer')
      res.clearCookie(cookie, options)
      let failureTarget = new URL(
        '/?account=switch',
        publicOrigin || 'http://127.0.0.1:5173',
      )
      try {
        if (!configured()) throw new Error('Not configured')
        const raw = req.headers.cookie
          ?.split(';')
          .map((part) => part.trim())
          .find((part) => part.startsWith(cookie + '='))
          ?.slice(cookie.length + 1)
        const flow = z
          .object({
            challenge: z.string().length(43),
            userId: z.string().max(100).optional(),
            returnTo: z.string(),
          })
          .parse(JSON.parse(decodeURIComponent(raw || '')))
        if (
          typeof req.query.state !== 'string' ||
          req.query.state !== flow.challenge
        )
          throw new Error('Invalid state')
        const nonce = await store.identity.consumeChallenge(
          flow.challenge,
          flow.userId,
        )
        if (!nonce) throw new Error('Expired challenge')
        const target = authReturnUrl(flow.returnTo, publicOrigin!)
        failureTarget = target
        if (
          req.query.error ||
          (provider === 'oidc' &&
            req.query.iss !== undefined &&
            req.query.iss !== process.env.OIDC_ISSUER) ||
          typeof req.query.code !== 'string' ||
          req.query.code.length > 4096
        )
          throw new Error('Expired or denied')
        const identity = await (
          provider === 'yandex' ? verifyYandex : verifyOidc
        )(
          req.query.code,
          nonce,
          new URL(`/api/auth/${provider}/callback`, publicOrigin).href,
        )
        if (flow.userId) {
          if (
            !(await store.identity.linkAccount(
              flow.userId,
              provider,
              provider === 'yandex'
                ? 'https://login.yandex.ru'
                : process.env.OIDC_ISSUER!,
              identity.id,
              identity.default_email,
            ))
          )
            throw new Error('Identity conflict')
        } else {
          const user = await store.identity.registerAccount(
            provider,
            provider === 'yandex'
              ? 'https://login.yandex.ru'
              : process.env.OIDC_ISSUER!,
            identity.id,
            identity.default_email,
            identity.display_name || 'Yandex user',
          )
          setSession(res, user.token)
        }
        res.redirect(target.href)
      } catch {
        failureTarget.searchParams.set('authError', provider)
        res.redirect(failureTarget.href)
      }
    })
  }
}
