import { ClientQuestion, seedClientQuestions } from "./clientQuestions";

const STORAGE_KEY = "glohire.clientQuestions.v1";

export const loadClientQuestions = (): ClientQuestion[] => {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [...seedClientQuestions].sort((a, b) => a.order - b.order);
    const parsed = JSON.parse(raw) as ClientQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...seedClientQuestions].sort((a, b) => a.order - b.order);
    }
    return [...parsed].sort((a, b) => a.order - b.order);
  } catch {
    return [...seedClientQuestions].sort((a, b) => a.order - b.order);
  }
};

export const saveClientQuestions = (questions: ClientQuestion[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
};
