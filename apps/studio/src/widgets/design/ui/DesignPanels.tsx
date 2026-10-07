import { DesignPanel } from './DesignPanel.tsx'
import { useCallback } from 'react'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignLayers } from './DesignLayers.tsx'
import { DesignInspector } from './DesignInspector.tsx'
import { DesignSettings } from './DesignSettings.tsx'
import type { DesignPanelsProps } from '../types/designPanelsProps.ts'
export function DesignPanels({
  model,
  design,
  update,
  compact,
}: DesignPanelsProps) {
  const { t } = useTranslation()
  const { patch } = model
  const close = useCallback(
    () => patch({ inspector: false, layers: false }),
    [patch],
  )
  const change = useCallback(
    (open: boolean) => {
      if (!open) close()
    },
    [close],
  )
  const closeInspector = useCallback(() => patch({ inspector: false }), [patch])
  const layers = model.layers && <DesignLayers model={model} />
  const inspector =
    model.inspector &&
    (model.styles ? (
      <DesignSettings
        design={design}
        update={update}
        colors={['#b34568', '#7955ad', '#386a92', '#307568', '#9c603a']}
        close={closeInspector}
      />
    ) : (
      <DesignInspector model={model} />
    ))
  const content = (
    <>
      {layers}
      {inspector}
    </>
  )
  if (!compact)
    return (
      <>
        {layers && (
          <DesignPanel model={model} side="left">
            {layers}
          </DesignPanel>
        )}
        {inspector && (
          <DesignPanel model={model} side="right">
            {inspector}
          </DesignPanel>
        )}
      </>
    )
  return (
    <StudioDrawer
      open={model.layers || model.inspector}
      onOpenChange={change}
      title={t(
        model.layers
          ? 'Layers'
          : model.styles
            ? 'Design defaults'
            : 'Design properties',
      )}
    >
      {content}
    </StudioDrawer>
  )
}
