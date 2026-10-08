import type { DesignPage } from '../../design/types/designPage.ts'
export type DesignLibraryInput = {
  components: Record<
    string,
    { id: string; name: string; variants: Record<string, DesignPage> }
  >
  collections: Record<string, { id: string; name: string; modes: string[] }>
  variables: Record<
    string,
    {
      id: string
      name: string
      collectionId: string
      type: string
      values: Record<string, string | number | boolean>
    }
  >
  machines: Record<
    string,
    {
      id: string
      name: string
      componentId?: string
      initial: string
      states: Record<
        string,
        {
          id: string
          name: string
          x: number
          y: number
          variantId?: string
          entry: { variableId: string; value: string | number | boolean }[]
        }
      >
      transitions: Record<
        string,
        {
          id: string
          from: string
          to: string
          event: string
          guard?: {
            variableId: string
            operator: string
            value: string | number | boolean
          }
          actions: { variableId: string; value: string | number | boolean }[]
        }
      >
    }
  >
}
