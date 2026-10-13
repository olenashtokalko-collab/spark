# Spark client portal: research, MVP, IA and journeys

Prepared 9 Oct 2026 (Eleken). Inputs: the call with Hassan on 9 Oct 2026, the 8 Oct research dossier (`spark-research.html`), a live Waldo account, desk research and the visual references shared by the team.

Legend: **[Spark]** said by the Spark team · **[UX]** our recommendation from research · **[Later]** out of scope for the prototype.

---

## 1. UX research summary

The focus was on what changes product decisions, not on a full market report.

| Category | References | What we take | What we avoid |
|---|---|---|---|
| AI brand intelligence | Waldo (Strategize, Monitor), Jasper Brand IQ, Brandwatch Iris, WRITER Playbooks | The brand as the top-level object. Research shown as visible steps, with sources. A "launch next" nudge after a result. | Credits, 12–50 generic workflows, one-shot reports with no human follow-up (Waldo's agent asks how to "package" a chat, and there's no handoff). |
| Client portals for agencies | Moxo, Copilot/Assembly, AgencyPro, Basecamp client access | One home for files, requests and decisions. "What needs you" first. Per-person roles. An audit trail of who approved what. | A "flat portal where every login sees everything". Leaks pricing and internal talk. |
| Proposals | Qwilr, PandaDoc, Proposify, devtimate | The proposal as a web page, not a PDF: scope, timeline and investment you can comment on, and accept in one place. | Heavy e-signature or legal flows for an MVP. |
| Review and approval | Filestage, Ziflow, Frame.io | Versioned review (v1 → v2). Comments tied to a section. A clear **Approve / Request changes / Decline** decision with a timestamp. | Multi-stage routing builders. Overkill for one client and one agency. |
| AI chat with context and sources | Perplexity, ChatGPT search, Glean, Notion AI, Claude Projects | Visible "what I'm reading" steps. Numbered citations. Sources split into *your workspace* vs *web*. An honest "I don't have this, ask Spark" fallback. Suggested prompts instead of an empty box. | Hiding where facts come from. Raw AI output posing as final advice. |
| Social listening | Brandwatch, Sprout Social Listening, Brand24, Meltwater | A **weekly digest** that a person curated: volume, sentiment, top themes, notable posts, with alerts only when something needs action. | Real-time dashboards with dozens of charts. Clients don't run them, and the data source isn't confirmed. |

### Usability issues we design against
1. **Blank-page AI.** Clients "don't know what they want" (Hassan). Every entry point offers ready prompts tied to their brand.
2. **AI output with nowhere to go.** Every useful answer can become a request to Spark in one step.
3. **Status anxiety.** Clients can't tell what the agency is doing. Requests show a stage, an owner and a next date.
4. **Approval ambiguity.** "Was this signed off?" The decision, the version and the person are recorded and visible.
5. **Too many places.** Requests and proposals are one lifecycle, so they live in one place.

Sources: the 8 Oct dossier (Waldo first-hand, competitors, Mobbin patterns); [Assembly: agency client portals](https://assembly.com/blog/marketing-agency-client-portal); [Noloco: approval workflows in client portals](https://noloco.io/blog/client-portal-software-for-approval-workflows-in-2026); [Agiled: client portals for agencies](https://agiled.app/blog/best-client-portal-software-for-marketing-agencies); [Filestage vs Ziflow](https://filestage.io/filestage-vs-ziflow/); [Waldo listing (G2)](https://ai.g2.com/marketplace/tools/waldo).

---

## 2. Scope: discussed, recommended, deferred

### Discussed by Spark (call, 9 Oct)
- One brand per company "for start"; the client invites team members who can see the conversations and manage the team. **[Spark]**
- Spark uploads documents (proposals, visuals) for the client to view; shared folders; approvals. **[Spark]**
- A conversation with the model about the brand, possibly with examples or suggested checks ("background checks on your brand", "what others think"). **[Spark]**
- Submit a request from a conversation, including a selected part of it, so Spark can review it and come back with a proposal. **[Spark]**
- Social media monitoring as a Spark service, with results shown in the portal. **[Spark]**
- Waldo's APIs power the chat. Waldo is a concept reference, not a UI to copy. **[Spark]**
- A rebrand is coming next week. The portal is linked from the new website via login. **[Spark]**

### Recommended for the MVP (in the prototype)
- **Assistant as the landing page**; sidebar badges and notifications show what needs the client (Home was removed after review, 9 Oct). **[UX]**
- **AI Assistant** with suggested prompts, visible research steps, findings, and citations split into workspace and web. **[UX]**
- **Create request from chat**: pick the messages to include, and the request is prefilled. **[UX]**
- **Requests** as one lifecycle: Submitted → In review → Proposal → Approved → In progress → Delivered. **[UX]**
- **Proposal** as a web page with section comments, versions, and Approve / Request changes / Decline. **[UX]**
- **Documents** with folders, search, type filter, preview, download, upload, and "Ask about this file". **[UX]**
- **Monitoring**: a simple list of Spark's weekly summaries (no charts) until the open questions below are answered. **[Spark]** Brand profile and research pages were also removed; research reports stay in Documents.
- **Team**: client members, roles and invitations. **[Spark]** (roles are **[UX]**)
- **Notifications**: approvals, new proposals, new files, request updates. **[UX]**

### Deferred **[Later]**
- Multiple brands per company (the data model keeps `brandId` so a switcher can be added).
- A full Spark admin console (a client list, uploads to many clients, templates). Requests may be handled in another Spark system; to confirm.
- Real social-account connections, live listening, alerts by email/SMS, scheduled reports.
- E-signature, invoices and payments, contracts.
- Arabic / RTL (layout uses logical properties where cheap; not tested).
- Real-time co-editing, mentions, presence. Version compare for documents.
- SSO, audit export, granular folder permissions.

---

## 3. Roles

| Role | Who | Can |
|---|---|---|
| **Client owner** | Head of brand who signs off | Everything below, plus approve proposals, invite and remove people, change roles |
| **Client member** | Marketing team | Chat, create requests, comment, upload, view documents |
| **Client viewer** | Finance, leadership | View documents, proposals and requests; comment; no approvals |
| **Spark team** | Account lead, strategist | Review requests, send proposals and versions, upload documents (outside the prototype; may live in another system) |

---

## 4. Information architecture

We started from eight candidate sections and settled on a sidebar with **New chat** (plus chat history) and two sections, Requests and Documents. Team opens from the profile menu, Settings from a gear icon next to notifications. Chat history sits in the sidebar, like Waldo (option A, chosen 9 Oct over a History panel and a chats column).

```
Spark · Brand Co.                            (brand header; one brand for now)
├── Chats             landing page · chat (history with search in the sidebar, logo = new chat) · findings + sources · → request
├── Requests          list (filters) · request detail (stage, activity)
│     └── Proposal    review page · comments · decision · versions
├── Documents         folders · search/filter · preview · download · upload
Profile menu → Team   members · invitations · roles
Gear icon → Settings  notification preferences (theme lives in the profile menu)
Global: notifications bell, settings gear, profile menu (Team, theme, Log out)
```

Decisions:
- **Requests + Proposals merged.** A proposal always answers a request, so it lives inside the request. The "Needs your decision" filter, sidebar badge and notifications surface it.
- **Team and Settings live in the top bar**, not the sidebar: Team in the profile menu, Settings behind a gear icon. The sidebar keeps the daily work only.
- **Approvals aren't a section.** They are a state (badge, notification) that leads to the item.
- **AI is everywhere it's useful.** "Ask about this file" in Documents opens the Assistant with context.

---

## 5. Core journeys

| # | Journey | Path in the prototype |
|---|---|---|
| 1 | Understand status | Sidebar badges + notifications → Requests "Needs your decision" (proposal v2) and request stages |
| 2 | Ask about the brand | Assistant (landing page) → suggested prompt "How is our Riyadh launch being talked about?" |
| 3 | Answer with findings | Research steps → streamed answer → finding cards → numbered sources (workspace doc opens preview, web shows domain) |
| 4 | Turn it into a request | "Create request" under the answer → pick messages → title, type, timing → Submit → Request REQ-108 (Submitted) |
| 5 | Spark prepares a proposal | Not in the prototype: happens on Spark's side (possibly another system). The portal shows the result: status changes and the proposal |
| 6 | Review and decide | Back as client → notification → Proposal → comment on a section → Approve / Request changes / Decline |
| 7 | Find a document | Documents → folder → search/filter → preview → Download; or Ask about this file |
| 8 | Invite the team | Team → Invite → emails + role + note → pending invitation (resend / revoke) |

---

## 6. Social media monitoring: open questions for Hassan

Hassan named it ("a section about social media results… it checks the status, what's happening there, and gives them results"), but nothing about its form. The prototype leaves it out until these are answered:

**Must ask**
1. Is monitoring a separate paid service, or included for every client in the portal?
2. Where does the data come from: Waldo Monitor, another tool, or your team's own reports?
3. A live dashboard, or periodic reports from your team (weekly, monthly)?
4. What should a client see first: a summary, numbers, or examples of posts?
5. Which platforms matter: Instagram, TikTok, X, LinkedIn, Google reviews, news?
6. What should a client do with the results: ask the assistant, send a request to Spark, or just read?

**Good to ask**
7. Which metrics does your team report today (mentions, reach, sentiment, share of voice, competitors)?
8. Should clients compare themselves with competitors? Who picks them?
9. Do clients connect their own social accounts, or does Spark set it up?
10. Alerts for spikes (e.g. complaints)? By email or only in the portal?
11. Who reads it on the client side: the marketing team or management too?
12. Is it needed in the first version, or later?

**Best single ask:** an example of a monitoring report Spark sends clients today.

## 7. Assumptions (reversible)

- The client brand is a neutral placeholder: **Brand Co.**, a UAE consumer brand preparing a Riyadh launch. All people, numbers, competitors (A, B, C) and posts are invented.
- Currency AED; dates relative to 9 Oct 2026.
- AI answers are scripted for known prompts and fall back to an honest "not in your workspace" answer. Nothing calls an external API.
- Final branding will replace the neutral visual system through design tokens (see `src/styles/tokens.css`).
