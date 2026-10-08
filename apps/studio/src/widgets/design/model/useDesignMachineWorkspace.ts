import { useCallback, useMemo } from 'react'
import {
  MarkerType,
  Position,
  type Connection,
  type NodeChange,
  type Node,
  type Edge,
} from '@xyflow/react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'

export function useDesignMachineWorkspace({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const machine = model.machineId
    ? model.library.machines[model.machineId]
    : undefined
  const { updateMachine, patch, machineDrafts } = model
  const nodes = useMemo<Node[]>(
    () =>
      machine
        ? Object.values(machine.states).map((state) => ({
            id: state.id,
            position: machineDrafts[state.id] || { x: state.x, y: state.y },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            data: {
              label: `${state.id === machine.initial ? '● ' : ''}${state.name}`,
            },
            selected:
              model.machineSelection?.kind === 'state' &&
              model.machineSelection.id === state.id,
            className:
              model.simulation?.machineId === machine.id &&
              model.simulation.stateId === state.id
                ? 'design-state-active'
                : '',
            style: {
              width: 180,
              background: 'var(--surface)',
              color: 'var(--text-strong)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: 20,
            },
          }))
        : [],
    [machine, model.machineSelection, model.simulation, machineDrafts],
  )
  const edges = useMemo<Edge[]>(
    () =>
      machine
        ? Object.values(machine.transitions).map((tr) => ({
            id: tr.id,
            source: tr.from,
            target: tr.to,
            label: tr.event,
            selected:
              model.machineSelection?.kind === 'transition' &&
              model.machineSelection.id === tr.id,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'var(--accent)' },
            labelStyle: { fill: 'var(--text-strong)' },
            labelBgStyle: { fill: 'var(--surface)' },
          }))
        : [],
    [machine, model.machineSelection],
  )
  const add = useCallback(() => {
    if (!machine) return
    const id = crypto.randomUUID()
    updateMachine({
      ...machine,
      states: {
        ...machine.states,
        [id]: {
          id,
          name: `${t('State')} ${Object.keys(machine.states).length + 1}`,
          x: 80 + (Object.keys(machine.states).length % 3) * 280,
          y: 100 + Math.floor(Object.keys(machine.states).length / 3) * 170,
          entry: [],
        },
      },
    })
    patch({ machineSelection: { kind: 'state', id }, inspector: true })
  }, [machine, updateMachine, patch, t])
  const changes = useCallback(
    (changes: NodeChange[]) => {
      if (!machine || readOnly) return
      const positions = { ...machineDrafts }
      let commit = false
      let changed = false
      for (const c of changes)
        if (c.type === 'position' && c.position) {
          positions[c.id] = c.position
          commit ||= c.dragging === false
          changed = true
        }
      if (!changed) return
      patch({ machineDrafts: commit ? {} : positions })
      if (commit)
        updateMachine({
          ...machine,
          states: Object.fromEntries(
            Object.entries(machine.states).map(([id, state]) => [
              id,
              { ...state, ...positions[id] },
            ]),
          ),
        })
    },
    [machine, readOnly, updateMachine, patch, machineDrafts],
  )
  const connect = useCallback(
    (c: Connection) => {
      if (!machine || readOnly || !c.source || !c.target) return
      const id = crypto.randomUUID()
      updateMachine({
        ...machine,
        transitions: {
          ...machine.transitions,
          [id]: {
            id,
            from: c.source,
            to: c.target,
            event: 'EVENT',
            actions: [],
          },
        },
      })
      patch({ machineSelection: { kind: 'transition', id }, inspector: true })
    },
    [machine, readOnly, updateMachine, patch],
  )
  const stateClick = useCallback(
    (_e: unknown, node: Node) =>
      patch({
        machineSelection: { kind: 'state', id: node.id },
        inspector: true,
        styles: false,
      }),
    [patch],
  )
  const transitionClick = useCallback(
    (_e: unknown, edge: Edge) =>
      patch({
        machineSelection: { kind: 'transition', id: edge.id },
        inspector: true,
        styles: false,
      }),
    [patch],
  )
  const test = useCallback(() => model.simulate(), [model])
  return {
    machine,
    nodes,
    edges,
    add,
    changes,
    connect,
    stateClick,
    transitionClick,
    test,
    readOnly,
    t,
  }
}
