# Atlas Team

**Atlas Team** is the employee portal for [Atlas](https://github.com/jefferspin669/ai-assistant-) (`ai-assistant`). It runs inside the same Atlas app — not a separate codebase.

| Experience | Who | Routes |
|------------|-----|--------|
| **Boss Atlas** | Owners, managers | `/app/*`, `/login` |
| **Atlas Team** | Employees | `/team`, `/team/login` |

Same backend. Same employees, tasks, messages, calendar, inventory, and Business Memory. The permission engine controls what each person sees.

## Quick start

```bash
npm install    # clones Atlas (ai-assistant) + applies Team overlay
npm run dev    # http://localhost:3000
```

- **Boss Atlas:** http://localhost:3000/login
- **Atlas Team:** http://localhost:3000/team/login

## How it connects to Atlas

This repo contains:

```
atlas-team/
├── atlas/                  ← git submodule → github.com/jefferspin669/ai-assistant-
├── overlay/                ← Atlas Team patches (routes, API, branding)
├── scripts/apply-team-overlay.mjs
└── package.json            ← runs Atlas via submodule
```

On `npm install`, the overlay is applied onto the Atlas submodule:

- **`/team`** routes → employee portal (`user-workspace.ts`)
- **`POST /api/employee/chat`** → Atlas Brain with employee permissions
- **Ask Atlas** in the employee UI → shared Atlas API + local fallback
- **Messages, tasks, schedule** → same data Boss Atlas uses in `/app/team`

To refresh after pulling Atlas updates:

```bash
git submodule update --remote atlas
npm run sync
```

## Upstreaming

Team integration patches in `overlay/` should eventually merge into `ai-assistant-`. Until then, this overlay keeps atlas-team in sync with upstream Atlas.

## Related

- Main Atlas repo: https://github.com/jefferspin669/ai-assistant-
