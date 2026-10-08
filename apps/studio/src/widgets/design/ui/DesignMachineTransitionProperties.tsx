import { useCallback, type ChangeEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignMachine } from '@pomegranate/domain/designLibrary'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMachineActions } from './DesignMachineActions.tsx'
import { DesignMachineCondition } from './DesignMachineCondition.tsx'
export function DesignMachineTransitionProperties({
  model,
}: DesignEditorProps) {
  const { t } = useTranslation()
  const { library, updateMachine, patch } = model
  const machine = library.machines[model.machineId || '']
  const transition = machine?.transitions[model.machineSelection?.id || '']
  const edit = useCallback(
    (change: Partial<DesignMachine['transitions'][string]>) => {
      if (transition)
        updateMachine({
          ...machine,
          transitions: {
            ...machine.transitions,
            [transition.id]: { ...transition, ...change },
          },
        })
    },
    [transition, machine, updateMachine],
  )
  const event = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim()) edit({ event: e.target.value })
    },
    [edit],
  )
  const endpoint = useCallback(
    (e: SelectChange) => edit({ [e.target.name]: e.target.value }),
    [edit],
  )
  const actions = useCallback(
    (actions: DesignMachine['transitions'][string]['actions']) =>
      edit({ actions }),
    [edit],
  )
  const guard = useCallback(
    (guard: DesignMachine['transitions'][string]['guard']) => edit({ guard }),
    [edit],
  )
  const remove = useCallback(() => {
    if (!transition) return
    const transitions = { ...machine.transitions }
    delete transitions[transition.id]
    updateMachine({ ...machine, transitions })
    patch({ machineSelection: null })
  }, [transition, machine, updateMachine, patch])
  if (!transition) return null
  return (
    <section>
      <h3>{t('Transition')}</h3>
      <label>
        {t('Event')}
        <input value={transition.event} onChange={event} maxLength={80} />
      </label>
      {(['from', 'to'] as const).map((name) => (
        <label key={name}>
          {t(name === 'from' ? 'From state' : 'To state')}
          <StudioSelect
            name={name}
            value={transition[name]}
            onChange={endpoint}
          >
            {Object.values(machine.states).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </StudioSelect>
        </label>
      ))}
      <DesignMachineCondition
        guard={transition.guard}
        library={library}
        onChange={guard}
      />
      <DesignMachineActions
        label={t('Actions')}
        actions={transition.actions}
        library={library}
        onChange={actions}
      />
      <button className="button subtle danger" onClick={remove}>
        {t('Delete transition')}
      </button>
    </section>
  )
}
