import { Text } from '@/shared/ui/Text.tsx'
import './federatedSignIn.css'
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { request } from '@/shared/api/request.ts'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { createFederatedSignInModel } from '../model/createFederatedSignInModel.ts'
import type { FederatedSignInProps } from '../types/federatedSignInProps.ts'

export function FederatedSignIn({
  link = false,
  provider,
}: FederatedSignInProps) {
  const { t } = useTranslation()
  const model = useMemo(createFederatedSignInModel, [])
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  useEffect(() => {
    let active = true
    void request<{
      yandexEnabled?: boolean
      oidcEnabled?: boolean
      oidcLabel?: string
    }>('/api/auth/config')
      .then((config) => {
        if (active)
          model.store.dispatch(
            model.actions.configured({
              enabled: !!(provider === 'yandex'
                ? config.yandexEnabled
                : config.oidcEnabled),
              label: config.oidcLabel || 'SSO',
            }),
          )
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [model, provider])
  const start = useCallback(async () => {
    model.store.dispatch(model.actions.started())
    try {
      const returnTo = location.pathname + location.search + location.hash
      const result = await request<{ url: string }>(
        `/api/auth/${provider}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-pomegranate-auth': '1',
          },
          body: JSON.stringify({ link, returnTo }),
        },
      )
      if (!link) localStorage.removeItem(sessionTokenKey)
      location.assign(result.url)
    } catch {
      model.store.dispatch(model.actions.failed())
    }
  }, [link, model, provider])
  if (!state.enabled) return null
  return (
    <div className="federated-signin">
      <button className="button" disabled={state.pending} onClick={start}>
        <Text>
          {t(
            state.pending
              ? 'Opening sign-in…'
              : link
                ? 'Connect {{provider}}'
                : 'Sign in with {{provider}}',
            { provider: provider === 'yandex' ? t('Yandex ID') : state.label },
          )}
        </Text>
      </button>
      {(state.failed ||
        new URLSearchParams(location.search).get('authError') === provider) && (
        <Text as="p" className="form-error" role="alert">
          {t('Could not sign in. Please try again.')}
        </Text>
      )}
    </div>
  )
}
