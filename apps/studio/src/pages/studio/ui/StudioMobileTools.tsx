import { Button } from 'vagabond-ui/button'
import {
  Activity as ActivityIcon,
  Download,
  History,
  Redo2,
  Undo2,
  Upload,
  Workflow,
} from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioMobileToolsProps } from '../types/studioMobileToolsProps.ts'

export function StudioMobileTools({ state, handlers }: StudioMobileToolsProps) {
  const { t } = useTranslation()
  const {
    handleClick,
    handleClick2,
    handleClick3,
    handleClick4,
    handleClick5,
  } = handlers
  return (
    <div className="mobile-workspace-tools">
      <Button variant="ghost" onClick={handleClick}>
        <ActivityIcon size={18} />
        {t('Team activity')}
      </Button>
      <Button variant="ghost" onClick={handleClick2}>
        <Workflow size={18} />
        {t('Agent access')}
      </Button>
      <span>{t('Tools')}</span>
      <Button variant="ghost" disabled={!state.canUndo} onClick={state.undo}>
        <Undo2 size={18} />
        {t('Undo')}
      </Button>
      <Button variant="ghost" disabled={!state.canRedo} onClick={state.redo}>
        <Redo2 size={18} />
        {t('Redo')}
      </Button>
      <Button variant="ghost" onClick={handleClick3}>
        <History size={18} />
        {t('Revision history')}
      </Button>
      <Button variant="ghost" onClick={handleClick4}>
        <Upload size={18} />
        {t('Import workspace')}
      </Button>
      <Button variant="ghost" onClick={handleClick5}>
        <Download size={18} />
        {t('Export workspace')}
      </Button>
    </div>
  )
}
