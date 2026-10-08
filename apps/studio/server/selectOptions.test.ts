import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement, Fragment } from 'react'
import { readSelectOptions } from '../src/shared/utils/readSelectOptions.ts'

test('Vagabond select preserves implicit text values, numeric values and an empty placeholder', () => {
  const options = readSelectOptions(
    createElement(
      Fragment,
      null,
      createElement('option', { value: '' }, 'Choose'),
      createElement('option', { value: 30 }, 'Thirty days'),
      createElement('option', null, 'DM Sans'),
      createElement('option', { value: 'draft', disabled: true }, 'Draft'),
    ),
  )
  assert.deepEqual(
    options.map(({ value }) => value),
    ['', '30', 'DM Sans', 'draft'],
  )
  assert.equal(options[3].disabled, true)
})

test('Vagabond select retains option group labels for board and requirement links', () => {
  const options = readSelectOptions([
    createElement(
      'optgroup',
      { key: 'boards', label: 'Boards' },
      createElement('option', { value: 'board:one' }, 'Architecture'),
    ),
    createElement(
      'optgroup',
      { key: 'requirements', label: 'Requirements' },
      createElement('option', { value: 'requirement:R01' }, 'Account access'),
    ),
  ])
  assert.deepEqual(
    options.map(({ value, group }) => ({ value, group })),
    [
      { value: 'board:one', group: 'Boards' },
      { value: 'requirement:R01', group: 'Requirements' },
    ],
  )
})
