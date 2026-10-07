import { useTranslation } from '@/shared/i18n/index.ts'
import { nodeKinds, statuses } from '@pomegranate/domain/workspace'
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
      <label>
        {t('Type')}
        <select
          disabled={readOnly}
          value={node.data.kind}
          onChange={changeKind}
        >
          {nodeKinds.map((kind) => (
            <option key={kind} value={kind}>
              {t(kindLabels[kind])}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('Decision')}
        <select
          disabled={readOnly}
          value={node.data.status}
          onChange={changeStatus}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(status)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
