// Every placeholder occurs once so the same statement works through SQLite's adapter.
export const invitationEligibility = `status='pending' AND expires_at>$1
AND EXISTS (SELECT 1 FROM studio.studios s WHERE s.id=workspace_id)
AND EXISTS (SELECT 1 FROM studio.members m WHERE m.workspace_id=studio.account_invitations.workspace_id AND m.user_id=created_by AND m.role='owner')
AND NOT EXISTS (SELECT 1 FROM studio.guest_profiles g WHERE g.user_id=$2)
AND ((recipient_id IS NOT NULL AND recipient_id=$3) OR (recipient_id IS NULL AND email IN (SELECT lower(email) FROM studio.accounts WHERE user_id=$4 AND email!='')))`
