import type { AdminSession } from "./api";

const STORAGE_KEY = "cineverso.admin.session";
const SESSION_EVENT = "cineverso:admin-session";

export function saveAdminSession(session: AdminSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getAdminSession(): AdminSession | null {
  const storedSession = localStorage.getItem(STORAGE_KEY);
  if (!storedSession) return null;

  try {
    const session = JSON.parse(storedSession) as AdminSession;

    if (
      !session.token ||
      !session.email ||
      new Date(session.expiraEm).getTime() <= Date.now()
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeToAdminSession(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}
