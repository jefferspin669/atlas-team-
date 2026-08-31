export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: iso.slice(0, 4) !== String(new Date().getFullYear()) ? "numeric" : undefined,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function priorityClass(priority: string): string {
  if (priority === "Urgent" || priority === "High") return "badge warn";
  return "badge";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    waiting: "Waiting",
    completed: "Completed",
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
  };
  return map[status] ?? status;
}

export function notificationIcon(kind: string): string {
  const map: Record<string, string> = {
    task: "📋",
    meeting: "📅",
    timeoff: "✅",
    message: "💬",
    reminder: "⏰",
    announcement: "📢",
  };
  return map[kind] ?? "🔔";
}
