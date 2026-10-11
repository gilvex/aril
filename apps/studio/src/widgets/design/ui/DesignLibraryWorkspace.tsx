import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryWorkspace({ model }: DesignEditorProps) {
  return (
    <>
      {model.libraryError && (
        <p className="design-library-error" role="alert">
          {model.libraryError}
        </p>
      )}
    </>
  )
}
