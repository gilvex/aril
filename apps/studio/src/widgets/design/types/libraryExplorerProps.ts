import type { DesignEditorModel } from './designEditorModel.ts'
import type { useLibraryExplorer } from '../model/useLibraryExplorer.ts'
export type LibraryExplorerProps = {
  model: DesignEditorModel
  explorer: ReturnType<typeof useLibraryExplorer>
}
