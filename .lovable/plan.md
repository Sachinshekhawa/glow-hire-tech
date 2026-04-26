## Goal

Before the existing chat-based job creation runs, present the recruiter with a **mode picker** offering three ways to create a job:

1. **Chat-based** — current step-by-step Q&A flow (unchanged).
2. **Prompt-based** — recruiter writes one prompt describing the role; the system parses it into the same answer schema and generates the JD.
3. **Upload file** — recruiter uploads a JD (PDF / Word / Audio) **or** pastes copied content; the system extracts text and generates the JD.

After any of the three modes produces a JD, the flow continues into the existing **Client & Commercial questionnaire** phase (no change there).

---

## UX flow

`/create-job` will start on a new **Mode Selection** screen (no chat yet). Three large cards:

| Card | Icon | Subtitle |
|---|---|---|
| Chat with AI | `MessagesSquare` | Answer a few quick questions |
| Write a prompt | `Sparkles` | Describe the role in your own words |
| Upload / paste JD | `Upload` | PDF, Word, audio, or paste text |

Selecting a card advances to that mode. A "← Change mode" link in the header lets the user reset before the JD is generated.

### Mode 1 — Chat (existing)
No functional change. Just rendered when `mode === 'chat'`.

### Mode 2 — Prompt
- Single large `Textarea` ("e.g. *Senior Java developer, full-time, Bangalore, 2 openings, must know Spring & Kubernetes…*") + **Generate JD** button.
- On submit:
  1. Run the existing `extractAnswersFromText` against **all** active job questions (passing `currentQuestionId = null` so it considers every question).
  2. Apply extracted answers to the `answers` state.
  3. For any *required* question that wasn't extracted, fall back to a brief inline review panel listing those gaps as small inputs/pickers — user fills them and clicks **Generate JD**.
  4. Build the JD via existing `buildJD(...)` and transition into the **client phase** exactly like the chat flow does today.
- The same **Live Summary** sidebar with edit support is shown so the user can correct any auto-extracted answer before/after JD generation (reuses existing `EditAnswerDialog`).

### Mode 3 — Upload / Paste
- Tabbed area: **Upload file** | **Paste text**.
- **Upload tab**: drag-and-drop / file picker accepting `.pdf, .doc, .docx, .txt, .mp3, .wav, .m4a`.
  - Client-side text extraction:
    - `.txt` → read as text directly.
    - `.pdf` → use `pdfjs-dist` (already a common Vite-friendly lib; we'll add it).
    - `.docx` → use `mammoth` (browser build) to extract raw text.
    - `.doc` (legacy) and audio files → show a friendly message: "Audio/legacy `.doc` parsing isn't supported in the browser yet — please paste the text or upload as PDF/DOCX." (audio transcription would need a backend; out of scope for this mock).
  - Show file name, size, and a small "Remove" button after selection.
- **Paste tab**: large `Textarea` for raw pasted JD content.
- **Use this JD** button:
  1. Take the extracted/pasted text as the **JD body**.
  2. Run `extractAnswersFromText` to populate `answers` so downstream client phase + Live Summary still work and the JD is editable.
  3. Use the pasted text as the JD output **directly** (skip `buildJD`) — but offer a "Regenerate from extracted fields" toggle in the JD card for users who want the templated version.
  4. Transition into the **client phase**.

### After JD generation (all modes)
Same as today: client questionnaire chat → final summary → download internal sheet. No changes to that section.

---

## Implementation

### Files

**Edited**
- `src/pages/CreateJob.tsx` — add `mode` state (`'select' | 'chat' | 'prompt' | 'upload'`), render mode picker when `mode === 'select'`, render new `PromptMode` and `UploadMode` panels for the other two; existing chat UI runs only when `mode === 'chat'`. Hoist `answers`, `clientAnswers`, JD state, and the client-phase chat into the parent so all three modes share the same downstream flow.
- `src/data/answerExtractor.ts` — extend so `currentQuestionId` can be `null` (it already accepts `string | null`, just confirm) and tighten heuristics for free-text job-title capture from longer paragraphs (used by both prompt + upload modes).

**Created**
- `src/components/createjob/ModeSelect.tsx` — the three-card picker.
- `src/components/createjob/PromptMode.tsx` — prompt textarea, gap-filler review, generate button.
- `src/components/createjob/UploadMode.tsx` — upload + paste tabs, file parsing, "Use this JD" button.
- `src/lib/jdFileParser.ts` — async `extractTextFromFile(file: File): Promise<string>` switching on MIME / extension; uses `pdfjs-dist` for PDFs, `mammoth` for DOCX, `FileReader` for TXT, throws a friendly error for unsupported types.

**Dependencies (added via package install)**
- `pdfjs-dist` — PDF text extraction in browser.
- `mammoth` — DOCX text extraction in browser.

(No backend / no audio transcription in this iteration — audio + `.doc` show a "not supported in browser" notice with a paste-text fallback.)

### State & contracts in `CreateJob.tsx`

```ts
type Mode = 'select' | 'chat' | 'prompt' | 'upload';
const [mode, setMode] = useState<Mode>('select');
const [jdOverride, setJdOverride] = useState<string | null>(null); // populated by upload mode
```

- When `jdOverride` is set, the JD card renders that text and `downloadJD` exports it; otherwise it uses `buildJD(questions, answers)`.
- A "Regenerate from fields" button in the JD card flips `jdOverride` back to `null` and re-renders via `buildJD`.
- The client questionnaire phase reads `answers` and `clientAnswers` exactly as it does today — so it works identically across all three modes.

### Header

A small breadcrumb `Add Job › <Mode label>` with a **Change mode** ghost button (visible while `mode !== 'select'` and JD not yet finalized) that resets to `mode = 'select'` and clears `answers`, `messages`, `jdOverride`. After JD is generated and the client phase has started, the button is hidden to avoid losing the captured commercial answers.

---

## Notes

- Mode picker is purely client-side; no admin/system-behavior changes needed for this feature.
- Prompt-mode and upload-mode both feed into the same `answers` map, so the existing **Live Summary**, **Edit answer** dialog, and **client questionnaire** continue to work without modification.
- PDF parsing via `pdfjs-dist` is bundle-heavy (~1MB). We'll lazy-import it inside `jdFileParser.ts` so the mode picker and chat mode aren't impacted.
- Audio transcription is intentionally out of scope (would require an edge function + speech-to-text API). The UI shows a friendly notice and offers the paste fallback so the workflow is never blocked.