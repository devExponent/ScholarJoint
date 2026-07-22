<div align="center">

# 📖 Scholarjoint

**A role-based conference & journal management portal — built for Authors, Reviewers, and Conference Admins.**

*Submit abstracts, assign reviewers, collect feedback, and manage the whole review pipeline from one place.*

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is this?

Scholarjoint is the frontend for a full conference/journal submission and peer-review system. An academic conference has three kinds of people using it, and this app gives each one a purpose-built portal:

| Role | What they do |
|---|---|
| 🖋️ **Author** | Browses open conferences, submits abstracts with co-authors, tracks review status, submits full papers, pays fees |
| 🔍 **Reviewer** | Reviews the papers assigned to them, scores them against criteria, and submits structured feedback |
| 🛡️ **Admin** | Runs the conference — configures deadlines & tracks, accepts/rejects submissions, assigns reviewers, manages payments |

The interface is built to feel like a real, polished academic-journal product — not a generic admin dashboard template — with its own type system, design language, and a clean architecture that's ready to plug into a real backend when one exists.

---

## ✨ Features

**Multi-conference support** — Admins can run several conferences at once, each with its own deadlines, fees, and tracks. Authors only see conferences still open for abstract submission, sorted by soonest deadline.

**Full co-author workflow** — add, edit, reorder, and remove co-authors on a submission; assign a corresponding author; live word-count validation against each conference's own abstract length limit.

**End-to-end review pipeline** — Admin assigns a paper to one or more reviewers → reviewer sees it on their dashboard → submits scores, a recommendation, comments to the author, and confidential notes to the admin → Admin sees the review land in real time.

**Role-aware access** — Admins can browse into the Author and Reviewer sections too (matching how a real conference chair often *is* also a reviewer), with the sidebar and page context adapting to whichever section is being viewed.

**A UI that actually holds up at any screen size** — a sidebar that collapses on demand at any width (not just mobile) and remembers your preference, cards and forms that reflow instead of clipping text, and a mobile drawer nav.

**Full client-side validation** — password rules, required-field checks, ORCID/email format checks, duplicate co-author email detection, word-count limits — all enforced before anything hits the data layer.

---

## 🖥️ Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4, with a custom design token system (see `src/index.css`) |
| UI primitives | Hand-built, shadcn/ui-style components on top of Radix UI (`src/components/ui/`) |
| Icons | lucide-react |
| Data layer | A mock service layer (see [Architecture](#-architecture--the-mock-data-layer) below) — no backend required to run |

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

### Demo accounts

No backend, no passwords to remember — any password works for these three seeded accounts:

| Role | Email |
|---|---|
| Admin | `admin@scholarjoint.dev` |
| Reviewer | `reviewer@scholarjoint.dev` |
| Author | `author@scholarjoint.dev` |

### Other scripts

```bash
npm run build     # type-checks (tsc -b) then builds a production bundle
npm run preview   # serves the production build locally
npm run lint      # runs oxlint
```

---

## 🏗️ Architecture — the mock data layer

There's no backend yet, but the app isn't wired directly to fake data either — everything goes through one service layer:

```
src/services/api.ts
```

Every function in that file simulates a real network call: it fakes a bit of latency, reads/writes from a persisted store, and returns a Promise — exactly like a real `fetch()` call would. Every page in the app calls *these* functions, never the underlying mock data directly.

**Why this matters:** when a real backend exists, this is the *only file that needs to change*. Swap the body of each function for a real `fetch()` call to your API, keep the same function signature, and every page, loading state, and form in the app keeps working without modification.

The mock "database" itself persists to `localStorage` (not just in-memory), which means:
- Data survives a page refresh
- Actions in one browser tab (e.g. an Author submitting a paper) are visible in another tab (e.g. an Admin reviewing it) — genuinely useful for testing the full multi-role flow without a real backend
- If test data ever gets messy, run `window.__resetScholarjointMockData()` in the browser console to wipe it back to the original seed data

---

## 📁 Project structure

```
src/
├── types/            # Every shared TypeScript type (User, Submission, Review, Conference...)
├── data/mockDb.ts     # Seed data - the starting state before any user interaction
├── services/api.ts     # The mock service layer (see Architecture above)
├── context/            # Auth session state
├── routes/AppRoutes.tsx  # Every route in the app, grouped by role
├── components/
│   ├── ui/            # Design-system primitives (Button, Card, Table, Dialog, Select...)
│   ├── layout/          # AppLayout (sidebar + topbar) and route guarding
│   └── shared/          # Small reusable pieces (StatCard, status badges)
└── pages/
    ├── auth/           # Login, Register
    ├── author/          # Dashboard, New Submission, My Submissions, Payments...
    ├── reviewer/        # Dashboard, Assigned Papers, Review Form, Completed Reviews
    ├── admin/           # Dashboard, Manage Submissions/Reviewers/Conferences, Payments
    └── shared/          # Profile Settings (used by all three roles)
```

---

## 🗺️ Roadmap

Built and working today:

- ✅ Auth (register/login) with role-based routing
- ✅ Multi-conference creation & selection, scoped tracks & deadlines
- ✅ Abstract submission with full co-author management
- ✅ Reviewer assignment, structured review submission
- ✅ Admin decisions (accept/reject/request revision)
- ✅ Payments tracking (manual "mark as paid")
- ✅ Profile settings with full validation

Not yet built (natural next steps):

- ⬜ Full paper file upload (currently abstract-only; the pattern is identical to the abstract form, just add a file picker)
- ⬜ A "View Review" detail screen for Admin to read a submitted review's full content (currently shows status only)
- ⬜ Real, event-driven notifications (currently static sample data)
- ⬜ Bulk email tools, audit logs, data export
- ⬜ Real payment gateway integration

---

## 📄 License

Private project — not currently licensed for reuse.
