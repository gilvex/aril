import type { DesignUsage } from '@pomegranate/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type LibraryUsageGroupProps = { entries: DesignUsage[]; model: DesignEditorModel; navigate: (use: DesignUsage) => void }
