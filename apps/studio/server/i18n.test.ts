import assert from 'node:assert/strict'
import { test } from 'node:test'
import { i18n } from '@/shared/i18n/config/i18n.ts'
import en from '../src/shared/i18n/locales/en.json' with { type: 'json' }
import ru from '../src/shared/i18n/locales/ru.json' with { type: 'json' }

test('language switching loads Russian and applies its plural rules', async () => {
  await i18n.changeLanguage('ru')
  assert.equal(i18n.t('boardCount', { count: 1 }), '1 доска')
  assert.equal(i18n.t('boardCount', { count: 2 }), '2 доски')
  assert.equal(i18n.t('boardCount', { count: 5 }), '5 досок')
  assert.equal(i18n.t('boardCount', { count: 21 }), '21 доска')
  assert.equal(i18n.t('Editing {{field}}', { field: 'Recipe <alpha>' }), 'Редактирует поле «Recipe <alpha>»')
  assert.equal(i18n.t('Untranslated server error'), 'Untranslated server error')
  await i18n.changeLanguage('en')
  assert.equal(i18n.t('boardCount', { count: 1 }), '1 board')
  assert.equal(i18n.t('boardCount', { count: 5 }), '5 boards')
})

test('locale catalogs contain matching messages and interpolation variables', () => {
  assert.deepEqual(Object.keys(ru).sort(), Object.keys(en).sort())
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.ok(ru[key].trim(), `${key} has an empty translation`)
    assert.deepEqual(ru[key].match(/{{[^}]+}}/g)?.sort(), en[key].match(/{{[^}]+}}/g)?.sort(), key)
  }
})
