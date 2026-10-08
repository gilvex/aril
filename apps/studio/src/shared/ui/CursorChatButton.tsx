import { useCallback, type MouseEvent } from 'react'
import { MessageCircle } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { useTranslation } from '@/shared/i18n/index.ts'
export function CursorChatButton() {
  const { t } = useTranslation()
  const open = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget
      .closest('[data-collaboration-root]')
      ?.dispatchEvent(new CustomEvent('aril:cursor-chat'))
  }, [])
  return (
    <ActionBarButton
      data-follow-controls
      title={t('Cursor chat (/)')}
      aria-label={t('Cursor chat (/)')}
      onClick={open}
    >
      <MessageCircle size={18} />
    </ActionBarButton>
  )
}
