import { Text } from '@/shared/ui/Text.tsx'
import { ChevronDown, Terminal } from 'lucide-react'
import type { AgentSetupInstructionsProps } from '../types/agentSetupInstructionsProps.ts'
export function AgentSetupInstructions({ t }: AgentSetupInstructionsProps) {
  return (
    <details className="agent-setup" open>
      <Text as="summary">
        <Terminal size={18} aria-hidden="true" />
        <Text>{t('Connect your MCP client')}</Text>
        <ChevronDown size={16} aria-hidden="true" />
      </Text>
      <ol className="agent-setup-steps">
        <li>
          <Text as="strong">{t('Run setup in your local Aril checkout')}</Text>
          <pre>
            <Text as="code" translate="no">
              pnpm mcp:setup
            </Text>
          </pre>
        </li>
        <li>
          <Text as="strong">
            {t('Enter the studio address and your credential')}
          </Text>
          <Text as="p" variant="caption" tone="muted">
            {t(
              'Paste the credential into the terminal prompt. Setup stores it in your user configuration folder and prints the command for your MCP client.',
            )}
          </Text>
          <Text as="code" className="agent-origin" translate="no">
            {location.origin}
          </Text>
        </li>
        <li>
          <Text as="strong">
            {t('Install the companion skill and open a new chat')}
          </Text>
          <pre>
            <Text as="code" translate="no">
              pnpm skill:install
            </Text>
          </pre>
        </li>
      </ol>
      <a
        className="agent-guide-link"
        href="https://github.com/gilvex/aril/blob/main/docs/agent-integration.md"
        target="_blank"
        rel="noreferrer"
      >
        <Text>{t('Agent setup guide')}</Text>
      </a>
    </details>
  )
}
