# Loon config (public template)

Public Loon v3.1 profile **template** for `Gavin-L/loon-config`.

## Routing goals

- Mainland China services: DIRECT.
- AI (ChatGPT, Claude, Gemini, Grok): JP regional group.
- Microsoft (including Bing and account sign-in): HK regional group, with certain update/download hosts DIRECT.
- YouTube, GitHub, Discord: HK regional group.
- Each regional group selects among same-region nodes using auto latency test. Prefer low-multiplier nodes, then other same-region nodes as backup.
- Upwork, Labelbox and Alignerr: DIRECT.

## SECURITY — read before importing

`Loon.conf` contains **no active `[Remote Proxy]` subscription** and no private MITM certificate. This is deliberate.

**Do not commit to public GitHub:** airport subscription URLs or tokens, passwords, node credentials, CA .p12 certificate, CA passphrase, cookies, API keys, private endpoints. Git history retains deleted secrets; if accidentally committed, revoke/rotate them first.

**Important limitation:** remote-updating a complete Loon profile can replace local changes. Importing this public template without private nodes means there will be **no usable proxy nodes**. A subscription added to a remote profile locally is not guaranteed to persist after a full profile refresh. Back up and verify on your actual Loon version.

### Safest long-term setup

- Keep your operational main profile (including subscriptions) **private and local**.
- Host individual remote `*.list` rule files in GitHub, and subscribe to them in the local main profile's `[Remote Rule]` section with the appropriate local policy groups. Then future rule edits update from GitHub without exposing credentials. Changes to regional group definitions, filters or General settings still require a local main-profile update.
- Alternatively, use this template as an upstream reference and manually copy its changes into the private local profile.

## Repository setup

The repository is public and uses the `main` branch. Keep `Loon.conf`, `README.md`, and `.gitignore` under version control.

The Raw URL will then be:

`https://raw.githubusercontent.com/Gavin-L/loon-config/main/Loon.conf`

The Raw URL points to the public **template**, which has no operational node subscription. Do not use it as the sole active profile until you have a tested private-node setup.

## Source

Based on `Loon_AutoRegion_LowRate_MicrosoftHK_v3.1.conf`, 2026-11-10. Static check only, not a live Loon validation or real IP geolocation verification.