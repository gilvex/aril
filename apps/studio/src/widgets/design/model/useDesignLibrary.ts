import { useCallback } from 'react'
import {
  createDesignComponent,
  instantiateDesignComponent,
  createExampleDesignLibrary,
  stepDesignMachine,
  type DesignLibrary,
  type DesignMachine,
} from '@pomegranate/domain/designLibrary'
import type { UseDesignLibraryProps } from '../types/useDesignLibraryProps.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
export function useDesignLibrary({
  design,
  update,
  library,
  state,
  page,
  selected,
  component,
  variant,
}: UseDesignLibraryProps) {
  const { patch } = state
  const { t } = useTranslation()
  const saveLibrary = useCallback(
    (next: DesignLibrary) => update({ ...design, library: next }),
    [design, update],
  )
  const openAsset = useCallback(
    (kind: 'component' | 'variables' | 'machine', id = '') => {
      patch({
        leftTab: 'library',
        libraryView: kind === 'component' ? 'canvas' : kind,
        componentId: kind === 'component' ? id : null,
        variantId: '',
        machineId: kind === 'machine' ? id : null,
        machineSelection: null,
        machineDrafts: {},
        selection: [],
        drafts: {},
        editingId: null,
        inspector: kind === 'machine',
        styles: false,
        simulation: null,
        libraryError: '',
      })
    },
    [patch],
  )
  const closeAsset = useCallback(
    () =>
      patch({
        componentId: null,
        machineId: null,
        simulation: null,
        libraryView: 'canvas',
        machineSelection: null,
        machineDrafts: {},
        selection: [],
        drafts: {},
        editingId: null,
      }),
    [patch],
  )
  const createComponent = useCallback(() => {
    if (!selected.length || Object.keys(library.components).length >= 100)
      return
    try {
      const asset = createDesignComponent(
        component && variant ? variant.nodes : page.nodes,
        selected.map((n) => n.id),
        crypto.randomUUID(),
        selected.length === 1 ? selected[0].name : t('New component'),
      )
      saveLibrary({
        ...library,
        components: { ...library.components, [asset.id]: asset },
      })
      openAsset('component', asset.id)
    } catch {
      patch({ libraryError: t('Select layers that fit within one component.') })
    }
  }, [
    selected,
    library,
    component,
    variant,
    page.nodes,
    saveLibrary,
    openAsset,
    patch,
    t,
  ])
  const insertComponent = useCallback(
    (id: string, variantId?: string) => {
      const asset = library.components[id]
      if (!asset) return
      const x = Math.min(
        1e6,
        Math.max(
          0,
          ...page.nodes.filter((n) => !n.parentId).map((n) => n.x + n.width),
        ) + 80,
      )
      const firstOrder = Math.max(-1, ...page.nodes.map((n) => n.order)) + 1
      const nodes = instantiateDesignComponent(
        asset,
        variantId || Object.keys(asset.variants)[0],
        crypto.randomUUID(),
        { x, y: 80 },
      ).map((n) => ({ ...n, order: n.order + firstOrder }))
      if (page.nodes.length + nodes.length > 500) {
        patch({ libraryError: t('This page has reached its layer limit.') })
        return
      }
      update({
        ...design,
        pages: (design.pages?.length ? design.pages : [page]).map((p) =>
          p.id === page.id ? { ...p, nodes: [...p.nodes, ...nodes] } : p,
        ),
      })
      patch({
        componentId: null,
        libraryView: 'canvas',
        selection: [nodes.find((n) => !n.parentId)!.id],
        inspector: !state.compact,
        styles: false,
      })
    },
    [library, page, design, update, patch, state.compact, t],
  )
  const addVariant = useCallback(() => {
    if (!component || !variant || Object.keys(component.variants).length >= 30)
      return
    const id = crypto.randomUUID()
    saveLibrary({
      ...library,
      components: {
        ...library.components,
        [component.id]: {
          ...component,
          variants: {
            ...component.variants,
            [id]: {
              ...structuredClone(variant),
              id,
              name: `${t('Variant')} ${Object.keys(component.variants).length + 1}`,
            },
          },
        },
      },
    })
    patch({ variantId: id, selection: [], drafts: {} })
  }, [component, variant, library, saveLibrary, patch, t])
  const addMachine = useCallback(() => {
    const id = crypto.randomUUID()
    const asset: DesignMachine = {
      id,
      name: t('New state machine'),
      initial: 'initial',
      states: {
        initial: { id: 'initial', name: t('Idle'), x: 80, y: 100, entry: [] },
      },
      transitions: {},
    }
    saveLibrary({ ...library, machines: { ...library.machines, [id]: asset } })
    openAsset('machine', id)
  }, [library, saveLibrary, openAsset, t])
  const updateMachine = useCallback(
    (machine: DesignMachine) => {
      saveLibrary({
        ...library,
        machines: { ...library.machines, [machine.id]: machine },
      })
      patch({ simulation: null })
    },
    [library, saveLibrary, patch],
  )
  const simulate = useCallback(
    (event?: string) => {
      if (!state.machineId || !library.machines[state.machineId]) return
      patch({
        simulation: stepDesignMachine(
          library,
          state.machineId,
          event ? state.simulation : null,
          event,
          state.variableModes,
        ),
      })
    },
    [state.machineId, state.simulation, state.variableModes, library, patch],
  )
  const example = useCallback(() => {
    const kit = createExampleDesignLibrary(crypto.randomUUID().slice(0, 8))
    saveLibrary({
      components: { ...library.components, ...kit.components },
      collections: { ...library.collections, ...kit.collections },
      variables: { ...library.variables, ...kit.variables },
      machines: { ...library.machines, ...kit.machines },
    })
    openAsset('component', Object.keys(kit.components)[0])
    patch({ layers: true })
  }, [saveLibrary, library, openAsset, patch])
  return {
    saveLibrary,
    openAsset,
    closeAsset,
    createComponent,
    insertComponent,
    addVariant,
    addMachine,
    updateMachine,
    simulate,
    example,
  }
}
