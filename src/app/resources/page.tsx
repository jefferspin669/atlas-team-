"use client";

import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { AskAtlasPanel } from "@/components/AskAtlas";
import { getSignedInEmployee } from "@/lib/demo-data";
import { getResources, searchResources } from "@/lib/data";
import { atlasReply } from "@/lib/atlas-ai";
import type { Employee, Resource } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  handbook: "Company Handbook",
  policy: "Policies",
  training: "Training",
  document: "Documents",
  faq: "FAQs",
};

export default function ResourcesPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Resource | null>(null);

  useEffect(() => {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setResources(getResources());
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    setResources(q.trim() ? searchResources(q) : getResources());
  }

  if (!employee) return null;

  return (
    <TeamShell title="Company Resources">
      <div className="panel">
        <h2>Search company knowledge</h2>
        <p className="panel-lead" style={{ marginBottom: "1rem" }}>
          Ask Atlas or search Business Memory for policies, procedures, and training materials.
        </p>
        <input
          style={{ width: "100%", padding: "0.65rem 1rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)" }}
          placeholder='Try "dress code" or "refund procedure"'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <h2>Ask Atlas</h2>
        <AskAtlasPanel
          onAsk={(input) => atlasReply(employee, input)}
          placeholder="What's our dress code?"
        />
      </div>

      <div className="resource-grid">
        {resources.map((r) => (
          <div key={r.id} className="resource-card" onClick={() => setSelected(selected?.id === r.id ? null : r)}>
            <span className="badge muted">{CATEGORY_LABELS[r.category]}</span>
            <h4 style={{ marginTop: "0.35rem" }}>{r.title}</h4>
            <p>{r.summary}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2>{selected.title}</h2>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>{selected.content}</p>
        </div>
      )}
    </TeamShell>
  );
}
