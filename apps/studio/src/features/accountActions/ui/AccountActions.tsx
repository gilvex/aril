import { Text } from '@/shared/ui/Text.tsx'
import { ArrowRightLeft, LogOut } from 'lucide-react'
import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useAccountActions } from '../model/useAccountActions.ts'
import type { AccountActionsProps } from '../types/accountActionsProps.ts'
import './accountActions.css'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'

export function AccountActions(props: AccountActionsProps) {
  const { t } = useTranslation()
  const state = useAccountActions(props)
  if (isDemoMode())
    return (
      <a className="button" href="/app">
        <Text>{t('Exit demo')}</Text>
      </a>
    )
  return (
    <section className="account-actions" aria-label={t('Account actions')}>
      <div className="account-actions-buttons">
        <button
          className="button"
          disabled={state.busy || !!state.confirmation}
          onClick={state.switchAccount}
        >
          <ArrowRightLeft size={15} />
          <Text>{t('Switch account')}</Text>
        </button>
        <button
          className="button"
          disabled={state.busy || !!state.confirmation}
          onClick={state.logout}
        >
          <LogOut size={15} />
          <Text>{t('Log out')}</Text>
        </button>
      </div>
      {state.busy && (
        <Text as="p" className="loading-inline" role="status">
          <Spinner />
          <Text as="span">{t('Saving and signing out…')}</Text>
        </Text>
      )}
      {state.confirmation && (
        <div className="account-actions-confirmation">
          <Text as="p">
            {t(
              'This profile is not connected to Google. You will need a new invitation to return. Connect Google above first to keep access to this profile.',
            )}
          </Text>
          <div className="account-actions-buttons">
            <button className="button" onClick={state.cancel}>
              <Text>{t('Stay signed in')}</Text>
            </button>
            <button className="button" onClick={state.confirm}>
              <Text>{t('Sign out anyway')}</Text>
            </button>
          </div>
        </div>
      )}
      {state.error && (
        <Text as="p" className="form-error" role="alert">
          {t(state.error)}
        </Text>
      )}
    </section>
  )
}
