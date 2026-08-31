import type {
  Announcement,
  CalendarEvent,
  Channel,
  Employee,
  Expense,
  InventoryItem,
  InventoryLog,
  Meeting,
  Message,
  Notification,
  Resource,
  Shift,
  Task,
  TaskComment,
  TimeOffRequest,
} from "./types";
import { loadJson, newId, nowIso, saveJson, STORAGE_KEYS } from "./store";
import { seedDemoData } from "./demo-data";

function ensureSeeded(): void {
  seedDemoData();
}

/* ─── Tasks ───────────────────────────────────────────────────────────── */

export function getTasksForEmployee(employeeId: string): Task[] {
  ensureSeeded();
  return loadJson<Task[]>(STORAGE_KEYS.tasks, []).filter((t) => t.assigneeId === employeeId);
}

export function saveTasks(tasks: Task[]): void {
  saveJson(STORAGE_KEYS.tasks, tasks);
}

export function updateTask(taskId: string, patch: Partial<Task>): Task | null {
  const tasks = loadJson<Task[]>(STORAGE_KEYS.tasks, []);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  tasks[idx] = { ...tasks[idx], ...patch, updatedAt: nowIso() };
  saveTasks(tasks);
  return tasks[idx];
}

export function startTask(taskId: string): Task | null {
  return updateTask(taskId, { status: "in_progress", progress: Math.max(10, 0) });
}

export function completeTask(taskId: string): Task | null {
  return updateTask(taskId, { status: "completed", progress: 100, blocked: false });
}

export function blockTask(taskId: string, reason: string): Task | null {
  return updateTask(taskId, { status: "waiting", blocked: true, blockReason: reason });
}

export function addTaskComment(taskId: string, author: Employee, text: string): Task | null {
  const tasks = loadJson<Task[]>(STORAGE_KEYS.tasks, []);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  const comment: TaskComment = {
    id: newId("comment"),
    authorId: author.id,
    authorName: author.name,
    text,
    createdAt: nowIso(),
  };
  tasks[idx].comments.push(comment);
  tasks[idx].updatedAt = nowIso();
  saveTasks(tasks);
  return tasks[idx];
}

/* ─── Meetings & Shifts ───────────────────────────────────────────────── */

export function getMeetingsForEmployee(employeeId: string): Meeting[] {
  ensureSeeded();
  return loadJson<Meeting[]>(STORAGE_KEYS.meetings, []).filter((m) => m.attendeeIds.includes(employeeId));
}

export function getShiftsForEmployee(employeeId: string): Shift[] {
  ensureSeeded();
  return loadJson<Shift[]>(STORAGE_KEYS.shifts, []).filter((s) => s.employeeId === employeeId);
}

export function getCalendarEvents(employee: Employee): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const shift of getShiftsForEmployee(employee.id)) {
    events.push({
      id: shift.id,
      title: `Shift — ${shift.location}`,
      startAt: `${shift.date}T${shift.startTime}:00`,
      endAt: `${shift.date}T${shift.endTime}:00`,
      type: "shift",
      employeeId: employee.id,
    });
  }

  for (const meeting of getMeetingsForEmployee(employee.id)) {
    events.push({
      id: meeting.id,
      title: meeting.title,
      startAt: meeting.startAt,
      endAt: meeting.endAt,
      type: "meeting",
    });
  }

  for (const task of getTasksForEmployee(employee.id)) {
    if (task.status !== "completed" && task.dueDate) {
      events.push({
        id: `deadline-${task.id}`,
        title: `Due: ${task.title}`,
        startAt: `${task.dueDate}T17:00:00`,
        endAt: `${task.dueDate}T17:00:00`,
        type: "deadline",
        employeeId: employee.id,
        allDay: true,
      });
    }
  }

  for (const pto of getTimeOffForEmployee(employee.id)) {
    if (pto.status === "approved") {
      events.push({
        id: `pto-${pto.id}`,
        title: `Time off — ${pto.type}`,
        startAt: `${pto.startDate}T00:00:00`,
        endAt: `${pto.endDate}T23:59:59`,
        type: "timeoff",
        employeeId: employee.id,
        allDay: true,
      });
    }
  }

  events.push({
    id: "event-allhands",
    title: "Q3 All-Hands",
    startAt: "2026-09-15T14:00:00",
    endAt: "2026-09-15T15:30:00",
    type: "event",
  });

  return events.sort((a, b) => a.startAt.localeCompare(b.startAt));
}

/* ─── Time Off ────────────────────────────────────────────────────────── */

export function getTimeOffForEmployee(employeeId: string): TimeOffRequest[] {
  ensureSeeded();
  return loadJson<TimeOffRequest[]>(STORAGE_KEYS.timeOff, []).filter((r) => r.employeeId === employeeId);
}

export function createTimeOffRequest(
  employeeId: string,
  input: { startDate: string; endDate: string; type: TimeOffRequest["type"]; note: string }
): TimeOffRequest {
  const requests = loadJson<TimeOffRequest[]>(STORAGE_KEYS.timeOff, []);
  const req: TimeOffRequest = {
    id: newId("pto"),
    employeeId,
    ...input,
    status: "pending",
    createdAt: nowIso(),
  };
  requests.push(req);
  saveJson(STORAGE_KEYS.timeOff, requests);
  return req;
}

/* ─── Messages ────────────────────────────────────────────────────────── */

export function getChannelsForEmployee(employeeId: string): Channel[] {
  ensureSeeded();
  return loadJson<Channel[]>(STORAGE_KEYS.channels, []).filter((c) => c.memberIds.includes(employeeId));
}

export function getMessages(channelId?: string): Message[] {
  ensureSeeded();
  const all = loadJson<Message[]>(STORAGE_KEYS.messages, []);
  if (!channelId) return all;
  return all.filter((m) => m.channelId === channelId);
}

export function sendMessage(channelId: string, sender: Employee, text: string): Message {
  const messages = loadJson<Message[]>(STORAGE_KEYS.messages, []);
  const msg: Message = {
    id: newId("msg"),
    channelId,
    senderId: sender.id,
    senderName: sender.name,
    text,
    createdAt: nowIso(),
  };
  messages.push(msg);
  saveJson(STORAGE_KEYS.messages, messages);
  return msg;
}

/* ─── Announcements ───────────────────────────────────────────────────── */

export function getAnnouncements(employee: Employee): Announcement[] {
  ensureSeeded();
  return loadJson<Announcement[]>(STORAGE_KEYS.announcements, []).filter(
    (a) => a.audience === "all" || a.department === employee.department
  );
}

/* ─── Resources ───────────────────────────────────────────────────────── */

export function getResources(): Resource[] {
  ensureSeeded();
  return loadJson<Resource[]>(STORAGE_KEYS.resources, []);
}

export function searchResources(query: string): Resource[] {
  const q = query.toLowerCase();
  return getResources().filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)
  );
}

/* ─── Expenses ────────────────────────────────────────────────────────── */

export function getExpensesForEmployee(employeeId: string): Expense[] {
  ensureSeeded();
  return loadJson<Expense[]>(STORAGE_KEYS.expenses, []).filter((e) => e.employeeId === employeeId);
}

export function createExpense(
  employee: Employee,
  input: { merchant: string; amount: number; date: string; category: string; project: string }
): Expense {
  const expenses = loadJson<Expense[]>(STORAGE_KEYS.expenses, []);
  const expense: Expense = {
    id: newId("exp"),
    employeeId: employee.id,
    employeeName: employee.name,
    ...input,
    status: "pending",
    createdAt: nowIso(),
  };
  expenses.push(expense);
  saveJson(STORAGE_KEYS.expenses, expenses);
  return expense;
}

export function sampleReceiptExtraction(): { merchant: string; amount: number; date: string } {
  return { merchant: "Home Depot", amount: 127.84, date: new Date().toISOString().slice(0, 10) };
}

/* ─── Inventory ───────────────────────────────────────────────────────── */

export function getInventory(): InventoryItem[] {
  ensureSeeded();
  return loadJson<InventoryItem[]>(STORAGE_KEYS.inventory, []);
}

export function useInventory(
  employee: Employee,
  itemId: string,
  quantity: number,
  reason: string
): InventoryItem | null {
  const items = loadJson<InventoryItem[]>(STORAGE_KEYS.inventory, []);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx < 0 || items[idx].quantity < quantity) return null;
  items[idx].quantity -= quantity;
  saveJson(STORAGE_KEYS.inventory, items);

  const logs = loadJson<InventoryLog[]>(STORAGE_KEYS.inventoryLogs, []);
  logs.push({
    id: newId("invlog"),
    itemId,
    itemName: items[idx].name,
    employeeId: employee.id,
    employeeName: employee.name,
    action: "use",
    quantity,
    reason,
    createdAt: nowIso(),
  });
  saveJson(STORAGE_KEYS.inventoryLogs, logs);
  return items[idx];
}

/* ─── Notifications ───────────────────────────────────────────────────── */

export function getNotifications(employeeId: string): Notification[] {
  ensureSeeded();
  return loadJson<Notification[]>(STORAGE_KEYS.notifications, [])
    .filter((n) => n.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(notificationId: string): void {
  const notifications = loadJson<Notification[]>(STORAGE_KEYS.notifications, []);
  const idx = notifications.findIndex((n) => n.id === notificationId);
  if (idx >= 0) {
    notifications[idx].read = true;
    saveJson(STORAGE_KEYS.notifications, notifications);
  }
}

export function markAllNotificationsRead(employeeId: string): void {
  const notifications = loadJson<Notification[]>(STORAGE_KEYS.notifications, []);
  notifications.forEach((n) => {
    if (n.employeeId === employeeId) n.read = true;
  });
  saveJson(STORAGE_KEYS.notifications, notifications);
}

export function unreadNotificationCount(employeeId: string): number {
  return getNotifications(employeeId).filter((n) => !n.read).length;
}

/* ─── Today summary ───────────────────────────────────────────────────── */

export function todaySummary(employee: Employee): {
  greeting: string;
  summary: string;
  tasksToday: number;
  tasksTomorrow: number;
  nextMeeting: Meeting | null;
  unreadMessages: number;
  pendingRequests: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const tasks = getTasksForEmployee(employee.id);
  const tasksToday = tasks.filter((t) => t.dueDate === today && t.status !== "completed").length;
  const tasksTomorrow = tasks.filter((t) => t.dueDate === tomorrow && t.status !== "completed").length;

  const meetings = getMeetingsForEmployee(employee.id).filter((m) => m.startAt.startsWith(today));
  const nextMeeting = meetings.sort((a, b) => a.startAt.localeCompare(b.startAt))[0] ?? null;

  const channels = getChannelsForEmployee(employee.id);
  const channelIds = new Set(channels.map((c) => c.id));
  const unreadMessages = getMessages().filter((m) => channelIds.has(m.channelId) && m.senderId !== employee.id).length;

  const pendingRequests = getTimeOffForEmployee(employee.id).filter((r) => r.status === "pending").length;

  const parts: string[] = [];
  parts.push(`You have ${tasksToday} task${tasksToday === 1 ? "" : "s"} today`);
  if (nextMeeting) {
    const time = new Date(nextMeeting.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    parts.push(`a team meeting at ${time}`);
  }
  if (tasksTomorrow > 0) {
    parts.push(`${tasksTomorrow === 1 ? "one task" : `${tasksTomorrow} tasks`} due tomorrow`);
  }

  return {
    greeting: `${greeting}, ${employee.firstName}`,
    summary: parts.join(", ") + ".",
    tasksToday,
    tasksTomorrow,
    nextMeeting,
    unreadMessages,
    pendingRequests,
  };
}
