import type { AgentSecretProps } from '../types/agentSecretProps.ts'
export function AgentSecret({ t, secret, handleClick }: AgentSecretProps) {
  return (
    <div className="agent-secret">
      <strong>{t('Save your credential now')}</strong>
      <p>
        {t(
          'It is shown only here, until this dialog closes. Keep it out of chats and Git.',
        )}
      </p>
      <label>
        {t('Credential')}
        <input
          type="password"
          readOnly
          value={secret}
          onFocus={(e) => e.target.select()}
          autoComplete="off"
        />
      </label>
      <button className="button" type="button" onClick={handleClick}>
        {t('Copy credential')}
      </button>
    </div>
  )
}
