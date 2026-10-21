import type { Idea } from '@aril/domain/workspace'
import type { IconLibraryOptionProps } from './iconLibraryOptionProps.ts'
export type IconLibraryFooterProps = { node: Idea; count: number; choose: IconLibraryOptionProps['choose'] }
