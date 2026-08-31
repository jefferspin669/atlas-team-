import type { Employee } from "./types";
import type { AtlasReply } from "./types";
import { permissionDenialFor } from "./permissions";
import {
  blockTask,
  completeTask,
  getMeetingsForEmployee,
  getShiftsForEmployee,
  getTasksForEmployee,
  searchResources,
  sendMessage,
  startTask,
  todaySummary,
} from "./data";

export function atlasReply(employee: Employee, input: string): AtlasReply {
  const denial = permissionDenialFor(employee, input);
  if (denial) {
    return { text: denial, denied: true };
  }

  const q = input.toLowerCase().trim();
  const tasks = getTasksForEmployee(employee.id);
  const today = new Date().toISOString().slice(0, 10);

  if (/what.*(work on|do|supposed|today|priority)/i.test(input)) {
    const todayTasks = tasks.filter((t) => t.dueDate === today && t.status !== "completed");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const waiting = tasks.filter((t) => t.status === "waiting");

    const lines: string[] = [];
    if (inProgress.length) {
      lines.push(`In progress: ${inProgress.map((t) => t.title).join(", ")}`);
    }
    if (todayTasks.length) {
      lines.push(`Due today: ${todayTasks.map((t) => `${t.title} (${t.priority})`).join("; ")}`);
    }
    if (waiting.length) {
      lines.push(`Waiting: ${waiting.map((t) => `${t.title} — ${t.blockReason ?? "blocked"}`).join("; ")}`);
    }
    if (!lines.length) {
      lines.push("You're all caught up today. Check My Work for upcoming items.");
    }

    return {
      text: lines.join("\n"),
      actions: todayTasks[0]
        ? [{ label: "Start top task", type: "start_task", payload: { taskId: todayTasks[0].id } }]
        : undefined,
    };
  }

  if (/refund|reimbursement|dress code|policy|procedure|handbook/i.test(input)) {
    const hits = searchResources(input);
    if (hits.length) {
      const top = hits[0];
      return {
        text: `From ${top.title}:\n\n${top.content}`,
        actions: [{ label: "View all resources", type: "navigate", payload: { href: "/resources" } }],
      };
    }
    return { text: "I couldn't find a specific policy for that. Try searching in Company Resources." };
  }

  if (/next shift|my shift|when.*shift/i.test(input)) {
    const shifts = getShiftsForEmployee(employee.id);
    const upcoming = shifts.filter((s) => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    if (!upcoming.length) return { text: "No upcoming shifts on your schedule." };
    const next = upcoming[0];
    return {
      text: `Your next shift is ${next.date} from ${next.startTime} to ${next.endTime} at ${next.location}.`,
      actions: [{ label: "View schedule", type: "navigate", payload: { href: "/schedule" } }],
    };
  }

  if (/summarize.*project|project.*summary/i.test(input)) {
    const projectMatch = employee.projects.find((p) => q.includes(p.toLowerCase()));
    const project = projectMatch ?? employee.projects[0];
    const projectTasks = tasks.filter((t) => t.project === project);
    const done = projectTasks.filter((t) => t.status === "completed").length;
    return {
      text: `${project}: ${projectTasks.length} tasks assigned to you, ${done} completed. ${
        projectTasks
          .filter((t) => t.status !== "completed")
          .map((t) => t.title)
          .join(", ") || "All done!"
      }`,
    };
  }

  if (/finished|completed|done with/i.test(input) && /task|johnson|report|dashboard/i.test(input)) {
    const match = tasks.find(
      (t) =>
        t.status !== "completed" &&
        (q.includes(t.title.toLowerCase()) || (q.includes("johnson") && t.title.toLowerCase().includes("johnson")))
    );
    if (match) {
      completeTask(match.id);
      return {
        text: `Marked "${match.title}" as complete. Sarah will see the update on her side.`,
        actions: [{ label: "View My Work", type: "navigate", payload: { href: "/work" } }],
      };
    }
  }

  if (/tell.*(sarah|manager)|waiting on|message.*(sarah|manager)/i.test(input)) {
    const text = input.replace(/tell (sarah|my manager)/i, "").trim() || "Update from Marcus";
    sendMessage("ch-dm-sarah", employee, text.charAt(0).toUpperCase() + text.slice(1));
    return {
      text: "Message sent to Sarah Chen. She'll see it in Messages on both Atlas Team and Boss Atlas.",
      actions: [{ label: "Open messages", type: "navigate", payload: { href: "/messages" } }],
    };
  }

  if (/meeting|calendar|schedule today/i.test(input)) {
    const meetings = getMeetingsForEmployee(employee.id).filter((m) => m.startAt.startsWith(today));
    if (!meetings.length) return { text: "No meetings on your calendar today." };
    const list = meetings
      .map((m) => {
        const time = new Date(m.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        return `• ${m.title} at ${time}${m.location ? ` (${m.location})` : ""}`;
      })
      .join("\n");
    return { text: `Today's meetings:\n${list}` };
  }

  if (/start.*task/i.test(input)) {
    const active = tasks.find((t) => t.status === "todo" || t.status === "in_progress");
    if (active) {
      startTask(active.id);
      return {
        text: `Started "${active.title}". Your manager can see you're working on it.`,
        actions: [{ label: "Open task", type: "navigate", payload: { href: "/work" } }],
      };
    }
  }

  const summary = todaySummary(employee);
  return {
    text: `${summary.summary}\n\nI can help with your tasks, schedule, company policies, expenses, and messages. What do you need?`,
  };
}
