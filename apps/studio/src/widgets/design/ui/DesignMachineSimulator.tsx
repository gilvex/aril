import { useCallback, useMemo, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { resolveDesignBindings } from '@pomegranate/domain/designLibrary'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMiniPreview } from './DesignMiniPreview.tsx'
import { DesignSimulationVariable } from './DesignSimulationVariable.tsx'
export function DesignMachineSimulator({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { simulation, library, simulate, patch } = model
  const machine = simulation
    ? library.machines[simulation.machineId]
    : undefined
  const state = simulation ? machine?.states[simulation.stateId] : undefined
  const component = machine?.componentId
    ? library.components[machine.componentId]
    : undefined
  const variant =
    component &&
    (component.variants[state?.variantId || ''] ||
      Object.values(component.variants)[0])
  const nodes = useMemo(
    () =>
      resolveDesignBindings(
        variant?.nodes || [],
        library,
        model.variableModes,
        simulation?.values,
      ),
    [variant, library, model.variableModes, simulation?.values],
  )
  const send = useCallback(
    (e: MouseEvent<HTMLButtonElement>) =>
      simulate(e.currentTarget.dataset.event),
    [simulate],
  )
  const reset = useCallback(() => simulate(), [simulate])
  const close = useCallback(() => patch({ simulation: null }), [patch])
  if (!simulation || !machine || !state) return null
  const events = [
    ...new Set(
      Object.values(machine.transitions)
        .filter((tr) => tr.from === state.id)
        .map((tr) => tr.event),
    ),
  ]
  return (
    <section className="design-machine-simulator">
      <header>
        <strong>
          {t('Simulation')} · {state.name}
        </strong>
        <span>{t('Local preview only')}</span>
        <button className="button" onClick={reset}>
          {t('Reset')}
        </button>
        <button
          className="icon-button"
          aria-label={t('Close simulation')}
          onClick={close}
        >
          <X size={16} />
        </button>
      </header>
      <div className="design-simulation-content">
        {variant && <DesignMiniPreview nodes={nodes} />}
        <div>
          <h3>{t('Send event')}</h3>
          <div className="design-library-buttons">
            {events.map((event) => (
              <button
                className="button"
                key={event}
                data-event={event}
                onClick={send}
              >
                {event}
              </button>
            ))}
          </div>
          <ol aria-label={t('Event trace')}>
            {simulation.trace.slice(-5).map((line, index) => (
              <li key={index}>
                {line.endsWith(': ∅')
                  ? `${line.slice(0, -1)}${t('No enabled transition')}`
                  : line}
              </li>
            ))}
          </ol>
        </div>
        <div>
          {Object.values(library.variables).map((v) => (
            <DesignSimulationVariable key={v.id} variable={v} model={model} />
          ))}
        </div>
      </div>
    </section>
  )
}
