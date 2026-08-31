"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateEmployee, getSignedInEmployee, seedDemoData } from "@/lib/demo-data";
import { saveSession } from "@/lib/store";
import type { Employee } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    seedDemoData();
    if (getSignedInEmployee()) {
      router.replace("/today");
      return;
    }
    import("@/lib/demo-data").then(({ DEMO_EMPLOYEES }) => setEmployees(DEMO_EMPLOYEES));
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const member = authenticateEmployee(email, code);
    if (!member) {
      setError("We couldn't match that email and code. Check with your manager.");
      return;
    }
    saveSession(member.id);
    router.replace("/today");
  }

  function fillDemo(emp: Employee) {
    setEmail(emp.email);
    setCode(emp.accessCode);
    setError("");
  }

  return (
    <div className="auth-page">
      <div>
        <div className="auth-brand">
          <div className="logo">
            Atlas <span>Team</span>
          </div>
          <h1>Employee sign-in</h1>
          <p>Sign in with the email and access code your manager gave you.</p>
        </div>
        <div className="auth-card">
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Work email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              Access code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn btn-dark" type="submit">
              Sign in to Atlas Team
            </button>
          </form>
          {employees.length > 0 && (
            <>
              <div className="auth-divider">
                <span>demo accounts</span>
              </div>
              <div className="demo-list">
                {employees.map((emp) => (
                  <button key={emp.id} type="button" className="demo-btn" onClick={() => fillDemo(emp)}>
                    <span>
                      <strong>{emp.name}</strong>
                      <br />
                      <small>{emp.role} — {emp.department}</small>
                    </span>
                    <span className="badge">{emp.accessCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
