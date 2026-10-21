import { Text } from '@/shared/ui/Text.tsx'
import { X } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'vagabond-ui/dialog'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useCompactLayout } from '@/shared/model/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { InvitationDialogProps } from '../types/index.ts'
export function InvitationDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: InvitationDialogProps) {
  const compact = useCompactLayout(),
    { t } = useTranslation()
  if (compact)
    return (
      <StudioDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        className="invitation-drawer"
      >
        <div className="invitation-drawer-content">
          <header>
            <Text as="h2">{title}</Text>
            <Button
              className="icon-button"
              aria-label={t('Close dialog')}
              onClick={() => onOpenChange(false)}
            >
              <X size={18} />
            </Button>
          </header>
          <Text as="p">{description}</Text>
          {children}
        </div>
      </StudioDrawer>
    )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="invitation-dialog">
        <DialogTitle><Text>{title}</Text></DialogTitle>
        <DialogDescription><Text>{description}</Text></DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}
