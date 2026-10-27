import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type ChangeEvent } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignComponentIcon } from './DesignComponentIcon.tsx'
export function DesignComponentDetails({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { component, variant, library, saveLibrary, patch, insertComponent } =
    model
  const rename = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!component || !variant) return
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
  return (
    <fieldset
      disabled={readOnly}
      className="design-library-fields"
      data-collaboration-scope={`component:${component.id}`}
    >
      <Text as="legend">{t('Component')}</Text>
      <DesignComponentIcon model={model} />
      <Text as="label">
        {t('Name')}
        <input
          name="component"
          value={component.name}
          onChange={rename}
          maxLength={120}
        />
      </Text>
      <Text as="label">
        {t('Variant')}
        <StudioSelect value={variant.id} onChange={pick}>
          {Object.values(component.variants).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </StudioSelect>
      </Text>
      <Text as="label">
        {t('Variant name')}
        <input
          name="variant"
          value={variant.name}
          onChange={rename}
          maxLength={120}
        />
      </Text>
      <div className="design-library-buttons">
        <button
          className="button"
          onClick={model.addVariant}
          disabled={Object.keys(component.variants).length >= 30}
        >
          <Text>{t('Add variant')}</Text>
        </button>
        <button className="button primary" onClick={insert}>
          <Text>{t('Insert instance')}</Text>
        </button>
      </div>
      <button
        className="button subtle danger"
        disabled={readOnly}
        onClick={remove}
      >
        <Text>{t('Delete component and detach instances')}</Text>
      </button>
    </fieldset>
  )
}
