"use client";

import { FormEvent, useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { createTimeOffRequest, getTimeOffForEmployee } from "@/lib/data";
import type { Employee, TimeOffRequest, TimeOffType } from "@/lib/types";
import { formatDate, statusLabel } from "@/lib/utils";

const TYPES: TimeOffType[] = ["Vacation", "Sick", "Personal", "Bereavement"];

export default function TimeOffPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<TimeOffType>("Vacation");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  function refresh() {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setRequests(getTimeOffForEmployee(me.id));
  }

  useEffect(() => {
    refresh();
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employee) return;
    createTimeOffRequest(employee.id, { startDate, endDate, type, note });
    setFlash("Time-off request submitted. You'll be notified when it's approved.");
    setStartDate("");
    setEndDate("");
    setNote("");
    refresh();
    setTimeout(() => setFlash(null), 4000);
  }

  if (!employee) return null;

  return (
    <TeamShell title="Time Off">
      {flash && <div className="flash">{flash}</div>}

      <div className="panel">
        <h2>Request Time Off</h2>
        <p className="panel-lead" style={{ marginBottom: "1rem" }}>
          Choose dates, type, and add a note. Your manager approves from Boss Atlas.
        </p>
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="grid-2">
            <label>
              Start date
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label>
              End date
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          </div>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value as TimeOffType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Note
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional note for your manager" />
          </label>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>
            Submit Request
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Your requests</h2>
        {requests.length === 0 ? (
          <p className="panel-lead">No time-off requests yet.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{formatDate(r.startDate)} – {formatDate(r.endDate)}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  {r.type}{r.note ? ` — ${r.note}` : ""}
                </div>
              </div>
              <span className={`badge${r.status === "approved" ? " ok" : r.status === "pending" ? "" : " warn"}`}>
                {r.status === "approved" ? "Approved ✓" : statusLabel(r.status)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <h2>PTO balance</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--accent)" }}>
          {employee.ptoBalance} days
        </p>
      </div>
    </TeamShell>
  );
}
