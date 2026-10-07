import { useMemo, useCallback } from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { DesignNumberInput } from './DesignNumberInput.tsx'
import { DesignAlignment } from './DesignAlignment.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import {
  isDesignContainer,
  designDescendants,
  reparentDesignElement,
} from '@pomegranate/domain/design'
export function DesignGeometry({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const frames = useMemo(
    () =>
      model.page.nodes.filter(
        (item) =>
          isDesignContainer(item) &&
          !designDescendants(model.page.nodes, [node.id]).has(item.id),
      ),
    [model.page.nodes, node.id],
  )
  const reparent = useCallback(
    (event: { target: { value: string } }) => {
      model.save(
        reparentDesignElement(
          model.page.nodes,
          node.id,
          event.target.value || undefined,
        ),
      )
    },
    [model, node.id],
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
      {model.selected.length === 1 && (
        <label>
          {t('Parent layer')}
          <StudioSelect
            aria-label={t('Parent layer')}
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
