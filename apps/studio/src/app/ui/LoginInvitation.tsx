import { useEffect, useRef } from 'react'
import { ChevronDown, KeyRound } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { JoinStudioFormProps } from '../types/joinStudioFormProps.ts'
import { JoinStudioForm } from './JoinStudioForm.tsx'

export function LoginInvitation(props: JoinStudioFormProps) {
  const { t } = useTranslation()
  const disclosure = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (props.token && disclosure.current) disclosure.current.open = true
  }, [props.token])
  return (
    <details ref={disclosure} className="login-invitation">
      <summary>
        <KeyRound size={17} />
        <span>{t('Join with an invitation')}</span>
        <ChevronDown size={16} />
      </summary>
      <JoinStudioForm {...props} />
    </details>
  )
}
