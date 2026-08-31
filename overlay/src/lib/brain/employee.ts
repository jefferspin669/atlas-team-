import { brainMode } from "@/lib/brain/types";
import { runAtlasBrain } from "@/lib/brain";
import {
  employeeAssistantReply,
  permissionDenialFor,
  type TeamPerson,
  type TeamTask,
} from "@/lib/user-workspace";

export type EmployeeBrainInput = {
  message: string;
  member: Pick<TeamPerson, "id" | "name" | "role" | "department" | "email">;
  tasks?: TeamTask[];
  history?: { role: "user" | "assistant"; content: string }[];
};

function buildEmployeeSystemPrompt(member: EmployeeBrainInput["member"]): string {
  return [
    `You are Atlas Team — the employee-facing AI for ${member.name} (${member.role}, ${member.department}).`,
    "You share the same Atlas backend and Business Memory as Boss Atlas, but you follow employee permissions.",
    "You help with: their tasks, schedule, company policies, handbook questions, and messaging their manager.",
    "You must NOT reveal: other employees' salaries, CEO/executive financials, company-wide personnel data, or anything outside their role.",
    "If asked for restricted data, decline politely and suggest what they can access (My Work, Company Resources, their manager).",
    "Be concise, practical, and friendly.",
  ].join(" ");
}

export async function runEmployeeAtlasBrain(input: EmployeeBrainInput): Promise<{
  reply: string;
  agentLabel: string;
  mode: "live" | "simulation";
  denied: boolean;
}> {
  const member = input.member as TeamPerson;
  const denial = permissionDenialFor(member, input.message);
  if (denial) {
    return {
      reply: denial,
      agentLabel: "Atlas Team",
      mode: "simulation",
      denied: true,
    };
  }

  if (brainMode() === "simulation") {
    const tasks = input.tasks ?? [];
    const local = employeeAssistantReply(member, tasks, input.message);
    return {
      reply: local.text,
      agentLabel: "Atlas Team",
      mode: "simulation",
      denied: false,
    };
  }

  const result = await runAtlasBrain({
    message: input.message,
    history: input.history,
    systemPrompt: buildEmployeeSystemPrompt(member),
  });

  return {
    reply: result.reply,
    agentLabel: "Atlas Team",
    mode: result.mode,
    denied: false,
  };
}
