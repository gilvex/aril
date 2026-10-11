import type { z } from 'zod'
// Structural input type keeps validation independent of its inferred public schema.
import type { DesignLibraryInput } from '../types/designLibraryInput.ts'
export function validateDesignLibrary(
  library: DesignLibraryInput,
  context: z.RefinementCtx,
) {
  const fail = (message: string) =>
    context.addIssue({ code: 'custom', message })
  const matches = (type: string, value: unknown) =>
    type === 'color'
      ? typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
      : typeof value === type
  for (const entries of [
    library.components,
    library.collections,
    library.variables,
    library.machines,
  ])
    for (const [id, item] of Object.entries(entries))
      if (id !== item.id) fail('Library keys must match asset IDs')
  for (const component of Object.values(library.components))
    for (const [id, variant] of Object.entries(component.variants)) {
      if (
        id !== variant.id ||
        variant.nodes.filter((n) => !n.parentId).length !== 1 ||
        variant.nodes.some((n) => n.instance)
      )
        fail(
          'A component variant needs one root and cannot contain nested instances',
        )
    }
  for (const variable of Object.values(library.variables)) {
    const collection = library.collections[variable.collectionId]
    if (
      !collection ||
      collection.modes.some(
        (mode) => !matches(variable.type, variable.values[mode]),
      )
    )
      fail('Variable values must match their type and collection modes')
  }
  for (const machine of Object.values(library.machines)) {
    if (!machine.states[machine.initial])
      fail('Machine initial state is missing')
    for (const [id, state] of Object.entries(machine.states)) {
      if (state.id !== id) fail('State key must match its ID')
    }
    for (const [id, transition] of Object.entries(machine.transitions)) {
      if (
        transition.id !== id ||
        !machine.states[transition.from] ||
        !machine.states[transition.to]
      )
        fail('Transition state is missing')
    }
  }
}
