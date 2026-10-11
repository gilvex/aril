import type { DesignLibrary, DesignUsage } from '@pomegranate/domain/designLibrary'
import type { DesignPage } from '@pomegranate/domain/design'
export type DesignLibraryGraphInput = {
  library: DesignLibrary
  pages: DesignPage[]
  usage: DesignUsage[]
  libraryQuery: string
  libraryKind: 'all' | 'component' | 'variable' | 'machine' | 'page'
  libraryAsset: string | null
}
