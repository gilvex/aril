import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryPageActions({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  return (
    <div className="library-page-actions">
      <Button
        className="button"
        variant="outline"
        disabled={readOnly || Object.keys(model.library.machines).length >= 100}
        onClick={model.addMachine}
      >
        {t('Add state machine')}
      </Button>
      <Button
        className="button"
        variant="ghost"
        disabled={
          readOnly || Object.keys(model.library.components).length >= 100
        }
        onClick={model.example}
      >
        {t('Add example kit')}
      </Button>
    </div>
  )
}
