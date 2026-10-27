# Licensing and third-party notices

Aril's original source code and documentation are licensed under [Apache-2.0](../LICENSE).
Copyright 2026 Ali Aliyev and contributors. See [NOTICE](../NOTICE).

The software license permits reuse subject to its actual terms; it is separate from
hosted-service policies. Private workspace content is not licensed by the repository
license. Third-party material keeps its own terms. Before importing code, media or skills,
check provenance and retain their license and attribution. Do not assume everything in a
public repository has the same license.

## Dependency notices

`apps/studio/public/third-party-notices.txt` contains installed production dependency
metadata and verbatim license/notice files across the workspace. Three packages include their license in README sections; react-remove-scroll-bar 2.3.8 omits its license text, so its upstream MIT license (retrieved 2026-10-14 from the author’s repository master branch) is preserved in `docs/licenses/`. This fallback is restricted to that version; verify upstream on upgrades. It is publicly
available at `/third-party-notices.txt`. Fonts retain their SIL Open Font Licenses;
Lucide includes upstream icon notices in its license file. The list is broader than
just the browser bundle and does not claim to be a binary-level bill of materials.

Regenerate after changing dependencies:

```sh
pnpm install --frozen-lockfile
node scripts/generateThirdPartyNotices.mjs
```

The script also copies LICENSE to `/license.txt`. It does not load `.env`, modify
user data, or access the studio backend. Review any reported missing license texts,
new license obligations and bundled media before redistribution. Do not use the
inventory as an automatic legal compatibility verdict. Build tooling and installed
skills may have separate notices; see [skill provenance](skills.md).

## Contributions

Submit only material you have authority to contribute. Contributions intentionally
submitted for inclusion are under Apache-2.0 as described in section 5, unless
explicitly stated otherwise and accepted separately. No copyright assignment is
required. Flag third-party or differently licensed content clearly before review.
