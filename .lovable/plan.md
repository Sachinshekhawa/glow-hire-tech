

## Goal

Reshape the **Admin → Clients & POCs** section so it no longer manages client/POC records (those come from the DB). Instead, it manages a configurable **Client Questionnaire** — the same admin pattern already used for chat-based job creation questions, but applied to client-level data captured per job (Client name, attached POC, Bill rate, Payment type, etc.).

The recruiter flow after JD generation will then ask these admin-defined questions in a chat-like step, with Client and POC pulled from the existing directory (read-only DB list).

---

## Changes

### 1. Admin page becomes a Client-Question manager
Replace `src/pages/ClientFieldsAdmin.tsx` with a question-management UI mirroring `SystemBehavior.tsx`:

- Rename route label to **"Client Questions"** (keep `/admin/client-fields` route to avoid breakage).
- Remove all "Add client", "Edit client", "Add POC" UI.
- Show a list of client questions with the same controls as job questions:
  - Text, input type, active toggle, required toggle, order (drag handle), conditions, suggested options.
- Special input types tailored to client data:
  - `client_picker` — select from existing DB clients (read-only list from `clientsStore`)
  - `poc_picker` — select POC, filtered by chosen client (depends on a prior `client_picker` answer)
  - `single_select`, `multi_select`, `free_text`, `number`, `currency` (for Bill rate)
- Seed questions: Client Name (`client_picker`, required), Attached POC (`poc_picker`, required), Bill Rate (`currency`), Payment Type (`single_select`: Hourly / Monthly / Fixed / Milestone), Payment Terms (`single_select`: Net 15 / Net 30 / Net 45 / Net 60), Contract Type (`single_select`: C2C / W2 / 1099 / Full-time), Start Date (`free_text`), Notes (`free_text`).

### 2. New data layer for client questions
- `src/data/clientQuestions.ts` — types (`ClientQuestion`, extended `InputType`), seed questions, AI suggestion helper.
- `src/data/clientQuestionsStore.ts` — `localStorage` persistence (mirrors `chatQuestionsStore.ts`).
- Keep `src/data/clients.ts` + `clientsStore.ts` as the **read-only DB source** for `client_picker`/`poc_picker`. No admin CRUD on these.

### 3. Recruiter flow: client questionnaire after JD
Update `src/pages/CreateJob.tsx`:
- After JD is generated, replace the current "Select Client / Select POC" cards with a **second chat phase** driven by active client questions.
- Same chat UX as job questions (pills, multi-select chips, free text, AI auto-extract via existing `answerExtractor` where applicable).
- `client_picker` renders a searchable list of existing clients from `clientsStore`.
- `poc_picker` renders POCs filtered by the selected client.
- Live summary card on the side (matching the job-question summary) with edit support per answered question.
- "Download internal sheet" exports the answered client questionnaire (not part of the JD markdown).

### 4. Shared admin nav
Update `src/pages/ClientFieldsAdmin.shared.tsx` label from "Clients & POCs" → **"Client Questions"** so the switcher in both admin pages reflects the new purpose.

---

## Technical notes

- Reuse the existing admin question component patterns from `SystemBehavior.tsx` (drag-and-drop via `dnd-kit`, condition builder, suggested-options editor) — extract a shared `<QuestionBoard>` component if it keeps both pages thin; otherwise duplicate the structure for clarity.
- Conditions support cross-question branching within the client questionnaire (e.g., show "Milestone schedule" only if Payment Type = Milestone).
- The `poc_picker` question implicitly depends on whichever `client_picker` answer was given earlier in the same questionnaire — resolved at runtime by reading prior answers, no manual condition needed.
- All persistence stays in `localStorage` (consistent with current mock setup); swapping to Supabase later is a drop-in for the store files.
- No changes to the JD generator — client answers are stored separately and only included in the internal-sheet export.

---

## Files

**Created**
- `src/data/clientQuestions.ts`
- `src/data/clientQuestionsStore.ts`

**Rewritten**
- `src/pages/ClientFieldsAdmin.tsx` (now a question manager, no client/POC CRUD)

**Edited**
- `src/pages/CreateJob.tsx` (replace selector cards with chat-driven client questionnaire)
- `src/pages/ClientFieldsAdmin.shared.tsx` (rename label)

**Unchanged but referenced**
- `src/data/clients.ts`, `src/data/clientsStore.ts` — used read-only as the DB source for client/POC pickers.

