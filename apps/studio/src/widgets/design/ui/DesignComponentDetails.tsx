import { useCallback, type ChangeEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignComponentDetails({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { component, variant, library, saveLibrary, patch, insertComponent } =
    model
  const rename = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!component || !variant || !e.target.value.trim()) return
      saveLibrary({
        ...library,
        components: {
          ...library.components,
          [component.id]:
            e.target.name === 'component'
              ? { ...component, name: e.target.value }
              : {
                  ...component,
                  variants: {
                    ...component.variants,
                    [variant.id]: { ...variant, name: e.target.value },
                  },
                },
        },
      })
    },
    [component, variant, library, saveLibrary],
  )
  const pick = useCallback(
    (e: SelectChange) =>
      patch({
        variantId: e.target.value,
        selection: [],
        drafts: {},
        editingId: null,
      }),
    [patch],
  )
  const insert = useCallback(() => {
    if (component && variant) insertComponent(component.id, variant.id)
  }, [component, variant, insertComponent])
  const remove = useCallback(() => {
    if (!component) return
    const components = { ...library.components }
    delete components[component.id]
    saveLibrary({ ...library, components })
    patch({ componentId: null, selection: [] })
  }, [component, library, saveLibrary, patch])
  if (!component || !variant) return null
  const used = Object.values(library.machines).some(
    (m) => m.componentId === component.id,
  )
  return (
    <fieldset
      disabled={readOnly}
      className="design-library-fields"
      data-collaboration-scope={`component:${component.id}`}
    >
      <legend>{t('Component')}</legend>
      <label>
        {t('Name')}
        <input
          name="component"
          value={component.name}
          onChange={rename}
          maxLength={120}
        />
      </label>
      <label>
        {t('Variant')}
        <StudioSelect value={variant.id} onChange={pick}>
          {Object.values(component.variants).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </StudioSelect>
      </label>
      <label>
        {t('Variant name')}
        <input
          name="variant"
          value={variant.name}
          onChange={rename}
          maxLength={120}
        />
      </label>
      <div className="design-library-buttons">
        <button
          className="button"
          onClick={model.addVariant}
          disabled={Object.keys(component.variants).length >= 30}
        >
          {t('Add variant')}
        </button>
        <button className="button primary" onClick={insert}>
          {t('Insert instance')}
        </button>
      </div>
      <button className="button subtle danger" disabled={used} onClick={remove}>
        {t('Delete component and detach instances')}
      </button>
    </fieldset>
  )
}
