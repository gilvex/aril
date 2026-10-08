import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignVariablesWorkspace } from './DesignVariablesWorkspace.tsx'
import { DesignMachineWorkspace } from './DesignMachineWorkspace.tsx'
export function DesignLibraryWorkspace({ model }: DesignEditorProps) {
  return (
    <>
      {model.libraryView === 'variables' && (
        <DesignVariablesWorkspace model={model} />
      )}
      {model.libraryView === 'machine' && (
        <DesignMachineWorkspace model={model} />
      )}
      {model.libraryError && (
        <p className="design-library-error" role="alert">
          {model.libraryError}
        </p>
      )}
    </>
  )
}
