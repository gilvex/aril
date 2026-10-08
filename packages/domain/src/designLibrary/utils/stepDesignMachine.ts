import type { DesignLibrary } from '../types/designLibrary.ts'
import type { DesignSimulation } from '../types/designSimulation.ts'
import { designVariableValues } from './designVariableValues.ts'
export function stepDesignMachine(
  library: DesignLibrary,
  machineId: string,
  previous?: DesignSimulation | null,
  event?: string,
  modes: Record<string, string> = {},
): DesignSimulation {
  const machine = library.machines[machineId]
  if (!machine) throw new Error('Machine not found')
  const resetting =
    !previous ||
    previous.machineId !== machineId ||
    !machine.states[previous.stateId] ||
    !event
  const values = resetting
    ? designVariableValues(library, modes)
    : { ...previous.values }
  let stateId = resetting ? machine.initial : previous.stateId
  const trace = resetting ? [] : previous.trace.slice(-39)
  if (!resetting) {
    const candidates = Object.values(machine.transitions)
      .filter((t) => t.from === stateId && t.event === event)
      .sort((a, b) => a.id.localeCompare(b.id))
    const transition = candidates.find((t) => {
      const g = t.guard
      if (!g) return true
      const v = values[g.variableId]
      return g.operator === 'eq'
        ? v === g.value
        : g.operator === 'ne'
          ? v !== g.value
          : typeof v === 'number' &&
            typeof g.value === 'number' &&
            (g.operator === 'gt' ? v > g.value : v < g.value)
    })
    if (!transition)
      return {
        machineId,
        stateId,
        values,
        trace: [...trace, `${event}: ∅`],
      }
    for (const action of transition.actions)
      values[action.variableId] = action.value
    trace.push(
      `${event}: ${machine.states[stateId].name} → ${machine.states[transition.to].name}`,
    )
    stateId = transition.to
  }
  for (const action of machine.states[stateId].entry)
    values[action.variableId] = action.value
  return { machineId, stateId, values, trace }
}
