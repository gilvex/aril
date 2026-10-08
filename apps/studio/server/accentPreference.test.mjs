import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { accentOptions } from '../src/shared/config/accentOptions.ts'
import { accentKey } from '../src/shared/config/accentKey.ts'
import { accentStore } from '../src/shared/model/accentStore.ts'
import { accentSlice } from '../src/shared/model/slices/accentSlice.ts'
import { initializeAccent } from '../src/shared/utils/initializeAccent.ts'
import { readAccentPreference } from '../src/shared/utils/readAccentPreference.ts'
import { setAccentPreference } from '../src/shared/utils/setAccentPreference.ts'

const bootstrap = readFileSync(
  new URL('../public/theme.js', import.meta.url),
  'utf8',
)
const css = readFileSync(
  new URL('../src/app/accent.css', import.meta.url),
  'utf8',
)

test('accent preference persists, syncs other tabs, and tolerates blocked storage', (t) => {
  const savedGlobals = new Map(
    ['localStorage', 'window', 'document'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  )
  const storage = new Map()
  const browser = new EventTarget()
  const document = { documentElement: { dataset: {} } }
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: browser,
  })
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: document,
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  })
  accentStore.dispatch(accentSlice.actions.changed('berry'))
  const cleanup = initializeAccent()
  t.after(() => {
    cleanup()
    for (const [key, descriptor] of savedGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  })
  setAccentPreference('blue')
  assert.equal(storage.get(accentKey), 'blue')
  assert.equal(document.documentElement.dataset.accent, 'blue')
  storage.set(accentKey, 'teal')
  browser.dispatchEvent(Object.assign(new Event('storage'), { key: accentKey }))
  assert.equal(document.documentElement.dataset.accent, 'teal')
  storage.set(accentKey, 'invalid')
  browser.dispatchEvent(Object.assign(new Event('storage'), { key: accentKey }))
  assert.equal(document.documentElement.dataset.accent, 'berry')
  setAccentPreference('violet')
  storage.clear()
  browser.dispatchEvent(Object.assign(new Event('storage'), { key: null }))
  assert.equal(document.documentElement.dataset.accent, 'berry')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('blocked')
    },
  })
  setAccentPreference('amber')
  assert.equal(document.documentElement.dataset.accent, 'amber')
  assert.equal(readAccentPreference(), 'berry')
  setAccentPreference('invalid')
  assert.equal(accentStore.getState().value, 'amber')
})

test('initial appearance restores supported accents and rejects invalid stored values', () => {
  for (const value of [
    ...accentOptions.map((option) => option.id),
    null,
    'invalid',
  ]) {
    const document = { documentElement: { dataset: {}, style: {} } }
    runInNewContext(bootstrap, {
      document,
      localStorage: { getItem: (key) => (key === accentKey ? value : 'dark') },
    })
    assert.equal(
      document.documentElement.dataset.accent,
      accentOptions.some((option) => option.id === value) ? value : 'berry',
    )
    assert.equal(document.documentElement.dataset.theme, 'dark')
  }
})

test('all presets have readable primary text and selected text in light and dark modes', () => {
  const luminance = (hex) => {
    const channels = hex
      .match(/[a-f0-9]{2}/gi)
      .map((pair) => parseInt(pair, 16) / 255)
      .map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      )
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05)
  for (const option of accentOptions) {
    const block =
      option.id === 'berry'
        ? ''
        : css.split(":root[data-accent='" + option.id + "']")[1].split('}')[0]
    const read = (name, fallback) =>
      block.match(new RegExp('--' + name + ': (#[a-f0-9]+)'))?.[1] ?? fallback
    assert.equal(read('accent-fill', '#b34568'), option.color)
    assert.ok(
      contrast(option.color, '#ffffff') >= 4.5,
      option.id + ' primary text',
    )
    assert.ok(
      contrast(option.color, read('accent-soft-light', '#f8edf1')) >= 4.5,
      option.id + ' light selection',
    )
    assert.ok(
      contrast(
        read('accent-text-dark', '#f0a1be'),
        read('accent-soft-dark', '#442b3b'),
      ) >= 4.5,
      option.id + ' dark selection',
    )
  }
})
