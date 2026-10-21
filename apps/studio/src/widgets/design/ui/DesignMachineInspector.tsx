import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { SurfaceGrip, StudioSelect } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMachineStateProperties } from './DesignMachineStateProperties.tsx'
import { DesignMachineTransitionProperties } from './DesignMachineTransitionProperties.tsx'
export function DesignMachineInspector({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const machine = model.machineId
    ? model.library.machines[model.machineId]
    : undefined
  const { updateMachine, patch, library, saveLibrary } = model
  const close = useCallback(() => patch({ inspector: false }), [patch])
  const name = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (machine) updateMachine({ ...machine, name: e.target.value })
    },
    [machine, updateMachine],
  )
  const initial = useCallback(
    (e: SelectChange) => {
      if (machine) updateMachine({ ...machine, initial: e.target.value })
    },
    [machine, updateMachine],
  )
  const component = useCallback(
    (e: SelectChange) => {
      if (machine)
        updateMachine({
          ...machine,
          componentId: e.target.value || undefined,
          states: Object.fromEntries(
            Object.entries(machine.states).map(([id, s]) => [
              id,
              { ...s, variantId: undefined },
            ]),
          ),
        })
    },
    [machine, updateMachine],
  )
  const remove = useCallback(() => {
    if (!machine) return
    const machines = { ...library.machines }
    delete machines[machine.id]
    saveLibrary({ ...library, machines })
    patch({
      machineId: null,
      libraryView: 'canvas',
      machineSelection: null,
      simulation: null,
    })
  }, [machine, library, saveLibrary, patch])
  return (
    <aside className="design-inspector design-machine-inspector">
      <header>
        <SurfaceGrip />
        <Text as="strong">{t('Behavior')}</Text>
        <button
          className="icon-button"
          onClick={close}
          aria-label={t('Close properties')}
        >
          <X size={16} />
        </button>
      </header>
      {machine && (
        <fieldset
          disabled={readOnly}
          className="design-inspector-body"
          data-collaboration-scope={`machine:${machine.id}`}
        >
          <section>
            <Text as="h3">{t('State machine')}</Text>
            <Text as="label">
              {t('Name')}
              <input
                name="name"
                value={machine.name}
                onChange={name}
                maxLength={120}
              />
            </Text>
            <Text as="label">
              {t('Initial state')}
              <StudioSelect value={machine.initial} onChange={initial}>
                {Object.values(machine.states).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </StudioSelect>
            </Text>
            <Text as="label">
              {t('Preview component')}
              <StudioSelect
                value={machine.componentId || ''}
                onChange={component}
              >
                <option value="">{t('Standalone system')}</option>
                {Object.values(library.components).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </StudioSelect>
            </Text>
          </section>
          {model.machineSelection?.kind === 'state' && (
            <DesignMachineStateProperties model={model} />
          )}
          <Text> </Text>
          {model.machineSelection?.kind === 'transition' && (
            <DesignMachineTransitionProperties model={model} />
          )}
          <section>
            <button className="button subtle danger" onClick={remove}>
              <Text>{t('Delete state machine')}</Text>
            </button>
          </section>
          {model.libraryError && (
            <Text as="p" role="alert">
              {model.libraryError}
            </Text>
          )}
        </fieldset>
      )}
    </aside>
  )
}
