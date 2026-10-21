import { Text } from '@/shared/ui/Text.tsx'
import { Box, Boxes, Layers3, Workflow } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function LoginBlueprint() {
  const { t } = useTranslation()
  return (
    <div className="login-blueprint" aria-hidden="true">
      <div className="login-blueprint-heading">
        <Workflow size={16} />
        <Text as="strong">{t('Deployment blueprint')}</Text>
        <Text as="span">{t('Example board')}</Text>
      </div>
      <div className="login-blueprint-canvas">
        <svg
          className="login-blueprint-links"
          viewBox="0 0 600 470"
          fill="none"
        >
          <path d="M259 130H294Q310 130 310 146V181Q310 197 326 197H337 M337 275H293Q277 275 277 291V326Q277 342 261 342H259" />
          <path d="m330 191 7 6-7 6 M266 336l-7 6 7 6" />
        </svg>
        <div className="login-blueprint-card login-runtime">
          <Text as="span" className="login-node-kind">
            <Box size={18} />
            {t('Reusable layer')}
          </Text>
          <Text as="h2">{t('Runtime image')}</Text>
          <Text as="p">{t('A pinned base image and its dependencies.')}</Text>
          <Text as="span" className="login-node-tag">
            {t('Base image')}
          </Text>
        </div>
        <div className="login-blueprint-card login-game">
          <Text as="span" className="login-node-kind">
            <Layers3 size={18} />
            {t('Reusable layer')}
          </Text>
          <Text as="h2">{t('Game layer')}</Text>
          <Text as="p">{t('Install the game once. Version the result.')}</Text>
          <Text as="span" className="login-node-tag">
            {t('Versioned content')}
          </Text>
        </div>
        <div className="login-blueprint-card login-server">
          <Text as="span" className="login-node-kind">
            <Boxes size={18} />
            {t('Service')}
          </Text>
          <Text as="h2">{t('Server blueprint')}</Text>
          <Text as="p">
            {t('Startup, mounts, resources, and an environment schema.')}
          </Text>
          <Text as="span" className="login-node-tag">
            {t('Ready to configure')}
          </Text>
        </div>
      </div>
    </div>
  )
}
