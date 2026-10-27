# Hosted-service legal readiness

Prepared 2026-10-14. Owner: Ali Aliyev (individual), Azerbaijan.
Public contact: skaneprime@gmail.com. Service is free. GilGil is a future name,
not an incorporated entity or current contracting party. No postal address supplied.

## Current delivery and status

`/legal` and its terms, privacy, storage and provider pages are **review drafts**, not
effective agreements or proof of compliance. EN/RU text lives in the i18n catalogs;
page structure lives in `pages/legal/config/legalDocuments.ts`. `/terms` and `/privacy`
also resolve without authentication. Sign-in and App settings link to the drafts.
No clickwrap, consent receipt, effective date or acceptance record is fabricated.
The Apache-2.0 source license was explicitly selected by the owner and is independent.

Do not remove the draft status merely because pages render correctly. This code change
does not register an entity, register a personal-data system, sign provider contracts,
verify tax obligations, or authorize cross-border transfers. A checkbox alone would
not resolve the Azerbaijani consent-form requirements.

## Before adopting the hosted policies

- [ ] Obtain Azerbaijani legal advice or authoritative guidance on the personal-data
      system's registration requirements and any applicable exemption. Record the outcome.
- [ ] Confirm processing grounds, disclosure and cross-border transfer requirements
      for each category, including Google sign-in, provider access, guests and collaborators.
      Establish the legally appropriate consent/withdrawal method where needed. Do not
      treat generic acceptance of Terms as privacy consent.
- [ ] Verify Vercel project regions and log retention, Supabase database/realtime
      regions, backups, support access and subprocessors in the actual accounts. Record
      applicable DPAs and lawful transfer arrangements; do not infer them from a vendor URL.
- [ ] Define and implement retention periods/criteria for accounts, deleted documents,
      snapshots, receipts, credentials, security logs, support email and backups. Confirm
      actual provider deletion behavior. Replace the draft's unresolved retention paragraph.
- [ ] Confirm operator correspondence address and any legally required public details.
      Do not publish a home address without the owner's decision. Update the operator if a
      company is incorporated; a future name is not a contracting entity.
- [ ] Confirm the proposed 18+ eligibility policy and intended markets. Assess obligations
      for any targeted EEA/UK or other market (including representative/DPA requirements,
      controller/processor roles and user rights) rather than claiming global compliance.
- [ ] Approve final Terms and Privacy wording, authoritative language, version and
      effective date. Archive immutable policy versions. Notify existing users of material
      terms before effect and obtain acceptance where required.
- [ ] Implement any required acceptance/consent workflow on both Google and guest entry,
      with server-verified version receipts, timestamp, minimal identity and withdrawal
      records. Avoid unnecessary IP retention. Do not accept client-supplied legal versions
      without server validation. Consent to optional processing must remain separate.
- [ ] Review Google Identity loading before interaction against applicable storage rules.
      If needed, gate loading until the user's choice. Audit production for platform-added
      analytics, tracking and headers; source-code absence is not proof none is enabled.
- [ ] Add final Privacy/Terms URLs to the Google OAuth consent-screen configuration and
      verify branding/domain ownership. Do not submit draft policies as finalized policies.
- [ ] Review contributed source, imported skills/media and notices before redistribution.
      Preserve upstream licenses. Confirm any personal business/tax registration obligations
      before commercial activity; do not invent subscription/refund terms for a free service.

## Practical privacy-request procedure

1. Receive requests at the published email, acknowledge receipt and record the request
   date, scope and applicable legal deadline. Use local legal advice for deadlines;
   do not assume every jurisdiction allows 30 days.
2. Verify identity proportionately using the existing account when possible. Never ask
   for passwords or agent tokens. Avoid collecting identity documents unnecessarily.
3. Identify account data, memberships, owned/shared workspaces, comments/history,
   invitations, sessions, agent credentials, provider records and backups. Workspace
   JSON export alone is not a complete personal-data response.
4. Protect other users' information and explain restrictions or legal holds. Establish
   ownership/transfer of shared content before removal; do not delete collaborators'
   work indiscriminately. Removal from a workspace is not complete account erasure.
5. Perform a reviewed, backed-up, scoped operation. Revoke active credentials and verify
   results, including account-wide tokens. No general deletion script is supplied here:
   an unsafe cross-workspace purge would threaten live user data.
6. Respond with what was done, any retained categories/reasons, backup expiry and appeal
   options. Keep a minimal request audit, applying the approved retention schedule.

For a security incident, restrict exposure, preserve proportionate evidence, identify
affected records and jurisdictions, and assess legal notification duties immediately.
Use private contact; do not publish credentials or user content in GitHub issues.

## Audited implementation facts

- `server/collaboration.ts`: HttpOnly SameSite=Strict authentication cookie, Secure on
  HTTPS; 30-day maximum age. Browser bearer token is also stored in localStorage.
- `server/identity.ts`, `server/postgresIdentity.ts`: identity, session and invitation
  records. Expiration is not equivalent to physical deletion.
- `server/store.ts`, `server/postgres.ts`: durable content and bounded histories.
- `features/googleSignIn/ui/GoogleSignIn.tsx`: Identity SDK loads when the configured
  sign-in control mounts, before button interaction.
- `public/sw.js`: public reconnect assets only; no API/workspace response cache.
- Browser preferences, drafts and tab state can remain after logout. External image
  URLs contact their hosts. Fonts are locally packaged.
- No advertising/analytics/payment SDK found in the application dependency and entry
  audit. Production platform configuration and logs remain separate verification items.
- Hosted providers: Vercel, Supabase, Google sign-in; public contact uses Gmail.
  User-connected external MCP/AI clients have their own practices.

## Sources for review (checked 2026-10-14)

- [Azerbaijan government legal documents and registration rules](https://www.e-gov.az/en/content/read/37)
- [Official publication of the personal-data law](https://idp.gov.az/az/law/143/parent/15)
  — review consent (article 8), disclosure (13), transfers (14), registration (15)
  and applicable exemptions with local counsel. Do not assume all systems are exempt.
- [Electronic Security Service guidance initiative](https://mincom.gov.az/en/media-en/news/ess-launches-project-on-personal-data-protection)
- [EDPB individual rights](https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en)
- [EDPB roles](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en)
- [EDPB international transfers](https://www.edpb.europa.eu/sme/be-compliant/international-data-transfers_en)
- [ICO storage and access technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-comply-with-the-pecr-rules/)
- [Google sign-in setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)
- [Vercel legal](https://vercel.com/legal), [Supabase legal](https://supabase.com/legal)
- [Apache license application guidance](https://www.apache.org/licenses/LICENSE-2.0)

Re-check law and vendor terms before adoption. This checklist records unresolved
operational work and supports professional review; it is not a legal opinion.
