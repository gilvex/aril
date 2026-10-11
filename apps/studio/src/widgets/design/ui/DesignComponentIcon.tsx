import { useCallback, useMemo, type ChangeEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { ComponentGlyph } from './ComponentGlyph.tsx'
import { componentGlyph } from '../utils/componentGlyph.ts'
export function DesignComponentIcon({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { library, saveLibrary } = model
  const component = model.libraryAsset?.startsWith('component:')
    ? library.components[model.libraryAsset.slice(10)]
    : model.component
  const glyph = useMemo(
    () => (component ? componentGlyph(component) : []),
    [component],
  )
  const save = useCallback(
    (icon: string) => {
      if (component && !readOnly)
        saveLibrary({
          ...library,
          components: {
            ...library.components,
            [component.id]: { ...component, icon },
          },
        })
    },
    [component, library, saveLibrary, readOnly],
  )
  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => save(event.target.value),
    [save],
  )
  const automatic = useCallback(() => save(''), [save])
  if (!component) return null
  return (
    <div className="component-icon-editor">
      <label>
        {t('Component icon')}
        <input
          value={component.icon || ''}
          onChange={change}
          maxLength={12}
          disabled={readOnly}
          placeholder={t('Emoji or short symbol')}
        />
      </label>
      <div className="component-icon-choice">
        <span>
          <ComponentGlyph glyph={glyph} icon={component.icon} />
        </span>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          onClick={automatic}
          disabled={readOnly || !component.icon}
          aria-pressed={!component.icon}
        >
          {t('Automatic shape icon')}
        </Button>
      </div>
      <small>
        {t(
          'Leave empty to use the component silhouette. Updates with its design.',
        )}
      </small>
    </div>
  )
}
