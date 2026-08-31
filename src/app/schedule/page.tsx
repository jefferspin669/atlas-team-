"use client";

import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { getCalendarEvents, getShiftsForEmployee } from "@/lib/data";
import { canViewTeamCalendar } from "@/lib/permissions";
import type { CalendarEvent, Employee } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  shift: "Shift",
  meeting: "Meeting",
  deadline: "Deadline",
  timeoff: "Time Off",
  event: "Company Event",
};

export default function SchedulePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<"mine" | "team">("mine");

  useEffect(() => {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setEvents(getCalendarEvents(me));
  }, []);

  if (!employee) return null;

  const shifts = getShiftsForEmployee(employee.id);
  const showTeam = canViewTeamCalendar(employee);

  return (
    <TeamShell title="Schedule">
      <div className="panel">
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            className={`btn btn-sm${view === "mine" ? " btn-primary" : ""}`}
            onClick={() => setView("mine")}
          >
            My Schedule
          </button>
          {showTeam && (
            <button
              className={`btn btn-sm${view === "team" ? " btn-primary" : ""}`}
              onClick={() => setView("team")}
            >
              Team Calendar
            </button>
          )}
        </div>
        <p className="panel-lead">
          {view === "mine"
            ? "Your shifts, meetings, deadlines, approved time off, and company events."
            : "Team events you have access to — not the full company calendar."}
        </p>
      </div>

      {view === "mine" && shifts.length > 0 && (
        <div className="panel">
          <h2>This week&apos;s shifts</h2>
          {shifts.map((s) => (
            <div key={s.id} className="list-item">
              <strong>{formatDate(s.date)}</strong> — {s.startTime} to {s.endTime}
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>{s.location}</div>
            </div>
          ))}
        </div>
      )}

      <div className="panel">
        <h2>Calendar</h2>
        <div className="event-list">
          {events.length === 0 ? (
            <p className="empty-state">No upcoming events.</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="event-item">
                <div className="event-time">
                  {e.allDay ? "All day" : formatTime(e.startAt)}
                </div>
                <div>
                  <div className="event-type">{TYPE_LABELS[e.type] ?? e.type}</div>
                  <strong>{e.title}</strong>
                  {!e.allDay && (
                    <div style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                      {formatDate(e.startAt.slice(0, 10))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TeamShell>
  );
}
