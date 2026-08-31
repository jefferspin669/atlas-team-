# Atlas Team

Employee portal for Atlas — the workforce-facing side of the platform.

When an employee signs in, Atlas detects their role and routes them to **Atlas Team**. Managers and owners use **Boss Atlas** (`/app/*` in the main Atlas repo). Same backend, same data, different interfaces — the permission engine controls what each person sees.

## Features

- **Today** — Greeting, tasks due, meetings, shift, announcements, reminders
- **Ask Atlas** — Permission-scoped employee AI assistant
- **My Work** — To Do / In Progress / Waiting / Completed task board
- **Schedule** — Shifts, meetings, deadlines, time off, company events
- **Time Off** — Request and track PTO
- **Messages** — DMs, team chats, project channels (shared with Boss Atlas)
- **Company Resources** — Handbook, policies, training, FAQs via Business Memory
- **Expenses** — Receipt scanning and submission
- **Inventory** — Use/receive inventory (permission-gated)
- **My Profile** — Employee info with locked company-controlled fields
- **Notifications** — Task, meeting, message, and approval alerts

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

### Demo account

| Name | Email | Code | Role |
|------|-------|------|------|
| Marcus Johnson | marcus@acme.local | MJ2024 | Field Technician |
| Sarah Chen | sarah@acme.local | SC2024 | Manager |
| Alex Rivera | alex@acme.local | AR2024 | Sales Rep |

## Architecture

```
Boss Atlas (/app/*)          Atlas Team (/today, /work, …)
        │                              │
        └──────── Same Atlas backend ──┘
                   Same employees
                   Same tasks
                   Same messages
                   Same Business Memory
                   Permission engine → what each role sees
```

Data is currently stored in `localStorage` for demo purposes. Production wiring connects to the shared Postgres backend in the main Atlas repo.

## Related

- Main Atlas app: [ai-assistant-](https://github.com/jefferspin669/ai-assistant-)
