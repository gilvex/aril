import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readStudioRoute } from '../src/shared/utils/readStudioRoute.ts'
import { studioRouteUrl } from '../src/shared/utils/studioRouteUrl.ts'

test('studio routes round-trip locations and preserve invitation hashes', () => {
  const route = {
    workspaceId: 'team/a & b',
    boardId: 'board/2',
    view: 'requirements' as const,
    canvasMode: 'wireframes' as const,
    requirementId: 'req#4',
  }
  const result = new URL(
    studioRouteUrl(
      'https://example.test/?source=bookmark#invite=secret',
      route,
    ),
    'https://example.test',
  )
  assert.deepEqual(readStudioRoute(result.pathname + result.search), route)
  assert.equal(result.pathname, '/w/team%2Fa%20%26%20b/requirements')
  assert.equal(result.hash, '#invite=secret')
  assert.equal(result.searchParams.get('source'), 'bookmark')
  assert.equal(
    studioRouteUrl(result.href, null),
    '/?source=bookmark#invite=secret',
  )
})

test('invalid views fall back to blueprint and leaving requirements clears selection from the URL', () => {
  assert.deepEqual(
    readStudioRoute('?workspace=default&view=invalid&canvas=invalid'),
    {
      workspaceId: 'default',
      boardId: undefined,
      view: 'canvas',
      canvasMode: 'canvas',
      requirementId: undefined,
    },
  )
  const href = studioRouteUrl(
    'https://example.test/?requirement=old&canvas=wireframes',
    { workspaceId: 'other', view: 'notes', canvasMode: 'canvas' },
  )
  assert.equal(href, '/w/other/notes')
})

test('canvas paths preserve board, wireframe mode, demo mode and legacy bookmarks', () => {
  const legacy = readStudioRoute(
    '?demo=1&workspace=default&view=canvas&board=a%2Fb&canvas=wireframes',
  )
  const path = studioRouteUrl('https://example.test/?demo=1', legacy)
  assert.equal(path, '/w/default/canvas/a%2Fb?demo=1&canvas=wireframes')
  assert.deepEqual(readStudioRoute(path), legacy)
  assert.equal(readStudioRoute('/w/default/design').view, 'design')
  assert.equal(readStudioRoute('/w/%FF/design').workspaceId, '')
})
