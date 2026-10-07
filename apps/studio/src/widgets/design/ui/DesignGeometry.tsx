import { useMemo, useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { DesignNumberInput } from './DesignNumberInput.tsx'
import { DesignAlignment } from './DesignAlignment.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignGeometry({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const frames = useMemo(
    () => model.page.nodes.filter((item) => item.kind === 'frame'),
    [model.page.nodes],
  )
  const reparent = useCallback(
    (event: { target: { value: string } }) => {
      const oldParent = frames.find((item) => item.id === node.parentId)
      const newParent = frames.find((item) => item.id === event.target.value)
      model.edit({
        parentId: newParent?.id,
        x: node.x + (oldParent?.x || 0) - (newParent?.x || 0),
        y: node.y + (oldParent?.y || 0) - (newParent?.y || 0),
      })
    },
    [frames, model, node],
  )
  return (
    <section>
      <h3>{t('Layout')}</h3>
      <DesignAlignment model={model} />
      <div className="design-property-grid">
        <DesignNumberInput
          label="X"
          value={node.x}
          onChange={(x) => model.edit({ x })}
        />
        <DesignNumberInput
          label="Y"
          value={node.y}
          onChange={(y) => model.edit({ y })}
        />
        <DesignNumberInput
          label={t('Width')}
          value={node.width}
          min={16}
          max={6000}
          onChange={(width) => model.edit({ width })}
        />
        <DesignNumberInput
          label={t('Height')}
          value={node.height}
          min={16}
          max={6000}
          onChange={(height) => model.edit({ height })}
        />
      </div>
      {node.kind !== 'frame' && model.selected.length === 1 && (
        <label>
          {t('Frame')}
          <StudioSelect
            aria-label={t('Frame')}
            value={node.parentId || ''}
            onChange={reparent}
          >
            <option value="">{t('Canvas')}</option>
            {frames.map((frame) => (
              <option value={frame.id} key={frame.id}>
                {frame.name}
              </option>
            ))}
          </StudioSelect>
        </label>
      )}
    </section>
  )
}
