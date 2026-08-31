function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export { newId };

export const STORAGE_KEYS = {
  employees: "atlas-team-employees-v1",
  session: "atlas-team-session-v1",
  tasks: "atlas-team-tasks-v1",
  meetings: "atlas-team-meetings-v1",
  shifts: "atlas-team-shifts-v1",
  timeOff: "atlas-team-timeoff-v1",
  messages: "atlas-team-messages-v1",
  channels: "atlas-team-channels-v1",
  announcements: "atlas-team-announcements-v1",
  resources: "atlas-team-resources-v1",
  expenses: "atlas-team-expenses-v1",
  inventory: "atlas-team-inventory-v1",
  inventoryLogs: "atlas-team-inventory-logs-v1",
  notifications: "atlas-team-notifications-v1",
  seeded: "atlas-team-seeded-v1",
} as const;

export function loadSession(): string | null {
  return loadJson<string | null>(STORAGE_KEYS.session, null);
}

export function saveSession(employeeId: string): void {
  saveJson(STORAGE_KEYS.session, employeeId);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.session);
}
