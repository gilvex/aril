import { useDesignVariables } from '../model/useDesignVariables.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignVariableTable } from './DesignVariableTable.tsx'
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
        <h2>{t('Variables')}</h2>
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
          disabled={readOnly || Object.keys(library.collections).length >= 30}
          onClick={addCollection}
        >
          {t('Add collection')}
        </button>
      </header>
      {collection ? (
        <>
          <div className="design-library-buttons">
            <label>
              {t('Preview mode')}
              <StudioSelect
                value={variableModes[collection.id] || collection.modes[0]}
                onChange={mode}
              >
                {collection.modes.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </StudioSelect>
            </label>
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
                {t('Add mode')}
              </button>
              <button
                className="button primary"
                disabled={Object.keys(library.variables).length >= 500}
                onClick={addVariable}
              >
                {t('Add variable')}
              </button>
            </div>
            <DesignVariableTable model={model} collection={collection} />
          </fieldset>
        </>
      ) : (
        <p>{t('Create a collection to add typed variables and modes.')}</p>
      )}
      {model.libraryError && (
        <p role="alert" className="design-library-error">
          {model.libraryError}
        </p>
      )}
    </div>
  )
}
