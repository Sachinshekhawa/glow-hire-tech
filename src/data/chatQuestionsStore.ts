import { ChatQuestion, seedQuestions } from "./chatQuestions";

const STORAGE_KEY = "glohire.chatQuestions.v1";

export const loadQuestions = (): ChatQuestion[] => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [...seedQuestions].sort((a, b) => a.order - b.order);
    const parsed = JSON.parse(raw) as ChatQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...seedQuestions].sort((a, b) => a.order - b.order);
    }
    return [...parsed].sort((a, b) => a.order - b.order);
  } catch {
    return [...seedQuestions].sort((a, b) => a.order - b.order);
  }
};

export const saveQuestions = (questions: ChatQuestion[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
};
