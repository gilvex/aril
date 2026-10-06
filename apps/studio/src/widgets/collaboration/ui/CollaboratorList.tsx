import { FollowPerson } from './FollowPerson.tsx'

import type { CollaboratorListProps } from '../types/collaboratorListProps.ts'
export function CollaboratorList({
  peers,
  connected,
  followId,
  onFollow,
  setPanel,
  profile,
}: CollaboratorListProps) {
  return (
    <div className="people-list" data-follow-controls>
      {[
        {
          profile,
          clientId: 'self',
          view: 'canvas',
          following: null,
        },
        ...peers,
      ].map((person) => (
        <FollowPerson
          key={person.clientId}
          person={person}
          connected={connected}
          followId={followId}
          onFollow={onFollow}
          setPanel={setPanel}
          profile={profile}
        />
      ))}
    </div>
  )
}
