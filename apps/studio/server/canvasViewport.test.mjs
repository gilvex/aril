import test from 'node:test'
import assert from 'node:assert/strict'
import { observeCanvasViewport } from '../src/shared/utils/observeCanvasViewport.ts'
test('panel layout preserves screen coordinates, zoom, and subsequent manual panning', (t) => {
  let bounds = { left: 220, top: 48, width: 1000, height: 800 }
  let viewport = { x: 100, y: -80, zoom: 0.65 }
  let resized = () => {}
  let disconnected = false
  const observed = []
  const listeners = new Map()
  const ancestor = { parentElement: null }
  const element = {
    parentElement: ancestor,
    getBoundingClientRect: () => ({ ...bounds }),
  }
  const originalObserver = Object.getOwnPropertyDescriptor(
    globalThis,
    'ResizeObserver',
  )
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      constructor(callback) {
        resized = callback
      }
      observe(target) {
        observed.push(target)
      }
      disconnect() {
        disconnected = true
      }
    },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      addEventListener: (name, callback) => listeners.set(name, callback),
      removeEventListener: (name) => listeners.delete(name),
    },
  })
  t.after(() => {
    if (originalObserver)
      Object.defineProperty(globalThis, 'ResizeObserver', originalObserver)
    else Reflect.deleteProperty(globalThis, 'ResizeObserver')
    if (originalWindow)
      Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })
  const flow = {
    getViewport: () => viewport,
    setViewport: async (next) => {
      viewport = next
      return true
    },
  }
  const tracker = observeCanvasViewport(element, flow)
  const point = { x: 430, y: 280 }
  const screen = () => ({
    x: bounds.left + viewport.x + point.x * viewport.zoom,
    y: bounds.top + viewport.y + point.y * viewport.zoom,
  })
  const initial = screen()
  assert.deepEqual(observed, [element, ancestor])
  // Opening left/top docks and each animation frame keep the drawing still.
  for (const [left, top] of [
    [500, 48],
    [500, 300],
    [470, 300],
    [350, 200],
    [220, 48],
  ]) {
    bounds = { ...bounds, left, top }
    resized()
    assert.deepEqual(screen(), initial)
    assert.equal(viewport.zoom, 0.65)
  }
  viewport = { x: 360, y: 170, zoom: 1.4 }
  const moved = screen()
  bounds = { ...bounds, left: 48 }
  tracker.update()
  assert.deepEqual(screen(), moved)
  assert.equal(viewport.zoom, 1.4)
  // Right/bottom docks only change available space; they must not recenter.
  const beforeResize = { ...viewport }
  bounds = { ...bounds, width: 600, height: 400 }
  resized()
  assert.deepEqual(viewport, beforeResize)
  // Switching cached workspaces must not turn a hidden rect into a pan.
  bounds = { left: 0, top: 0, width: 0, height: 0 }
  resized()
  bounds = { left: 220, top: 48, width: 1000, height: 800 }
  resized()
  assert.deepEqual(viewport, beforeResize)
  tracker.disconnect()
  assert.equal(disconnected, true)
  assert.equal(listeners.size, 0)
})
