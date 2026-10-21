import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { DesignVariableUsage } from './DesignVariableUsage.tsx'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignVariableRowProps } from '../types/designVariableRowProps.ts'
import { DesignVariableCell } from './DesignVariableCell.tsx'
export function DesignVariableRow({
  variable,
  modes,
  model,
}: DesignVariableRowProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { library, saveLibrary } = model
  const save = useCallback(
    (next: typeof variable) =>
      saveLibrary({
        ...library,
        variables: { ...library.variables, [next.id]: next },
      }),
    [library, saveLibrary],
  )
  const name = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      save({ ...variable, name: e.target.value })
    },
    [variable, save],
  )
  const type = useCallback(
    (e: SelectChange) => {
      const type = e.target.value as typeof variable.type
      const initial =
        type === 'color'
          ? '#b54469'
          : type === 'number'
            ? 0
            : type === 'boolean'
              ? false
              : ''
      save({
        ...variable,
        type,
        values: Object.fromEntries(modes.map((mode) => [mode, initial])),
      })
    },
    [variable, modes, save],
  )
  const remove = useCallback(() => {
    const variables = { ...library.variables }
    delete variables[variable.id]
    saveLibrary({ ...library, variables })
  }, [library, variable.id, saveLibrary])
  return (
    <tr data-collaboration-scope={`variable:${variable.id}`}>
      <Text as="td">
        <input
          name="name"
          disabled={readOnly}
          value={variable.name}
          onChange={name}
          aria-label={t('Variable name')}
          maxLength={120}
        />
      </Text>
      <Text as="td">
        <StudioSelect
          value={variable.type}
          onChange={type}
          disabled={readOnly}
          aria-label={t('Type')}
        >
          {['color', 'number', 'string', 'boolean'].map((type) => (
            <option key={type} value={type}>
              {t(type)}
            </option>
          ))}
        </StudioSelect>
      </Text>
      {modes.map((mode) => (
        <Text as="td" key={mode}>
          <DesignVariableCell
            variable={variable}
            mode={mode}
            save={save}
            disabled={readOnly}
          />
        </Text>
      ))}
      <Text as="td">
        <DesignVariableUsage model={model} variableId={variable.id} />
        <button
          className="icon-button"
          disabled={readOnly}
          onClick={remove}
          aria-label={t('Delete variable')}
        >
          <Trash2 size={15} />
        </button>
      </Text>
    </tr>
  )
}
