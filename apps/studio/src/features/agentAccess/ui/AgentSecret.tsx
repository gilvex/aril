import { Text } from '@/shared/ui/Text.tsx'
import type { AgentSecretProps } from '../types/agentSecretProps.ts'
export function AgentSecret({ t, secret, handleClick }: AgentSecretProps) {
  return (
    <div className="agent-secret">
      <Text as="strong">{t('Save your credential now')}</Text>
      <Text as="p">
        {t(
          'It is shown only here, until this dialog closes. Keep it out of chats and Git.',
        )}
      </Text>
      <Text as="label">
        {t('Credential')}
        <input
          type="password"
          readOnly
          value={secret}
          onFocus={(e) => e.target.select()}
          autoComplete="off"
        />
      </Text>
      <button className="button" type="button" onClick={handleClick}>
        <Text>{t('Copy credential')}</Text>
      </button>
    </div>
  )
}
