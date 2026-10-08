import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveControlFocus } from '../src/features/controlPresence/utils/resolveControlFocus.ts'

// The portal lives outside the studio root. Model the DOM ownership contract
// exposed by Radix, including the aria-controls attribute only present when open.
function selectFixture() {
  const trigger = {
    controls: 'select-menu',
    getAttribute(name) {
      return name === 'aria-controls' ? this.controls : null
    },
    closest() {
      return null
    },
  }
  const document = {
    querySelectorAll(selector) {
      assert.equal(
        selector,
        '[role="combobox"][aria-expanded="true"][aria-controls]',
      )
      return trigger.controls ? [trigger] : []
    },
  }
  const menu = {
    id: 'select-menu',
    ownerDocument: document,
    closest() {
      return this
    },
  }
  const option = {
    ownerDocument: document,
    closest() {
      return menu
    },
  }
  return { trigger, menu, option, document }
}

test('open Select menu and options resolve focus to the trigger immediately', () => {
  const { trigger, menu, option } = selectFixture()
  assert.equal(resolveControlFocus(menu), trigger)
  assert.equal(resolveControlFocus(option), trigger)
  // Keyboard selection and mouse hover can focus different options in the portal.
  assert.equal(resolveControlFocus({ ...option }), trigger)
})

test('closing or detaching a Select never leaves stale popup focus', () => {
  const { trigger, option } = selectFixture()
  trigger.controls = null
  assert.equal(resolveControlFocus(option), null)
  assert.equal(resolveControlFocus(trigger), trigger)
  assert.equal(resolveControlFocus(null), null)
})

test('dropdown focus uses the exact owner, preserving its scope and privacy checks', () => {
  const { trigger, option, document } = selectFixture()
  const unrelated = {
    getAttribute() {
      return 'select-menu-other'
    },
  }
  document.querySelectorAll = () => [unrelated, trigger]
  assert.equal(resolveControlFocus(option), trigger)
  trigger.controls = 'select-menu-other'
  assert.equal(resolveControlFocus(option), null)
})

test('ordinary inputs retain their own focus and anonymous menus are ignored', () => {
  const input = {
    closest() {
      return null
    },
  }
  assert.equal(resolveControlFocus(input), input)
  const { menu, option } = selectFixture()
  menu.id = ''
  assert.equal(resolveControlFocus(option), null)
})
