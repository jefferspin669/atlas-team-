#!/usr/bin/env node
/**
 * Apply Atlas Team overlay onto the ai-assistant submodule.
 * Keeps atlas-team connected to upstream Atlas while shipping Team integration patches.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const atlasSrc = join(root, "atlas", "src");
const overlaySrc = join(root, "overlay", "src");

function copyRecursive(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = join(from, entry);
    const dest = join(to, entry);
    if (statSync(src).isDirectory()) copyRecursive(src, dest);
    else cpSync(src, dest);
  }
}

function patch(file, replacements) {
  const path = join(atlasSrc, file);
  if (!existsSync(path)) {
    console.warn(`skip patch (missing): ${file}`);
    return;
  }
  let text = readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    if (!text.includes(from)) {
      console.warn(`patch pattern not found in ${file}`);
      continue;
    }
    text = text.replace(from, to);
  }
  writeFileSync(path, text);
}

if (!existsSync(atlasSrc)) {
  console.error("Atlas submodule not found. Run: git submodule update --init");
  process.exit(1);
}

copyRecursive(overlaySrc, atlasSrc);

patch("lib/brain/types.ts", [
  [
    `  history?: { role: "user" | "assistant"; content: string }[];\n};`,
    `  history?: { role: "user" | "assistant"; content: string }[];\n  /** When set, replaces the default owner-facing system prompt (e.g. Atlas Team employee persona). */\n  systemPrompt?: string;\n};`,
  ],
]);

patch("lib/brain/index.ts", [
  [
    `{ role: "system", content: buildSystemPrompt(input) },`,
    `{ role: "system", content: input.systemPrompt || buildSystemPrompt(input) },`,
  ],
]);

patch("app/login/page.tsx", [
  [
    `Employee? <a href={sitePath("/employee/login")}>Sign in to your work page</a>`,
    `Employee? <a href={sitePath("/team/login")}>Sign in to Atlas Team</a>`,
  ],
]);

patch("app/employee/login/page.tsx", [
  [`import { hardNavigate, sitePath } from "@/lib/hard-nav";`, `import { hardNavigate, sitePath } from "@/lib/hard-nav";\n\nconst TEAM_HOME = "/team";\nconst TEAM_LOGIN = "/team/login";`],
  [`hardNavigate("/employee");`, `hardNavigate(TEAM_HOME);`],
  [`Atlas <span>AI</span>`, `Atlas <span>Team</span>`],
  [`<h1>Employee sign-in</h1>`, `<h1>Atlas Team sign-in</h1>`],
  [
    `<p>Sign in with the email and access code your manager gave you to see your tasks.</p>`,
    `<p>Sign in with the email and access code your manager gave you. Atlas detects your role and sends you here.</p>`,
  ],
  [`Sign in to my page`, `Sign in to Atlas Team`],
  [`Sign in to Atlas</a>`, `Sign in to Boss Atlas</a>`],
]);

patch("app/employee/page.tsx", [
  [
    `import { hardNavigate } from "@/lib/hard-nav";`,
    `import { hardNavigate } from "@/lib/hard-nav";\nimport { fetchEmployeeAtlasReply } from "@/lib/employee-atlas-client";`,
  ],
  [`  atlasSidebarReply,\n  awaitingApproval,`, `  awaitingApproval,`],
  [`  employeeAssistantReply,\n  EMPLOYEE_STATUSES,`, `  EMPLOYEE_STATUSES,`],
  [`hardNavigate("/employee/login");`, `hardNavigate("/team/login");`],
  [
    `  function askSidebar(e: FormEvent) {
    e.preventDefault();
    if (!employee || !sidebarInput.trim()) return;
    const r = atlasSidebarReply(employee, sidebarInput);
    setSidebarMsgs((prev) => [...prev, { role: "user", text: sidebarInput.trim() }, { role: "ai", text: r.text, items: r.items }]);
    setSidebarInput("");
  }
  function askSidebarPrompt(text: string) {
    if (!employee) return;
    const r = atlasSidebarReply(employee, text);
    setSidebarMsgs((prev) => [...prev, { role: "user", text }, { role: "ai", text: r.text, items: r.items }]);
  }`,
    `  function askSidebar(e: FormEvent) {
    e.preventDefault();
    if (!employee || !sidebarInput.trim()) return;
    const text = sidebarInput.trim();
    setSidebarInput("");
    void fetchEmployeeAtlasReply(employee, text, tasks, "sidebar").then((r) => {
      setSidebarMsgs((prev) => [...prev, { role: "user", text }, { role: "ai", text: r.text, items: r.items }]);
    });
  }
  function askSidebarPrompt(text: string) {
    if (!employee) return;
    void fetchEmployeeAtlasReply(employee, text, tasks, "sidebar").then((r) => {
      setSidebarMsgs((prev) => [...prev, { role: "user", text }, { role: "ai", text: r.text, items: r.items }]);
    });
  }`,
  ],
  [
    `  function askHero(e: FormEvent) {
    e.preventDefault();
    if (!employee || !heroAsk.trim()) return;
    const r = employeeAssistantReply(employee, tasks, heroAsk);
    setHeroAnswer({ role: "ai", text: r.text, actions: r.actions });
    setHeroAsk("");
  }`,
    `  function askHero(e: FormEvent) {
    e.preventDefault();
    if (!employee || !heroAsk.trim()) return;
    const text = heroAsk.trim();
    setHeroAsk("");
    void fetchEmployeeAtlasReply(employee, text, tasks).then((r) => {
      setHeroAnswer({ role: "ai", text: r.text, actions: r.actions });
    });
  }`,
  ],
  [
    `  function submitAsk(e: FormEvent) {
    e.preventDefault();
    if (!employee || !ask.trim()) return;
    const reply = employeeAssistantReply(employee, tasks, ask);
    setChat((prev) => [...prev, { role: "user", text: ask.trim() }, { role: "ai", text: reply.text, actions: reply.actions }]);
    setAsk("");
  }`,
    `  function submitAsk(e: FormEvent) {
    e.preventDefault();
    if (!employee || !ask.trim()) return;
    const text = ask.trim();
    setAsk("");
    setChat((prev) => [...prev, { role: "user", text }]);
    void fetchEmployeeAtlasReply(employee, text, tasks).then((r) => {
      setChat((prev) => [...prev, { role: "ai", text: r.text, actions: r.actions }]);
    });
  }`,
  ],
  [
    `Need to switch accounts? <Link href="/employee/login">Back to employee sign-in</Link>`,
    `Need to switch accounts? <Link href="/team/login">Back to Atlas Team sign-in</Link>`,
  ],
]);

patch("components/WorkforceStatusStudio.tsx", [
  [
    `<Link className="btn btn-outline" href="/employee/login">
                Employee portal
              </Link>`,
    `<Link className="btn btn-outline" href="/team/login">
                Open Atlas Team
              </Link>`,
  ],
  [
    `<Link href="/employee/login">/employee/login</Link>.`,
    `<Link href="/team/login">/team/login</Link> (Atlas Team).`,
  ],
]);

console.log("Atlas Team overlay applied.");
