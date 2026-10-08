import type {
  Presence,
  RequirementDisclosure,
} from '@pomegranate/domain/collaboration'

export function latestRequirementDisclosure(
  requirementId: string | null,
  local: RequirementDisclosure | undefined,
  peers: Presence[],
  now = Date.now(),
) {
  let latest = local
  for (const peer of peers) {
    if (
      peer.view !== 'requirements' ||
      peer.requirement?.id !== requirementId ||
      now - peer.seenAt > 15000
    )
      continue
    const candidate = peer.requirement?.properties
    if (
      candidate &&
      (!latest ||
        candidate.version > latest.version ||
        (candidate.version === latest.version && candidate.id > latest.id))
    )
      latest = candidate
  }
  return latest
}
