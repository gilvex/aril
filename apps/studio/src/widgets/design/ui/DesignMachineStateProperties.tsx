import { useCallback, type ChangeEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignMachine } from '@pomegranate/domain/designLibrary'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMachineActions } from './DesignMachineActions.tsx'
export function DesignMachineStateProperties({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { library, updateMachine, patch } = model
  const machine = library.machines[model.machineId || '']
  const state = machine?.states[model.machineSelection?.id || '']
  const edit = useCallback(
    (change: Partial<DesignMachine['states'][string]>) => {
      if (state)
        updateMachine({
          ...machine,
          states: { ...machine.states, [state.id]: { ...state, ...change } },
        })
    },
    [state, machine, updateMachine],
  )
  const name = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim()) edit({ name: e.target.value })
    },
    [edit],
  )
  const variant = useCallback(
    (e: SelectChange) => edit({ variantId: e.target.value || undefined }),
    [edit],
  )
  const entry = useCallback(
    (actions: DesignMachine['states'][string]['entry']) =>
      edit({ entry: actions }),
    [edit],
  )
  const remove = useCallback(() => {
    if (!state || state.id === machine.initial) return
    const states = { ...machine.states }
    delete states[state.id]
    updateMachine({
      ...machine,
      states,
      transitions: Object.fromEntries(
        Object.entries(machine.transitions).filter(
          ([, tr]) => tr.from !== state.id && tr.to !== state.id,
        ),
      ),
    })
    patch({ machineSelection: null })
  }, [state, machine, updateMachine, patch])
  if (!state) return null
  const component = library.components[machine.componentId || '']
  return (
    <section>
      <h3>{t('State')}</h3>
      <label>
        {t('Name')}
        <input value={state.name} onChange={name} maxLength={120} />
      </label>
      {component && (
        <label>
          {t('Show variant')}
          <StudioSelect value={state.variantId || ''} onChange={variant}>
            <option value="">{t('Default')}</option>
            {Object.values(component.variants).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </StudioSelect>
        </label>
      )}
      <DesignMachineActions
        label={t('On entry')}
        actions={state.entry}
        library={library}
        onChange={entry}
      />
      <button
        className="button subtle danger"
        disabled={state.id === machine.initial}
        onClick={remove}
      >
        {t('Delete state')}
      </button>
    </section>
  )
}
