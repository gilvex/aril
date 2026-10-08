import type { DesignLibrary } from '../types/designLibrary.ts'
export function emptyDesignLibrary(): DesignLibrary {
  return { components: {}, collections: {}, variables: {}, machines: {} }
}
