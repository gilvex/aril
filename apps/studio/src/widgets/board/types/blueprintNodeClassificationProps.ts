import type { BlueprintNodeDetailsProps } from './blueprintNodeDetailsProps.ts'
import type { useBlueprintNodeDetailsHandlers } from '../model/useBlueprintNodeDetailsHandlers.tsx'
export type BlueprintNodeClassificationProps = Pick<
  ReturnType<typeof useBlueprintNodeDetailsHandlers>,
  'changeKind' | 'changeStatus'
> & { node: BlueprintNodeDetailsProps['node']; readOnly: boolean }
