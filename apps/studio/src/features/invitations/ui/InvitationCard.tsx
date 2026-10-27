import { Check, X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { InvitationCardProps } from '../types/index.ts'
export function InvitationCard({
  item,
  busy,
  onDecision,
}: InvitationCardProps) {
  const { t } = useTranslation()
  return (
    <article className="invitation-card">
      <strong>{item.workspaceName}</strong>
      <p>
        {t('{{name}} invited you as {{role}}', {
          name: item.inviterName,
          role: t(item.role === 'viewer' ? 'Viewer' : 'Editor'),
        })}
      </p>
      <small>
        {t('Expires {{date}}', {
          date: new Date(item.expiresAt).toLocaleDateString(),
        })}
      </small>
      <div className="invitation-form-actions">
        <Button
          className="button primary"
          disabled={busy}
          onClick={() => void onDecision(item.id, 'accept')}
        >
          <Check size={16} />
          {t('Accept')}
        </Button>
        <Button
          className="button"
          disabled={busy}
          onClick={() => void onDecision(item.id, 'decline')}
        >
          <X size={16} />
          {t('Decline')}
        </Button>
      </div>
    </article>
  )
}
