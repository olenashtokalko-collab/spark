# Spark client portal: implementation notes

What the prototype does, how it's built, and what it takes to make it production-ready.
Read with [01-product-definition.md](01-product-definition.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + static build in dist/ (works from any path, base: './')
```

No API keys or backend. All data is mock data, persisted to `localStorage` (`spark-portal-v4`).
The profile menu (top right) has *Team*, theme and *Log out* (opens a mock sign-in screen; *Continue* signs back in). To reset the demo data, clear the site's local storage.

## Demo script (≈5 minutes)

1. The portal opens on the **Assistant**. Sidebar badges show what needs attention (proposal v2 in Requests, a feedback request in Documents).
2. Click **Background check**: the assistant shows research steps, streams an answer, then findings with numbered citations and sources (workspace files open a preview; web sources are labelled sample data).
3. **Create request**: the form only (title, type, timing, brief, budget); the question and answer it came from are attached automatically. After sending, the success screen shows the reply time and a glass card with the question, answer and sources that went with the request; no Spark person is named. (Chosen 9 Oct over a review step, a side panel and an in-chat draft.)
4. The new request stays *Submitted*: Spark handles it outside the portal for now (see below).
5. Open **Requests → REQ-104** (proposal v2 is waiting) → comment on a section → **Approve** (with authorisation check), **Request changes** (note required) or **Decline** (reason).
6. **Requests → REQ-104** shows a two-version history; the proposal page has a v1/v2 switch and a "Changed from v1" summary.
7. **Documents → Creative → Ramadan 2027 packaging** → open *Packaging concepts* → send feedback. Upload a file (drag-and-drop or button; >25 MB is rejected).
8. **Team**: invite (token input, validation, external-domain warning), change roles, resend/revoke. **Settings**: notification preferences. Theme: profile menu.

## Screens

| Route | Screen | Key interactions | States |
|---|---|---|---|
| `#/`, `#/assistant/:id?` | Chats (landing) | Sidebar: logo / New chat → new chat, history of all workspace chats with search, author shown on teammates' chats (rename, delete); suggested prompts, streaming answer, findings, citations, sources, follow-ups, web toggle, create request, copy | Empty, thinking (live steps), streaming, done, error + retry (built, no longer triggerable from the UI), not found |
| `#/requests` | Requests | Filters (All / Needs your decision / In progress / Closed), search, new request | Empty per filter, no search results |
| `#/requests/:id` | Request | Stage stepper, next step, proposal card, brief, conversation excerpt, files, activity + comments, details, proposal history | Not found, every status |
| `#/requests/:id/proposal?v=` | Proposal | Version switch, diff vs previous, section comments, general comments, approve / request changes / decline, download | Awaiting, approved, declined, changes requested, superseded, no proposal |
| `#/documents/:folder?` | Documents | Folder tree, breadcrumbs, global search, type filter, grid/list, upload with progress, preview, download, ask about file | Loading skeleton, empty folder, no results, upload error |
| (dialog) | File preview | Paged documents, images, sheets, archives; download, ask, copy link, feedback (when requested) | Loading, no preview |
| `#/team` (profile menu) | Team | Invite, roles, remove, resend/revoke | Validation errors, pending invites |
| `#/settings` (gear icon) | Settings | Notification toggles (theme is in the profile menu) | — |

## Code structure

```
src/
  data/        types.ts (domain model) · mock.ts (seed) · assistant.ts (scripted AI)
  state/       store.tsx (workspace state + actions) · ui.tsx (global dialogs)
  lib/         router.ts (hash router) · format.ts (dates, money, sizes)
  components/  ui/ (Button, Badge, Avatar, Field, Tabs, Dialog, Popover, Menu, Toast, DotSphere…)
               domain.tsx (status pills, stages, file icons, generated artwork)
               layout/AppShell.tsx (sidebar, top bar, notifications, prototype controls)
  features/    home · assistant · requests (list, detail, proposal, dialogs) · documents · brand · team
  styles/      tokens.css (theme) · base.css (shell + primitives) · features.css
```

- **One state module.** Every user action is a named function in `store.tsx` (`ask`, `createRequest`, `sendProposal`, `decideProposal`, `uploadFiles`, `invite`…). These are the seams where API calls go.
- **Design tokens.** All colour, type and radius come from `tokens.css`. The accent (`--accent`) is a placeholder blue from the visual references, *not* a Spark brand colour. Swapping in the rebrand means editing that file (and the three font families).
- **Glow is reserved for AI.** It appears only on the focused/working composer, the AI's dot sphere, suggested-prompt hover and the current request stage.
- **Dependencies:** React 18, lucide-react (icons), Vite, TypeScript. No UI kit, router or state library.

## Data the backend must provide

| Entity | Fields (see `src/data/types.ts`) | Notes |
|---|---|---|
| Workspace / Brand | profile, audiences, voice, competitors, key dates | One brand per company for now; keep `brandId` on everything |
| Person, Invitation | name, email, title, org (client/spark), role (owner/member/viewer) | Spark staff are users with access to many workspaces |
| Conversation, Message | messages with `steps`, `findings`, `sources`, `followUps`, `suggestedRequest` | Stream text; send steps as events |
| Request | type, timing, budget, status, owner, next step, excerpt, sources, activity | Status machine: submitted → in_review → proposal ↔ changes_requested → approved → in_progress → delivered / declined |
| Proposal | version, scope, phases, investment, terms, valid until, decision, comments (with section) | Immutable once sent; new versions supersede |
| Folder, Doc | name, kind, size, uploader, version, request link, review (note, due, feedback) | Previews need a rendition service (PDF → images) |
| Notification | audience, kind, title, body, route, read | Plus email digest according to preferences |

## Integrations needed for production

1. **Auth and roles.** SSO or email magic link; workspace membership; server-side permission checks (owner approves, viewer read-only). Invites send real emails with expiring tokens.
2. **AI service (Waldo API, per Spark).** Map the response to `Message`: streamed text, tool/research steps, citations to workspace files and web URLs. Retrieval over the workspace (profile, documents, digests) needs an index with per-workspace isolation. Keep the honest "not in your workspace" fallback.
3. **Requests and proposals API.** Status transitions as server-side commands with audit log (who, when, which version). Notifications and email on each transition. Optional: PDF export of proposals; e-signature later.
4. **File storage.** Signed upload/download URLs, virus scan, size limits, versions, previews. The prototype's "Download" exports a preview copy, not the original.
5. **Monitoring.** Removed from the prototype; see the open questions in 01-product-definition.md §6.
6. **Spark side.** Not prototyped. Requests may go into another system Spark already uses (CRM, project tool), which then sends proposals and status updates back to the portal. To be confirmed with Spark before scoping an admin console.
7. **Analytics and observability.** Funnel: question → request → proposal → decision.

## Known limitations of the prototype

- AI answers are scripted by keyword; unknown questions get an honest fallback, not a real answer.
- "Web" sources and social posts are invented sample data and are labelled as such.
- Email notifications, sign-out and real file contents are not implemented.
- Arabic / RTL is not tested.
- Single brand only; no workspace switcher yet.
- Hot reload in dev can briefly log a context error after editing `store.tsx`; a page refresh clears it (not present in the built app).
