import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignVariableUsageProps } from '../types/designVariableUsageProps.ts'
export function DesignVariableUsage({
  model,
  variableId,
}: DesignVariableUsageProps) {
  const { t } = useTranslation()
  const { patch, usage } = model
  const count = usage.filter(
    (use) => use.assetKind === 'variable' && use.assetId === variableId,
  ).length
  const show = useCallback(
    () =>
      patch({
        libraryTab: 'graph',
        libraryAsset: `variable:${variableId}`,
        libraryQuery: '',
        libraryKind: 'all',
      }),
    [patch, variableId],
  )
  return (
    <Button className="button" variant="ghost" size="sm" onClick={show}>
      <Text>{t('{{count}} uses', { count })}</Text>
    </Button>
  )
}
