import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'

export function WorkspaceEmptyState({ searching }: { searching: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="workspace-list-empty">
      <Text as="h2">
        {t(
          searching
            ? 'No matching workspaces'
            : 'Your first workspace starts here',
        )}
      </Text>
      <Text as="p">
        {t(
          searching
            ? 'Try another name or clear your search.'
            : 'Create a workspace, then invite your team to plan together.',
        )}
      </Text>
    </div>
  )
}
