import { Text } from '@/shared/ui/Text.tsx'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { nodeKinds, statuses } from '@aril/domain/workspace'
import { kindLabels } from '../config/kindLabels.ts'
import type { BlueprintNodeClassificationProps } from '../types/blueprintNodeClassificationProps.ts'
export function BlueprintNodeClassification({
  node,
  readOnly,
  changeKind,
  changeStatus,
}: BlueprintNodeClassificationProps) {
  const { t } = useTranslation()
  return (
    <div className="field-row">
      <Text as="label">
        {t('Type')}
        <StudioSelect
          disabled={readOnly}
          value={node.data.kind}
          onChange={changeKind}
        >
          {nodeKinds.map((kind) => (
            <option key={kind} value={kind}>
              {t(kindLabels[kind])}
            </option>
          ))}
        </StudioSelect>
      </Text>
      <Text as="label">
        {t('Decision')}
        <StudioSelect
          disabled={readOnly}
          value={node.data.status}
          onChange={changeStatus}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(status)}
            </option>
          ))}
        </StudioSelect>
      </Text>
    </div>
  )
}
