export type TaskStatus = "todo" | "in_progress" | "waiting" | "completed";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type TimeOffType = "Vacation" | "Sick" | "Personal" | "Bereavement";
export type TimeOffStatus = "pending" | "approved" | "denied";
export type AccessScope = "own" | "team" | "department" | "personnel" | "financial" | "company";
export type NotificationKind = "task" | "meeting" | "timeoff" | "message" | "reminder" | "announcement";

export type Employee = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  accessCode: string;
  role: string;
  department: string;
  managerId: string;
  managerName: string;
  location: string;
  phone: string;
  position: string;
  ptoBalance: number;
  projects: string[];
  permissions: {
    inventory: boolean;
    createSubtasks: boolean;
    teamCalendar: boolean;
  };
  scopes: AccessScope[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedById: string;
  assignedByName: string;
  assigneeId: string;
  project?: string;
  progress: number;
  blocked?: boolean;
  blockReason?: string;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type TaskComment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type TaskAttachment = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export type Meeting = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  attendeeIds: string[];
  joinUrl?: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type TimeOffRequest = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  note: string;
  status: TimeOffStatus;
  createdAt: string;
};

export type Message = {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  mentions?: string[];
};

export type Channel = {
  id: string;
  name: string;
  type: "dm" | "team" | "project" | "department" | "announcement";
  memberIds: string[];
  project?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  audience: "all" | "department";
  department?: string;
};

export type Resource = {
  id: string;
  title: string;
  category: "handbook" | "policy" | "training" | "document" | "faq";
  summary: string;
  content: string;
};

export type Expense = {
  id: string;
  employeeId: string;
  employeeName: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  project: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
};

export type InventoryLog = {
  id: string;
  itemId: string;
  itemName: string;
  employeeId: string;
  employeeName: string;
  action: "use" | "receive";
  quantity: number;
  reason: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  employeeId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  read: boolean;
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  type: "shift" | "meeting" | "deadline" | "timeoff" | "event";
  employeeId?: string;
  allDay?: boolean;
};

export type AtlasAction = {
  label: string;
  type: "start_task" | "complete_task" | "send_message" | "request_timeoff" | "navigate";
  payload?: Record<string, string>;
};

export type AtlasReply = {
  text: string;
  actions?: AtlasAction[];
  denied?: boolean;
};
