import { Client, seedClients } from "./clients";

const STORAGE_KEY = "glohire.clients.v1";

export const loadClients = (): Client[] => {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return seedClients;
    const parsed = JSON.parse(raw) as Client[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedClients;
    return parsed;
  } catch {
    return seedClients;
  }
};

export const saveClients = (clients: Client[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {
    // ignore
  }
};
