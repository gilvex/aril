import { useMemo } from 'react'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { collectScope } from '../utils/collectScope.ts'
export function useScopeCollection({
  workspace,
  results,
  boardFilter,
  scopeFilter,
}: RequirementsViewProps['model']) {
  return useMemo(
    () => collectScope(workspace, results, boardFilter, scopeFilter),
    [workspace, results, boardFilter, scopeFilter],
  )
}
