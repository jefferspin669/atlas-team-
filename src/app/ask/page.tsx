"use client";

import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { AskAtlasPanel } from "@/components/AskAtlas";
import { getSignedInEmployee } from "@/lib/demo-data";
import { atlasReply } from "@/lib/atlas-ai";
import type { Employee } from "@/lib/types";

export default function AskPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    setEmployee(getSignedInEmployee());
  }, []);

  if (!employee) return null;

  return (
    <TeamShell title="Ask Atlas">
      <div className="hero-panel panel">
        <h1>Talk to Atlas</h1>
        <p>
          Your personal Atlas assistant — scoped to your role and permissions. Ask about tasks, policies,
          schedule, or send updates to your manager.
        </p>
      </div>

      <div className="panel">
        <h2>Employee Atlas AI</h2>
        <p className="panel-lead" style={{ marginBottom: "1rem" }}>
          Atlas can perform allowed actions on your behalf. Sensitive data like salaries and executive
          reports are blocked by the permission engine.
        </p>
        <AskAtlasPanel onAsk={(input) => atlasReply(employee, input)} />
      </div>

      <div className="panel">
        <h2>What Atlas can help with</h2>
        <div className="grid-2">
          <div>
            <strong style={{ color: "var(--ok)" }}>✓ Allowed</strong>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
              <li>Your tasks and schedule</li>
              <li>Company policies and handbook</li>
              <li>Send messages to your manager</li>
              <li>Mark tasks complete</li>
              <li>Project summaries</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: "var(--danger)" }}>✗ Restricted</strong>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
              <li>Everyone&apos;s salary</li>
              <li>CEO financial reports</li>
              <li>Company-wide calendars</li>
              <li>Personnel actions</li>
            </ul>
          </div>
        </div>
      </div>
    </TeamShell>
  );
}
