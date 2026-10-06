import type { AgentSetupInstructionsProps } from '../types/agentSetupInstructionsProps.ts'
export function AgentSetupInstructions({ t }: AgentSetupInstructionsProps) {
  return (
    <details className="agent-setup">
      <summary>{t('Connect your MCP client')}</summary>
      <p>
        {t('From your local Aril checkout, run')}
        <code>{t('pnpm mcp:setup')}</code>
        {t(
          '. Paste this studio address and the credential into the terminal prompts. The setup stores it in your user configuration folder and prints the MCP registration command.',
        )}
      </p>
      <p>
        {t('Studio address:')}
        <code>{location.origin}</code>
      </p>
      <p>
        {t('Install the companion skill with')}
        <code>{t('pnpm skill:install')}</code>
        {t(', then open a new chat. See')}
        <code>{t('docs/agent-integration.md')}</code> {t('for other clients.')}
      </p>
    </details>
  )
}
