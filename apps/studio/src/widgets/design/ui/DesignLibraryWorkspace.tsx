import { Text } from '@/shared/ui/Text.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryWorkspace({ model }: DesignEditorProps) {
  return (
    <>
      {model.libraryError && (
        <Text as="p" className="design-library-error" role="alert">
          {model.libraryError}
        </Text>
      )}
    </>
  )
}
