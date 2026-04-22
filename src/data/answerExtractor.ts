import { ChatQuestion } from "./chatQuestions";

export type ExtractedAnswers = Record<string, string | string[]>;

/**
 * Lightweight rule-based extractor that scans a free-text utterance and
 * tries to auto-fill answers for as many ACTIVE questions as possible.
 *
 * It intentionally avoids the question the user is currently being asked
 * (the caller still wants to record that one normally) — but it WILL
 * detect answers for *other* downstream questions and return them so the
 * UI can pre-fill them.
 *
 * Heuristics:
 *  - For single_select / multi_select questions, look for any of the
 *    configured `options` mentioned in the text (case-insensitive, word
 *    boundary aware). multi_select returns an array of all matches.
 *  - For the job-title free-text question (q-1), capture the leading noun
 *    phrase before connectors like "with", "skilled in", "and", ",".
 *  - For numeric "positions" question (q-8), capture digits.
 *  - For employment type (q-5), match common variants like "full time",
 *    "part-time", "contract", "intern".
 *  - For "is this a technical role" yes/no (q-3), infer Yes if any
 *    technical skill option is mentioned.
 */
export const extractAnswersFromText = (
  text: string,
  questions: ChatQuestion[],
  currentQuestionId: string | null,
): ExtractedAnswers => {
  const out: ExtractedAnswers = {};
  const raw = text.trim();
  if (!raw) return out;
  const lower = raw.toLowerCase();

  const matchOption = (opt: string) => {
    const o = opt.toLowerCase().trim();
    if (!o) return false;
    // word boundary match — escape regex specials in the option
    const escaped = o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    return re.test(lower);
  };

  for (const q of questions) {
    if (!q.active) continue;
    if (q.id === currentQuestionId) continue;

    if (q.inputType === "single_select" || q.inputType === "multi_select") {
      const hits = q.options.filter(matchOption);
      if (hits.length === 0) continue;
      if (q.inputType === "single_select") {
        out[q.id] = hits[0];
      } else {
        out[q.id] = hits;
      }
      continue;
    }

    // Free-text heuristics by question id
    if (q.id === "q-1") {
      // Job title — take the phrase up to the first connector
      const m = raw.match(
        /^\s*(?:hiring (?:a |an )?|need (?:a |an )?|looking for (?:a |an )?)?([A-Za-z][A-Za-z0-9 +#./-]*?)(?=\s+(?:with|skilled|skills|and|,|for|in\s+(?:python|react|java|node|aws)|—|-)|\s*$)/i,
      );
      if (m && m[1] && m[1].trim().length >= 2) {
        out[q.id] = m[1].trim();
      }
      continue;
    }

    if (q.id === "q-8") {
      // Open positions — find a small integer
      const m = raw.match(/\b(\d{1,3})\s*(?:positions?|openings?|seats?|roles?|hires?)\b/i);
      if (m) out[q.id] = m[1];
      continue;
    }
  }

  // Cross-inference: if any technical skill option from q-4 was matched,
  // also infer q-3 = Yes
  const q4 = questions.find((q) => q.id === "q-4");
  const q3 = questions.find((q) => q.id === "q-3");
  if (
    q3 &&
    q3.active &&
    q3.id !== currentQuestionId &&
    out["q-3"] == null &&
    q4 &&
    Array.isArray(out["q-4"]) &&
    (out["q-4"] as string[]).length > 0
  ) {
    const yes = q3.options.find((o) => o.toLowerCase() === "yes");
    if (yes) out["q-3"] = yes;
  }

  return out;
};
