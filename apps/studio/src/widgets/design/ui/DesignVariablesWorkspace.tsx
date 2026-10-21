import { Text } from '@/shared/ui/Text.tsx'
import { useDesignVariables } from '../model/useDesignVariables.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignVariableTable } from './DesignVariableTable.tsx'
import { DesignVariableFilters } from './DesignVariableFilters.tsx'
export function DesignVariablesWorkspace({ model }: DesignEditorProps) {
  const {
    t,
    readOnly,
    library,
    collection,
    pick,
    mode,
    rename,
    addCollection,
    addVariable,
    draft,
    addMode,
    variableModes,
  } = useDesignVariables({ model })
  return (
    <div className="design-library-workspace">
      <header>
        <Text as="h2">{t('Variables')}</Text>
        <StudioSelect
          value={collection?.id || ''}
          onChange={pick}
          aria-label={t('Collection')}
        >
          {Object.values(library.collections).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </StudioSelect>
        <button
          className="button"
          disabled={readOnly || Object.keys(library.collections).length >= 200}
          onClick={addCollection}
        >
          <Text>{t('Add collection')}</Text>
        </button>
      </header>
      <DesignVariableFilters model={model} />
      {collection ? (
        <>
          <div className="design-library-buttons">
            <Text as="label">
              {t('Preview mode')}
              <StudioSelect
                value={variableModes[collection.id] || collection.modes[0]}
                onChange={mode}
              >
                {collection.modes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </StudioSelect>
            </Text>
          </div>
          <fieldset
            disabled={readOnly}
            data-collaboration-scope={`variables:${collection.id}`}
          >
            <div className="design-variable-tools">
              <input
                value={collection.name}
                onChange={rename}
                aria-label={t('Collection name')}
                maxLength={120}
              />
              <input
                value={model.libraryModeDraft}
                onChange={draft}
                aria-label={t('New mode name')}
                placeholder={t('New mode name')}
                maxLength={80}
              />
              <button
                className="button"
                disabled={
                  !model.libraryModeDraft.trim() ||
                  collection.modes.length >= 10
                }
                onClick={addMode}
              >
                <Text>{t('Add mode')}</Text>
              </button>
              <button
                className="button primary"
                disabled={Object.keys(library.variables).length >= 5000}
                onClick={addVariable}
              >
                <Text>{t('Add variable')}</Text>
              </button>
            </div>
          </fieldset>
          <DesignVariableTable model={model} collection={collection} />
        </>
      ) : (
        <Text as="p">
          {t('Create a collection to add typed variables and modes.')}
        </Text>
      )}
      {model.libraryError && (
        <Text as="p" role="alert" className="design-library-error">
          {model.libraryError}
        </Text>
      )}
    </div>
  )
}
