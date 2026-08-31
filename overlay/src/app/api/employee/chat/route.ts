import { apiResponse, jsonError, readJson } from "@/lib/api/http";
import { ok } from "@/lib/api/types";
import { runEmployeeAtlasBrain } from "@/lib/brain/employee";
import { clientKey, rateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  try {
    rateLimit(`employee-chat:${clientKey(req)}`, 30, 60_000);
  } catch (error) {
    return jsonError(error);
  }

  const body = await readJson(req);
  const message = String(body.message || "").trim();
  if (!message) {
    return apiResponse(ok({ reply: "Ask me something about your work.", agentLabel: "Atlas Team" }));
  }

  const member = body.member as
    | { id?: string; name?: string; role?: string; department?: string; email?: string }
    | undefined;
  if (!member?.id || !member?.name || !member?.role) {
    return apiResponse(
      ok({
        reply: "Employee session required. Sign in to Atlas Team first.",
        agentLabel: "Atlas Team",
        denied: true,
      }),
    );
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter((m: { role?: string; content?: string }) => m?.role && m?.content)
        .map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(m.content),
        }))
    : undefined;

  const brain = await runEmployeeAtlasBrain({
    message,
    member: {
      id: String(member.id),
      name: String(member.name),
      role: String(member.role),
      department: String(member.department || ""),
      email: String(member.email || ""),
    },
    tasks: Array.isArray(body.tasks) ? body.tasks : [],
    history,
  });

  return apiResponse(
    ok({
      reply: brain.reply,
      agentLabel: brain.agentLabel,
      mode: brain.mode,
      denied: brain.denied,
    }),
  );
}
