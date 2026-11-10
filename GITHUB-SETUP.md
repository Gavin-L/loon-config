# Loon GitHub rule synchronization

### Status

- `Loon.conf`: original PUBLIC v3.1 template, unchanged. **No real subscription URLs; do not replace working Loon profile with it.**
- `Loon-Local-v3.2.conf`: one-time LOCAL bootstrap template with auto region policy groups and GitHub remote rules. **Do not use until you privately add your own airport subscriptions on the iPhone.**
- `rules/*.list`: independently updated GitHub rule subscriptions. These are the files you maintain for daily changes.
- `REMOTE-RULES.txt`: copyable `[Remote Rule]` section for an already working local Loon profile. The target strategy group names must exist in that profile.

### Recommended setup

1. Keep the original working Loon profile enabled, and back it up.
2. Download `Loon-Local-v3.2.conf` through a browser and import as a **local file**, not a managed remote profile.
3. In Loon, while still using the old working profile, open the new local file and enter your own subscription in `[Remote Proxy]` on device only; do not paste your secret URL to public GitHub or chat.
4. Verify node groups: Hong Kong/Japan/USA/Taiwan/Singapore. Check low-rate nodes and actual outbound regions. Confirm the rules are fetched successfully.
5. Only after connectivity tests, activate the new LOCAL profile.
6. Subsequent changes to `rules/*.list` on GitHub propagate through jsDelivr as Loon refreshes subscriptions. CDN caching means updates might not be instantaneous.

### Existing local profile alternative

Instead of importing a new profile, add the URLs from `REMOTE-RULES.txt` to the `[Remote Rule]` section of an existing configuration. However, **local [Rule] entries take precedence over remote rules**, and other remote lists may overlap; this can prevent GitHub rules taking effect. Ensure referenced group names exactly match existing names and remove or disable conflicting old remote lists, after backing up.

### Security

Never publish node/subscription URLs or token, private CA certificates/passwords, local operational profiles, or personally identifying data in this public repo. A `.gitignore` is a convenience, NOT a sufficient secret-protection mechanism. Verify changes in the commit diff before each push.

### Limitation

Publishing public rule lists alone cannot control the locally configured node selection regex, fallback graph, or DNS settings. Those are part of the local profile and need occasional local changes. This architecture optimizes for **rule updates**, not every future Loon setting.
