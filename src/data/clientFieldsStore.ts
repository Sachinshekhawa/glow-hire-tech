import { ClientField, seedClientFields } from "./clientFields";

const STORAGE_KEY = "glohire.clientFields.v1";

export const loadClientFields = (): ClientField[] => {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [...seedClientFields].sort((a, b) => a.order - b.order);
    const parsed = JSON.parse(raw) as ClientField[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...seedClientFields].sort((a, b) => a.order - b.order);
    }
    return [...parsed].sort((a, b) => a.order - b.order);
  } catch {
    return [...seedClientFields].sort((a, b) => a.order - b.order);
  }
};

export const saveClientFields = (fields: ClientField[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch {
    // ignore
  }
};
