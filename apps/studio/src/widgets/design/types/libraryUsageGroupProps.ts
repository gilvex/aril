import type { DesignUsage } from '@aril/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type LibraryUsageGroupProps = { entries: DesignUsage[]; model: DesignEditorModel; navigate: (use: DesignUsage) => void }
