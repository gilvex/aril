import { useMemo } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import { readDesignPanelLayout } from '../utils/readDesignPanelLayout.ts'
export function useDesignDockMenu(
  model: DesignEditorModel,
  side: 'left' | 'right',
) {
  const { t } = useTranslation()
  const { patch, layersDocked, inspectorDocked, dockMode } = model
  return useMemo(
    () => [
      ...(['left', 'right', 'top', 'bottom'] as const).map((edge) => ({
        id: edge,
        label: t(
          {
            left: 'Dock panel left',
            right: 'Dock panel right',
            top: 'Dock panel top',
            bottom: 'Dock panel bottom',
          }[edge],
        ),
        run: () =>
          patch({
            ...(side === 'left'
              ? { layersDocked: edge }
              : { inspectorDocked: edge }),
            dockActive: side,
          }),
      })),
      {
        id: 'float',
        label: t('Undock panel'),
        run: () =>
          patch(
            side === 'left'
              ? { layersDocked: null }
              : { inspectorDocked: null },
          ),
      },
      {
        id: 'group',
        label: t(
          dockMode === 'tabs' ? 'Separate panels' : 'Group panels as tabs',
        ),
        separator: true,
        disabled: !layersDocked || layersDocked !== inspectorDocked,
        run: () =>
          patch({
            dockMode: dockMode === 'tabs' ? 'split' : 'tabs',
            dockActive: side,
          }),
      },
      {
        id: 'reset',
        label: t('Reset panel layout'),
        separator: true,
        run: () => patch({ ...readDesignPanelLayout(null), dockPreview: null }),
      },
    ],
    [t, patch, side, layersDocked, inspectorDocked, dockMode],
  )
}
