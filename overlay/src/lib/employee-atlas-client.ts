import {
  atlasSidebarReply,
  employeeAssistantReply,
  permissionDenialFor,
  type AssistantAction,
  type TeamPerson,
  type TeamTask,
} from "@/lib/user-workspace";

type EmployeeAtlasReply = {
  text: string;
  items?: string[];
  actions?: AssistantAction[];
  denied?: boolean;
  source: "api" | "local";
};

/** Ask Atlas via the shared Atlas Brain API, with local permission-scoped fallback. */
export async function fetchEmployeeAtlasReply(
  member: TeamPerson,
  message: string,
  tasks: TeamTask[],
  mode: "assistant" | "sidebar" = "assistant",
  history?: { role: "user" | "assistant"; content: string }[],
): Promise<EmployeeAtlasReply> {
  const denial = permissionDenialFor(member, message);
  if (denial) {
    return { text: denial, denied: true, source: "local" };
  }

  try {
    const res = await fetch("/api/employee/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        member: {
          id: member.id,
          name: member.name,
          role: member.role,
          department: member.department,
          email: member.email,
        },
        tasks,
        history,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const payload = data.data ?? data;
      if (payload.reply) {
        return {
          text: String(payload.reply),
          denied: Boolean(payload.denied),
          source: "api",
        };
      }
    }
  } catch {
    /* offline or API unavailable — fall back to local Atlas */
  }

  if (mode === "sidebar") {
    const r = atlasSidebarReply(member, message);
    return { text: r.text, items: r.items, source: "local" };
  }

  const r = employeeAssistantReply(member, tasks, message);
  return { text: r.text, actions: r.actions, source: "local" };
}
