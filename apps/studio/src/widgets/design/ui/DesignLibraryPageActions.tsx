import { Text } from '@/shared/ui/Text.tsx'
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
        variant="ghost"
        disabled={
          readOnly || Object.keys(model.library.components).length >= 2000
        }
        onClick={model.example}
      >
        <Text>{t('Add example kit')}</Text>
      </Button>
    </div>
  )
}
