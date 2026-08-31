import type {
  Announcement,
  Channel,
  Employee,
  Expense,
  InventoryItem,
  Meeting,
  Message,
  Notification,
  Resource,
  Shift,
  Task,
  TimeOffRequest,
} from "./types";
import { loadJson, saveJson, STORAGE_KEYS } from "./store";

const SARAH_ID = "emp-sarah";
const MARCUS_ID = "emp-marcus";
const ALEX_ID = "emp-alex";

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: MARCUS_ID,
    name: "Marcus Johnson",
    firstName: "Marcus",
    email: "marcus@acme.local",
    accessCode: "MJ2024",
    role: "Field Technician",
    department: "Operations",
    managerId: SARAH_ID,
    managerName: "Sarah Chen",
    location: "Warehouse — Building B",
    phone: "(555) 234-8901",
    position: "Senior Field Technician",
    ptoBalance: 12.5,
    projects: ["Warehouse Project", "Customer Dashboard", "Project Phoenix"],
    permissions: { inventory: true, createSubtasks: true, teamCalendar: true },
    scopes: ["own", "team"],
  },
  {
    id: SARAH_ID,
    name: "Sarah Chen",
    firstName: "Sarah",
    email: "sarah@acme.local",
    accessCode: "SC2024",
    role: "Manager",
    department: "Operations",
    managerId: "emp-ceo",
    managerName: "David Park",
    location: "HQ — Floor 2",
    phone: "(555) 111-2200",
    position: "Operations Manager",
    ptoBalance: 18,
    projects: ["Warehouse Project", "Customer Dashboard", "Project Phoenix"],
    permissions: { inventory: true, createSubtasks: true, teamCalendar: true },
    scopes: ["own", "team", "department", "personnel"],
  },
  {
    id: ALEX_ID,
    name: "Alex Rivera",
    firstName: "Alex",
    email: "alex@acme.local",
    accessCode: "AR2024",
    role: "Sales Rep",
    department: "Sales",
    managerId: SARAH_ID,
    managerName: "Sarah Chen",
    location: "HQ — Floor 1",
    phone: "(555) 333-4455",
    position: "Account Executive",
    ptoBalance: 10,
    projects: ["Project Phoenix"],
    permissions: { inventory: false, createSubtasks: false, teamCalendar: true },
    scopes: ["own", "team", "department"],
  },
];

function today(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function atTime(date: string, hours: number, minutes = 0): string {
  return `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function seedDemoData(): void {
  if (loadJson(STORAGE_KEYS.seeded, false)) return;

  const tasks: Task[] = [
    {
      id: "task-1",
      title: "Update customer dashboard",
      description: "Refresh the customer-facing dashboard with Q3 metrics and new branding.",
      status: "todo",
      priority: "High",
      dueDate: today(3),
      assignedById: SARAH_ID,
      assignedByName: "Sarah Chen",
      assigneeId: MARCUS_ID,
      project: "Customer Dashboard",
      progress: 0,
      comments: [],
      attachments: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "task-2",
      title: "Install shelving — Unit 4B",
      description: "Complete shelving installation per warehouse layout plan.",
      status: "in_progress",
      priority: "Medium",
      dueDate: today(),
      assignedById: SARAH_ID,
      assignedByName: "Sarah Chen",
      assigneeId: MARCUS_ID,
      project: "Warehouse Project",
      progress: 45,
      comments: [
        {
          id: "c1",
          authorId: MARCUS_ID,
          authorName: "Marcus Johnson",
          text: "Started on the north wall. Need 2 more brackets.",
          createdAt: new Date().toISOString(),
        },
      ],
      attachments: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "task-3",
      title: "Customer report — Johnson account",
      description: "Compile usage report for Johnson Industries renewal meeting.",
      status: "waiting",
      priority: "High",
      dueDate: today(1),
      assignedById: SARAH_ID,
      assignedByName: "Sarah Chen",
      assigneeId: MARCUS_ID,
      project: "Project Phoenix",
      progress: 80,
      blocked: true,
      blockReason: "Waiting on customer data from sales",
      comments: [],
      attachments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "task-4",
      title: "Safety equipment audit",
      description: "Verify all PPE stations are stocked and logged.",
      status: "completed",
      priority: "Medium",
      dueDate: today(-1),
      assignedById: SARAH_ID,
      assignedByName: "Sarah Chen",
      assigneeId: MARCUS_ID,
      progress: 100,
      comments: [],
      attachments: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "task-5",
      title: "Inventory count — aisle 3",
      description: "Physical count of aisle 3 supplies.",
      status: "todo",
      priority: "Low",
      dueDate: today(),
      assignedById: SARAH_ID,
      assignedByName: "Sarah Chen",
      assigneeId: MARCUS_ID,
      project: "Warehouse Project",
      progress: 0,
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const meetings: Meeting[] = [
    {
      id: "meet-1",
      title: "Team standup",
      startAt: atTime(today(), 9, 0),
      endAt: atTime(today(), 9, 30),
      location: "Conference Room B",
      attendeeIds: [MARCUS_ID, SARAH_ID, ALEX_ID],
    },
    {
      id: "meet-2",
      title: "Sales meeting",
      startAt: atTime(today(), 13, 0),
      endAt: atTime(today(), 14, 0),
      location: "Zoom",
      attendeeIds: [MARCUS_ID, SARAH_ID, ALEX_ID],
      joinUrl: "https://zoom.us/j/example",
    },
  ];

  const shifts: Shift[] = [
    {
      id: "shift-1",
      employeeId: MARCUS_ID,
      date: today(),
      startTime: "08:00",
      endTime: "17:00",
      location: "Warehouse — Building B",
    },
    {
      id: "shift-2",
      employeeId: MARCUS_ID,
      date: today(1),
      startTime: "08:00",
      endTime: "17:00",
      location: "Warehouse — Building B",
    },
  ];

  const channels: Channel[] = [
    { id: "ch-dm-sarah", name: "Sarah Chen", type: "dm", memberIds: [MARCUS_ID, SARAH_ID] },
    { id: "ch-ops", name: "Operations", type: "department", memberIds: [MARCUS_ID, SARAH_ID] },
    { id: "ch-phoenix", name: "Project Phoenix", type: "project", memberIds: [MARCUS_ID, SARAH_ID, ALEX_ID], project: "Project Phoenix" },
    { id: "ch-announce", name: "Company Announcements", type: "announcement", memberIds: [MARCUS_ID, SARAH_ID, ALEX_ID] },
  ];

  const messages: Message[] = [
    {
      id: "msg-1",
      channelId: "ch-dm-sarah",
      senderId: SARAH_ID,
      senderName: "Sarah Chen",
      text: "Marcus — can you prioritize the Johnson report? Renewal is Thursday.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "msg-2",
      channelId: "ch-phoenix",
      senderId: ALEX_ID,
      senderName: "Alex Rivera",
      text: "Waiting on the customer data for Johnson. Should have it by EOD.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      mentions: [MARCUS_ID],
    },
    {
      id: "msg-3",
      channelId: "ch-ops",
      senderId: SARAH_ID,
      senderName: "Sarah Chen",
      text: "Reminder: safety audit due this week. Check your task list.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const announcements: Announcement[] = [
    {
      id: "ann-1",
      title: "Q3 all-hands — September 15",
      body: "Join us for the quarterly all-hands at 2 PM in the main auditorium. Remote link will be shared.",
      authorName: "HR Team",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      audience: "all",
    },
    {
      id: "ann-2",
      title: "New expense policy",
      body: "Receipts are now required for all purchases over $25. Use the Expenses section to submit.",
      authorName: "Finance",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      audience: "all",
    },
  ];

  const resources: Resource[] = [
    {
      id: "res-1",
      title: "Employee Handbook",
      category: "handbook",
      summary: "Company policies, benefits, and workplace guidelines.",
      content: "Welcome to Acme Corp. This handbook covers dress code (business casual Mon–Thu, casual Friday), PTO accrual, benefits enrollment, and workplace conduct.",
    },
    {
      id: "res-2",
      title: "Dress Code Policy",
      category: "policy",
      summary: "What to wear at work and on customer sites.",
      content: "Business casual Monday–Thursday. Casual Friday. On customer sites: company polo + closed-toe shoes. Safety gear required in warehouse areas.",
    },
    {
      id: "res-3",
      title: "Refund Procedure",
      category: "policy",
      summary: "How to handle customer refund requests.",
      content: "Refunds under $100: manager approval via Atlas. Over $100: escalate to Sarah Chen. Document reason in CRM. Processing takes 5–7 business days.",
    },
    {
      id: "res-4",
      title: "Expense Reimbursement",
      category: "faq",
      summary: "How to submit expenses and get reimbursed.",
      content: "Take a photo of your receipt in Expenses. Atlas extracts the details. Choose the project. Manager approves within 2 business days. Reimbursement on next payroll.",
    },
    {
      id: "res-5",
      title: "Warehouse Safety Training",
      category: "training",
      summary: "Required annual safety certification.",
      content: "Complete modules 1–4 on forklift safety, PPE, emergency exits, and hazard reporting. Certificate valid 12 months.",
    },
  ];

  const inventory: InventoryItem[] = [
    { id: "inv-1", name: "Printer Paper", sku: "PP-500", quantity: 24, unit: "reams", location: "Aisle 3" },
    { id: "inv-2", name: "Safety Gloves (L)", sku: "SG-L", quantity: 48, unit: "pairs", location: "PPE Station 2" },
    { id: "inv-3", name: "Cable Ties (100pk)", sku: "CT-100", quantity: 15, unit: "packs", location: "Aisle 5" },
  ];

  const notifications: Notification[] = [
    {
      id: "notif-1",
      employeeId: MARCUS_ID,
      kind: "task",
      title: "Sarah assigned you a new task",
      body: "Inventory count — aisle 3 is due today.",
      actionLabel: "View task",
      actionHref: "/work",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif-2",
      employeeId: MARCUS_ID,
      kind: "meeting",
      title: "Sales meeting starts in 15 minutes",
      body: "Join via Zoom at 1:00 PM.",
      actionLabel: "Join",
      actionHref: "/schedule",
      read: false,
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: "notif-3",
      employeeId: MARCUS_ID,
      kind: "timeoff",
      title: "Your time-off request was approved",
      body: "Sep 20–22 (Vacation) — approved by Sarah Chen.",
      read: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "notif-4",
      employeeId: MARCUS_ID,
      kind: "message",
      title: "Sarah mentioned you in Project Phoenix",
      body: "Alex is waiting on customer data for the Johnson report.",
      actionLabel: "Open chat",
      actionHref: "/messages",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif-5",
      employeeId: MARCUS_ID,
      kind: "reminder",
      title: 'Task "Customer Report" is due tomorrow',
      body: "Johnson account report — currently waiting on customer data.",
      actionLabel: "View task",
      actionHref: "/work",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const timeOff: TimeOffRequest[] = [
    {
      id: "pto-1",
      employeeId: MARCUS_ID,
      startDate: "2026-09-20",
      endDate: "2026-09-22",
      type: "Vacation",
      note: "Family trip",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  saveJson(STORAGE_KEYS.employees, DEMO_EMPLOYEES);
  saveJson(STORAGE_KEYS.tasks, tasks);
  saveJson(STORAGE_KEYS.meetings, meetings);
  saveJson(STORAGE_KEYS.shifts, shifts);
  saveJson(STORAGE_KEYS.channels, channels);
  saveJson(STORAGE_KEYS.messages, messages);
  saveJson(STORAGE_KEYS.announcements, announcements);
  saveJson(STORAGE_KEYS.resources, resources);
  saveJson(STORAGE_KEYS.inventory, inventory);
  saveJson(STORAGE_KEYS.notifications, notifications);
  saveJson(STORAGE_KEYS.timeOff, timeOff);
  saveJson(STORAGE_KEYS.expenses, [] as Expense[]);
  saveJson(STORAGE_KEYS.inventoryLogs, []);
  saveJson(STORAGE_KEYS.seeded, true);
}

export function authenticateEmployee(email: string, code: string): Employee | null {
  seedDemoData();
  const employees = loadJson<Employee[]>(STORAGE_KEYS.employees, []);
  return (
    employees.find(
      (e) => e.email.toLowerCase() === email.trim().toLowerCase() && e.accessCode === code.trim().toUpperCase()
    ) ?? null
  );
}

export function getEmployee(id: string): Employee | null {
  seedDemoData();
  const employees = loadJson<Employee[]>(STORAGE_KEYS.employees, []);
  return employees.find((e) => e.id === id) ?? null;
}

export function getSignedInEmployee(): Employee | null {
  const sessionId = loadJson<string | null>(STORAGE_KEYS.session, null);
  if (!sessionId) return null;
  return getEmployee(sessionId);
}
