import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { GoogleSignInStatusProps } from '../types/googleSignInStatusProps.ts'

export function GoogleSignInStatus({ status, error }: GoogleSignInStatusProps) {
  const { t } = useTranslation()
  if (!status) return null
  const pending =
    !error &&
    (status === 'Loading Google sign-in…' ||
      status === 'Verifying your Google account…')
  return (
    <p className={pending ? 'loading-inline' : undefined} role="status">
      {pending && <Spinner />}
      <span>{t(status)}</span>
    </p>
  )
}
