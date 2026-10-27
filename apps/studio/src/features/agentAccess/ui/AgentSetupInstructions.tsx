import { ChevronDown, Terminal } from 'lucide-react'
import type { AgentSetupInstructionsProps } from '../types/agentSetupInstructionsProps.ts'
export function AgentSetupInstructions({ t }: AgentSetupInstructionsProps) {
  return (
    <details className="agent-setup" open>
      <summary>
        <Terminal size={18} aria-hidden="true" />
        {t('Connect your MCP client')}
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <ol className="agent-setup-steps">
        <li>
          <strong>{t('Run setup in your local Aril checkout')}</strong>
          <pre>
            <code translate="no">pnpm mcp:setup</code>
          </pre>
        </li>
        <li>
          <strong>{t('Enter the studio address and your credential')}</strong>
          <p>
            {t(
              'Paste the credential into the terminal prompt. Setup stores it in your user configuration folder and prints the command for your MCP client.',
            )}
          </p>
          <code className="agent-origin" translate="no">
            {location.origin}
          </code>
        </li>
        <li>
          <strong>
            {t('Install the companion skill and open a new chat')}
          </strong>
          <pre>
            <code translate="no">pnpm skill:install</code>
          </pre>
        </li>
      </ol>
      <a
        className="agent-guide-link"
        href="https://github.com/gilvex/aril/blob/main/docs/agent-integration.md"
        target="_blank"
        rel="noreferrer"
      >
        {t('Agent setup guide')}
      </a>
    </details>
  )
}
