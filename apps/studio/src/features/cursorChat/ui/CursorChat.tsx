import { Text } from '@/shared/ui/Text.tsx'
import { CursorMessage } from '@/entities/collaboration/index.ts'
import { MessageSquare } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCursorChat } from '../model/useCursorChat.ts'
import type { CursorChatProps } from '../types/cursorChatProps.ts'
import './cursorChat.css'
export function CursorChat(props: CursorChatProps) {
  const { t } = useTranslation()
  const model = useCursorChat(props)
  if (!props.active) return null
  return (
    <>
      {!props.toolbar && (
        <button
          data-follow-controls
          className="icon-button cursor-chat-toggle"
          title={t('Cursor chat (/)')}
          aria-label={t('Cursor chat (/)')}
          onClick={model.openComposer}
        >
          <MessageSquare size={18} />
        </button>
      )}
      {!model.open && model.text && model.expiresAt > 0 && (
        <div
          className="self-cursor-message"
          style={{ left: model.x, top: model.y }}
        >
          <Text as="strong">{props.profile.name}</Text>
          <CursorMessage
            chat={{ text: model.text, expiresAt: model.expiresAt }}
          />
        </div>
      )}
      {model.open && (
        <div
          data-follow-controls
          className="cursor-chat-composer"
          style={{ left: model.x, top: model.y }}
        >
          <Text as="strong">{props.profile.name}:</Text>
          <input
            autoFocus
            maxLength={160}
            value={model.text}
            aria-label={t('Temporary message')}
            placeholder={t('Say something...')}
            onChange={(event) => model.change(event.target.value)}
            onKeyDown={model.key}
            onBlur={model.close}
          />
        </div>
      )}
    </>
  )
}
