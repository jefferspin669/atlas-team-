"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import type { Employee } from "@/lib/types";
import { getSignedInEmployee } from "@/lib/demo-data";
import { clearSession } from "@/lib/store";
import { unreadNotificationCount } from "@/lib/data";
import { canAccessInventory } from "@/lib/permissions";

type NavItem = { href: string; label: string; icon: string; show?: (e: Employee) => boolean };

const NAV: NavItem[] = [
  { href: "/today", label: "Today", icon: "☀️" },
  { href: "/ask", label: "Ask Atlas", icon: "✨" },
  { href: "/work", label: "My Work", icon: "📋" },
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/time-off", label: "Time Off", icon: "🏖️" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/resources", label: "Company Resources", icon: "📚" },
  { href: "/expenses", label: "Expenses", icon: "🧾" },
  { href: "/inventory", label: "Inventory", icon: "📦", show: canAccessInventory },
  { href: "/profile", label: "My Profile", icon: "👤" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
];

export function TeamShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const me = getSignedInEmployee();
    if (!me) {
      router.replace("/login");
      return;
    }
    setEmployee(me);
    setUnread(unreadNotificationCount(me.id));
  }, [router, pathname]);

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  if (!employee) {
    return (
      <div className="auth-page">
        <p style={{ color: "#f4f8fc" }}>Loading…</p>
      </div>
    );
  }

  const initials = employee.firstName.charAt(0) + (employee.name.split(" ")[1]?.charAt(0) ?? "");

  return (
    <div className="team-shell">
      <aside className="team-sidebar">
        <div className="sidebar-brand">
          <div className="logo">
            Atlas <span>Team</span>
          </div>
          <div className="sidebar-subtitle">Employee Portal</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.filter((item) => !item.show || item.show(employee)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${pathname === item.href ? " active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ color: "var(--sidebar-text-strong)", fontWeight: 500 }}>{employee.firstName}</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.6 }}>{employee.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: "0.75rem", color: "var(--sidebar-text)" }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="team-main">
        <header className="team-topbar">
          <h1 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{title ?? "Atlas Team"}</h1>
          <Link href="/notifications" className="notif-bell">
            🔔
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </Link>
        </header>
        <main className="team-content">{children}</main>
      </div>
    </div>
  );
}
