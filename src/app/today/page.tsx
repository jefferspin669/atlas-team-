"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { AskAtlasPanel } from "@/components/AskAtlas";
import { getSignedInEmployee } from "@/lib/demo-data";
import {
  getAnnouncements,
  getMeetingsForEmployee,
  getNotifications,
  getTasksForEmployee,
  todaySummary,
} from "@/lib/data";
import { atlasReply } from "@/lib/atlas-ai";
import type { Employee } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export default function TodayPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [summary, setSummary] = useState<ReturnType<typeof todaySummary> | null>(null);

  useEffect(() => {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setSummary(todaySummary(me));
  }, []);

  if (!employee || !summary) return null;

  const today = new Date().toISOString().slice(0, 10);
  const tasks = getTasksForEmployee(employee.id).filter((t) => t.dueDate === today && t.status !== "completed");
  const meetings = getMeetingsForEmployee(employee.id).filter((m) => m.startAt.startsWith(today));
  const announcements = getAnnouncements(employee).slice(0, 2);
  const reminders = getNotifications(employee.id).filter((n) => n.kind === "reminder" && !n.read).slice(0, 3);
  const waiting = getTasksForEmployee(employee.id).filter((t) => t.status === "waiting");

  return (
    <TeamShell title="Today">
      <div className="hero-panel panel">
        <h1>{summary.greeting}</h1>
        <p>{summary.summary}</p>
      </div>

      <div className="panel">
        <h2>Ask Atlas</h2>
        <AskAtlasPanel onAsk={(input) => atlasReply(employee, input)} placeholder="What do you need help with?" />
      </div>

      <div className="today-grid">
        <div className="panel">
          <h2>Tasks due today</h2>
          {tasks.length === 0 ? (
            <p className="panel-lead">No tasks due today.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="list-item">
                <strong>{t.title}</strong>
                <span className={`badge${t.priority === "High" ? " warn" : ""}`} style={{ marginLeft: "0.5rem" }}>
                  {t.priority}
                </span>
              </div>
            ))
          )}
          <Link href="/work" className="btn btn-sm" style={{ marginTop: "0.75rem" }}>
            View all tasks →
          </Link>
        </div>

        <div className="panel">
          <h2>Upcoming meetings</h2>
          {meetings.length === 0 ? (
            <p className="panel-lead">No meetings today.</p>
          ) : (
            meetings.map((m) => (
              <div key={m.id} className="list-item">
                <strong>{m.title}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  {formatTime(m.startAt)}
                  {m.location && ` · ${m.location}`}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h2>Shift / schedule</h2>
          <p className="panel-lead">
            Today: 8:00 AM – 5:00 PM at {employee.location}
          </p>
          <Link href="/schedule" className="btn btn-sm" style={{ marginTop: "0.5rem" }}>
            View schedule →
          </Link>
        </div>

        <div className="panel">
          <h2>Requests waiting on you</h2>
          {waiting.length === 0 ? (
            <p className="panel-lead">Nothing blocked or waiting.</p>
          ) : (
            waiting.map((t) => (
              <div key={t.id} className="list-item">
                <strong>{t.title}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--warn)" }}>{t.blockReason}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {announcements.length > 0 && (
        <div className="panel">
          <h2>Announcements</h2>
          {announcements.map((a) => (
            <div key={a.id} className="list-item">
              <strong>{a.title}</strong>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.25rem" }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {reminders.length > 0 && (
        <div className="panel">
          <h2>Important reminders</h2>
          {reminders.map((r) => (
            <div key={r.id} className="list-item">
              ⏰ {r.title}
            </div>
          ))}
        </div>
      )}
    </TeamShell>
  );
}
