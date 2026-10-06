import type {
  Profile,
  RequirementPresence,
} from '@pomegranate/domain/collaboration'

export type RequirementViewer = {
  profile: Profile
  requirement: RequirementPresence
}
