import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Settings, X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from 'vagabond-ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from 'vagabond-ui/drawer'
import { useCompactLayout } from '@/shared/model/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { WorkspaceAccountMenuProps } from '../types/workspaceAccountMenuProps.ts'
import { SettingsProfile } from './SettingsProfile.tsx'
import './accountSettings.css'

export function AccountSettingsButton(props: WorkspaceAccountMenuProps) {
  const { t } = useTranslation()
  const compact = useCompactLayout()
  const beforeLeave = useCallback(async () => true, [])
  const Root = compact ? Drawer : Dialog
  const Trigger = compact ? DrawerTrigger : DialogTrigger
  const Content = compact ? DrawerContent : DialogContent
  const Title = compact ? DrawerTitle : DialogTitle
  return (
    <Root>
      <Trigger asChild>
        <Button variant="ghost" className="button account-settings-trigger">
          <Settings size={16} />
          <Text>{t('Account settings')}</Text>
        </Button>
      </Trigger>
      <Content
        className="account-settings-dialog"
        {...(compact ? { showCloseButton: false } : {})}
        aria-describedby={undefined}
      >
        <header className="account-settings-heading">
          <Title>
            <Text>{t('Account settings')}</Text>
          </Title>
          {compact && (
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="icon-button"
                aria-label={t('Close dialog')}
              >
                <X size={18} />
              </Button>
            </DrawerClose>
          )}
        </header>
        <SettingsProfile {...props} beforeLeave={beforeLeave} />
      </Content>
    </Root>
  )
}
