"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/data";
import type { Employee, Notification } from "@/lib/types";
import { notificationIcon, relativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function refresh() {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setNotifications(getNotifications(me.id));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleRead(id: string) {
    markNotificationRead(id);
    refresh();
  }

  function handleReadAll() {
    if (!employee) return;
    markAllNotificationsRead(employee.id);
    refresh();
  }

  if (!employee) return null;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <TeamShell title="Notifications">
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p className="panel-lead" style={{ margin: 0 }}>
          {unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "All caught up."}
        </p>
        {unread > 0 && (
          <button className="btn btn-sm" onClick={handleReadAll}>Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="panel empty-state">No notifications yet.</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notif-item${n.read ? "" : " unread"}`}
            onClick={() => handleRead(n.id)}
            style={{ cursor: "pointer" }}
          >
            <span className="notif-icon">{notificationIcon(n.kind)}</span>
            <div className="notif-body" style={{ flex: 1 }}>
              <h4>{n.title}</h4>
              <p>{n.body}</p>
              <div className="notif-time">{relativeTime(n.createdAt)}</div>
              {n.actionHref && n.actionLabel && (
                <Link href={n.actionHref} className="btn btn-sm" style={{ marginTop: "0.5rem" }}>
                  {n.actionLabel}
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </TeamShell>
  );
}
