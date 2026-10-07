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
      <a className="button" href="/">
        {t('Exit demo')}
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
          {t('Switch account')}
        </button>
        <button
          className="button"
          disabled={state.busy || !!state.confirmation}
          onClick={state.logout}
        >
          <LogOut size={15} />
          {t('Log out')}
        </button>
      </div>
      {state.busy && (
        <p className="loading-inline" role="status">
          <Spinner />
          <span>{t('Saving and signing out…')}</span>
        </p>
      )}
      {state.confirmation && (
        <div className="account-actions-confirmation">
          <p>
            {t(
              'This profile is not connected to Google. You will need a new invitation to return. Connect Google above first to keep access to this profile.',
            )}
          </p>
          <div className="account-actions-buttons">
            <button className="button" onClick={state.cancel}>
              {t('Stay signed in')}
            </button>
            <button className="button" onClick={state.confirm}>
              {t('Sign out anyway')}
            </button>
          </div>
        </div>
      )}
      {state.error && (
        <p className="form-error" role="alert">
          {t(state.error)}
        </p>
      )}
    </section>
  )
}
