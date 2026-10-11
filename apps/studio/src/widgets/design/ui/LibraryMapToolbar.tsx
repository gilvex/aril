import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
export function LibraryMapToolbar({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const {
    patch,
    libraryPath,
    libraryFocus,
    libraryAsset,
    libraryDepth,
    libraryDirection,
  } = model
  const back = useCallback(
    () =>
      patch({
        libraryPath: libraryPath.slice(0, -1),
        libraryOffset: 0,
        libraryFocus: false,
        libraryAsset: null,
      }),
    [patch, libraryPath],
  )
  const focus = useCallback(
    () => patch({ libraryFocus: !libraryFocus, libraryOffset: 0 }),
    [patch, libraryFocus],
  )
  const clear = useCallback(
    () => patch({ libraryAsset: null, libraryFocus: false }),
    [patch],
  )
  const depth = useCallback(
    (e: SelectChange) =>
      patch({
        libraryDepth: Number(e.target.value) as 1 | 2,
        libraryOffset: 0,
      }),
    [patch],
  )
  const direction = useCallback(
    (e: SelectChange) =>
      patch({
        libraryDirection: e.target.value as typeof libraryDirection,
        libraryOffset: 0,
      }),
    [patch],
  )
  const details = useCallback(
    () => patch({ libraryDetailsOpen: true }),
    [patch],
  )
  const reset = useCallback(() => patch({ libraryPositions: {} }), [patch])
  return (
    <div className="library-map-toolbar">
      <div className="library-breadcrumb">
        {!!libraryPath.length && (
          <Button className="button" variant="ghost" size="sm" onClick={back}>
            {t('Previous')}
          </Button>
        )}
        <strong>{libraryPath.join(' / ') || t('All libraries')}</strong>
        <small>
          {t('{{count}} assets', { count: explorer.graph.matched })}
        </small>
      </div>
      <div className="library-map-options">
        {libraryAsset && (
          <>
            <Button
              className="button"
              variant="outline"
              size="sm"
              aria-pressed={libraryFocus}
              onClick={focus}
            >
              {t('Focus connections')}
            </Button>
            <Button
              className="button"
              variant="ghost"
              size="sm"
              onClick={clear}
            >
              {t('Clear focus')}
            </Button>
            <Button
              className="button"
              variant="ghost"
              size="sm"
              onClick={details}
            >
              {t('Asset details')}
            </Button>
          </>
        )}
        {libraryFocus && (
          <>
            <StudioSelect
              value={String(libraryDepth)}
              onChange={depth}
              aria-label={t('Connection depth')}
            >
              <option value="1">{t('1 connection away')}</option>
              <option value="2">{t('2 connections away')}</option>
            </StudioSelect>
            <StudioSelect
              value={libraryDirection}
              onChange={direction}
              aria-label={t('Connection direction')}
            >
              <option value="both">{t('Both directions')}</option>
              <option value="uses">{t('Uses assets')}</option>
              <option value="usedBy">{t('Used by')}</option>
            </StudioSelect>
          </>
        )}
        <Button className="button" variant="ghost" size="sm" onClick={reset}>
          {t('Reset layout')}
        </Button>
      </div>
    </div>
  )
}
