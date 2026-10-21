import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { GoogleSignInControlProps } from '../types/googleSignInControlProps.ts'

export function GoogleSignInControl({ root, link }: GoogleSignInControlProps) {
  const { t } = useTranslation()
  return (
    <div className="google-signin-control">
      <Text as="span" className="button google-signin-face" aria-hidden="true">
        {t(link ? 'Connect {{provider}}' : 'Sign in with {{provider}}', {
          provider: 'Google',
        })}
      </Text>
      <div ref={root} className="google-signin-button" />
    </div>
  )
}
