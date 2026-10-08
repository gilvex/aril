import { makeDesignElement } from '../../design/utils/makeDesignElement.ts'
import type { DesignLibrary } from '../types/designLibrary.ts'
export function createExampleDesignLibrary(prefix: string): DesignLibrary {
  const componentId = `${prefix}-button`,
    collectionId = `${prefix}-theme`,
    colorId = `${prefix}-accent`,
    busyId = `${prefix}-busy`,
    machineId = `${prefix}-deploy`
  const button = makeDesignElement('button', `${prefix}-button-root`, {
    name: 'Deploy button',
    x: 0,
    y: 0,
    width: 180,
    height: 44,
    text: 'Deploy server',
    fill: '#b54469',
    color: '#ffffff',
    radius: 8,
    bindings: { fill: colorId },
  })
  return {
    components: {
      [componentId]: {
        id: componentId,
        name: 'Deploy button',
        variants: {
          idle: { id: 'idle', name: 'Default', nodes: [button] },
          loading: {
            id: 'loading',
            name: 'Loading',
            nodes: [{ ...button, text: 'Deploying…' }],
          },
          success: {
            id: 'success',
            name: 'Success',
            nodes: [
              { ...button, text: 'Deployed', fill: '#307568', bindings: {} },
            ],
          },
        },
      },
    },
    collections: {
      [collectionId]: {
        id: collectionId,
        name: 'Theme',
        modes: ['Light', 'Dark'],
      },
    },
    variables: {
      [colorId]: {
        id: colorId,
        name: 'color/action/primary',
        collectionId,
        type: 'color',
        values: { Light: '#b54469', Dark: '#d05d85' },
      },
      [busyId]: {
        id: busyId,
        name: 'busy',
        collectionId,
        type: 'boolean',
        values: { Light: false, Dark: false },
      },
    },
    machines: {
      [machineId]: {
        id: machineId,
        name: 'Deploy interaction',
        componentId,
        initial: 'idle',
        states: {
          idle: {
            id: 'idle',
            name: 'Idle',
            x: 40,
            y: 100,
            variantId: 'idle',
            entry: [{ variableId: busyId, value: false }],
          },
          loading: {
            id: 'loading',
            name: 'Loading',
            x: 360,
            y: 100,
            variantId: 'loading',
            entry: [{ variableId: busyId, value: true }],
          },
          success: {
            id: 'success',
            name: 'Success',
            x: 680,
            y: 100,
            variantId: 'success',
            entry: [{ variableId: busyId, value: false }],
          },
        },
        transitions: {
          start: {
            id: 'start',
            from: 'idle',
            to: 'loading',
            event: 'DEPLOY',
            guard: { variableId: busyId, operator: 'eq', value: false },
            actions: [],
          },
          ready: {
            id: 'ready',
            from: 'loading',
            to: 'success',
            event: 'READY',
            actions: [],
          },
          retry: {
            id: 'retry',
            from: 'loading',
            to: 'idle',
            event: 'ERROR',
            actions: [],
          },
          reset: {
            id: 'reset',
            from: 'success',
            to: 'idle',
            event: 'RESET',
            actions: [],
          },
        },
      },
    },
  }
}
