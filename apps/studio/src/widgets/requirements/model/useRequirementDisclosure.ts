import { useCallback, useEffect, useMemo } from 'react'
import type { Presence } from '@pomegranate/domain/collaboration'
import type { RequirementsState } from '../types/requirementsState.ts'
import { latestRequirementDisclosure } from '../utils/latestRequirementDisclosure.ts'

export function useRequirementDisclosure(
  id: string | null,
  properties: RequirementsState['properties'],
  peers: Presence[],
  setViewState: (patch: Partial<RequirementsState>) => void,
) {
  const local = id ? properties[id] : undefined
  const disclosure = useMemo(
    () => latestRequirementDisclosure(id, local, peers),
    [id, local, peers],
  )
  useEffect(() => {
    if (id && disclosure && disclosure !== local)
      setViewState({ properties: { ...properties, [id]: disclosure } })
  }, [id, disclosure, local, properties, setViewState])
  const toggleProperties = useCallback(() => {
    if (!id) return
    setViewState({
      properties: {
        ...properties,
        [id]: {
          open: !disclosure?.open,
          version: (disclosure?.version || 0) + 1,
          id: crypto.randomUUID(),
        },
      },
    })
  }, [id, properties, disclosure, setViewState])
  return {
    disclosure,
    propertiesOpen: disclosure?.open || false,
    toggleProperties,
  }
}
