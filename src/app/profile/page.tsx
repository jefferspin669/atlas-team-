"use client";

import { useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import type { Employee } from "@/lib/types";

export default function ProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setPhone(me.phone);
  }, []);

  if (!employee) return null;

  return (
    <TeamShell title="My Profile">
      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: "1.25rem" }}>
            {employee.firstName.charAt(0)}
            {employee.name.split(" ")[1]?.charAt(0)}
          </div>
          <div>
            <h2 style={{ marginBottom: 0 }}>{employee.name}</h2>
            <p className="panel-lead">{employee.position}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-field locked">
            <label>Name</label>
            <span>{employee.name}</span>
          </div>
          <div className="profile-field locked">
            <label>Position</label>
            <span>{employee.position}</span>
          </div>
          <div className="profile-field locked">
            <label>Department</label>
            <span>{employee.department}</span>
          </div>
          <div className="profile-field locked">
            <label>Manager</label>
            <span>{employee.managerName}</span>
          </div>
          <div className="profile-field locked">
            <label>Work location</label>
            <span>{employee.location}</span>
          </div>
          <div className="profile-field">
            <label>Contact — phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="profile-field locked">
            <label>Email</label>
            <span>{employee.email}</span>
          </div>
          <div className="profile-field locked">
            <label>Time-off balance</label>
            <span>{employee.ptoBalance} days</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Assigned projects</h2>
        {employee.projects.map((p) => (
          <div key={p} className="list-item">{p}</div>
        ))}
      </div>

      <div className="panel">
        <h2>Schedule</h2>
        <p className="panel-lead">View your full schedule in the <a href="/schedule" style={{ color: "var(--accent)" }}>Schedule</a> section.</p>
      </div>
    </TeamShell>
  );
}
