<div align="center">

# 📖 Scholarjoint

**A conference and journal management portal for the people who actually run one: admins, reviewers, and the authors submitting their work.**

*From "here's my abstract" to "congratulations, you're in the proceedings," all in one place.*

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## What is this?

Anyone who has organized an academic conference knows the process by heart even if they've never written it down: authors submit an abstract, someone decides whether it's worth a full paper, reviewers weigh in, and eventually a decision comes back, either an acceptance and an invoice, or a polite rejection.

Scholarjoint is that whole process, built into one portal. It's designed around three kinds of people, and the permissions between them stack on top of each other in a way that mirrors how conferences actually work: a Reviewer can do everything an Author can do, and an Admin can do everything a Reviewer can, since conference chairs are almost always reviewers themselves, and often submit their own work too.

| Role | What they can do |
|---|---|
| 🖋️ **Author** | Registers, submits an abstract with co-authors, edits or withdraws it before the deadline, submits the full paper once accepted, tracks every decision, pays fees, downloads receipts |
| 🔍 **Reviewer** | Everything an Author can do, plus: sees the papers assigned to them, downloads the file, scores it against a set of criteria, and writes feedback the author sees and notes only the admin sees |
| 🛡️ **Admin** | Everything a Reviewer can do, plus: configures the conference itself, opens and closes submissions, accepts or rejects papers, assigns reviewers, tracks payments, and manages the reviewer pool |

An Author never sees another author's submission or who's reviewing it. A Reviewer never sees who wrote the paper they're scoring, or what other reviewers said about it. Only the Admin sees the whole picture and makes the final call.

---

## A few terms worth knowing

**Conference.** The event itself, tracks, deadlines, and fees all belong to one.

**Track.** A subject area within a conference, like "AI & Ethics" or "Human-Computer Interaction." Authors pick one when they submit, which is how admins know who's qualified to review it.

**Abstract.** A short summary, usually 150 to 300 words, submitted before the full paper. Nothing gets a full paper review until the abstract clears first.

**Deadline.** Every deadline in the system carries a timezone, and once it passes, the door closes. No late submissions sneaking in.

**Affiliation.** An author's institution and department. Shows up next to their name everywhere their identity is visible.

---

## How a paper moves through the system

It starts with registration: name, email, a password with some real requirements, institution and department, country, and an optional ORCID. A verification email confirms the account before anyone can log in.

From there, an Author picks a conference that's still accepting abstracts, writes their summary, adds any co-authors (each one just metadata, no login of their own), and submits. The Admin sees it land on their dashboard alongside every other submission, and can accept it, reject it, or ask for a revision.

Once accepted, the Admin assigns it to one or more reviewers with relevant expertise. Each reviewer scores the paper on originality, clarity, contribution, and technical quality, writes comments the author will eventually see, and adds any confidential notes just for the Admin. The Admin decides how much of that feedback gets shared.

If the paper is accepted outright, the Author gets invited to submit the full version and pay the conference fee. Receipts, invoices, and a running history of every decision stay attached to the submission the whole way through.

---

## 🖥️ Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | React Router 7 |
| UI primitives | Hand-built, shadcn/ui style components on top of Radix UI (`src/components/ui/`) |
| Icons | lucide-react |

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

### Other scripts

```bash
npm run build     # type-checks (tsc -b) then builds a production bundle
npm run preview   # serves the production build locally
npm run lint      # runs oxlint
```

---

## 📁 Project structure

```
src/
├── types/            # Every shared TypeScript type (User, Submission, Review, Conference...)
├── data/mockDb.ts     # Seed data - the starting state before any user interaction
├── services/api.ts     # The data layer every page talks to
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
