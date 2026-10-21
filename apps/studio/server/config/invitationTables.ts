export const invitationTables = `
CREATE TABLE IF NOT EXISTS studio.usernames (user_id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS studio.account_invitations (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, created_by TEXT NOT NULL,
 email TEXT NOT NULL, recipient_id TEXT, role TEXT NOT NULL,
 expires_at BIGINT NOT NULL, created_at BIGINT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending', delivery TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS account_invitations_recipient ON studio.account_invitations(email,status);
CREATE INDEX IF NOT EXISTS account_invitations_user ON studio.account_invitations(recipient_id,status);
CREATE INDEX IF NOT EXISTS account_invitations_workspace_email ON studio.account_invitations(workspace_id,email,status);
CREATE INDEX IF NOT EXISTS account_invitations_sender ON studio.account_invitations(created_by,created_at);
`
