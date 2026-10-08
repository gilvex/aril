import { useCallback, type ChangeEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignVariableRowProps } from '../types/designVariableRowProps.ts'
import { DesignVariableCell } from './DesignVariableCell.tsx'
export function DesignVariableRow({
  variable,
  modes,
  model,
}: DesignVariableRowProps) {
  const { t } = useTranslation()
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
      if (e.target.value.trim()) save({ ...variable, name: e.target.value })
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
  const used = Object.values(library.machines).some(
    (m) =>
      Object.values(m.states).some((s) =>
        s.entry.some((a) => a.variableId === variable.id),
      ) ||
      Object.values(m.transitions).some(
        (tr) =>
          tr.guard?.variableId === variable.id ||
          tr.actions.some((a) => a.variableId === variable.id),
      ),
  )
  return (
    <tr data-collaboration-scope={`variable:${variable.id}`}>
      <td>
        <input
          name="name"
          value={variable.name}
          onChange={name}
          aria-label={t('Variable name')}
          maxLength={120}
        />
      </td>
      <td>
        <StudioSelect
          value={variable.type}
          onChange={type}
          disabled={used}
          aria-label={t('Type')}
        >
          {['color', 'number', 'string', 'boolean'].map((type) => (
            <option key={type} value={type}>
              {t(type)}
            </option>
          ))}
        </StudioSelect>
      </td>
      {modes.map((mode) => (
        <td key={mode}>
          <DesignVariableCell variable={variable} mode={mode} save={save} />
        </td>
      ))}
      <td>
        <button
          className="icon-button"
          disabled={used}
          onClick={remove}
          aria-label={t('Delete variable')}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}
