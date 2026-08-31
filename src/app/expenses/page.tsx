"use client";

import { FormEvent, useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { createExpense, getExpensesForEmployee, sampleReceiptExtraction } from "@/lib/data";
import type { Employee, Expense } from "@/lib/types";
import { formatCurrency, formatDate, statusLabel } from "@/lib/utils";

export default function ExpensesPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [draft, setDraft] = useState<{ merchant: string; amount: number; date: string } | null>(null);
  const [project, setProject] = useState("");
  const [category, setCategory] = useState("Supplies");
  const [flash, setFlash] = useState<string | null>(null);

  function refresh() {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setExpenses(getExpensesForEmployee(me.id));
    if (!project && me.projects.length) setProject(me.projects[0]);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scanReceipt() {
    setDraft(sampleReceiptExtraction());
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!employee || !draft) return;
    createExpense(employee, {
      merchant: draft.merchant,
      amount: draft.amount,
      date: draft.date,
      category,
      project,
    });
    setFlash(`Expense submitted: ${draft.merchant} — ${formatCurrency(draft.amount)}. Your manager will see it on Boss Atlas.`);
    setDraft(null);
    refresh();
    setTimeout(() => setFlash(null), 4000);
  }

  if (!employee) return null;

  return (
    <TeamShell title="Expenses">
      {flash && <div className="flash">{flash}</div>}

      <div className="panel">
        <h2>Submit Expense</h2>
        <p className="panel-lead" style={{ marginBottom: "1rem" }}>
          Take a receipt photo — Atlas extracts the details. Choose what it was for and submit.
        </p>
        {!draft ? (
          <button className="btn btn-primary" onClick={scanReceipt}>
            📷 Scan Receipt (demo)
          </button>
        ) : (
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="flash">
              Atlas extracted: <strong>{draft.merchant}</strong> — {formatCurrency(draft.amount)} — {formatDate(draft.date)}
            </div>
            <label>
              What was this for?
              <select value={project} onChange={(e) => setProject(e.target.value)}>
                {employee.projects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Supplies</option>
                <option>Travel</option>
                <option>Meals</option>
                <option>Equipment</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">Submit Expense</button>
              <button className="btn" type="button" onClick={() => setDraft(null)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="panel">
        <h2>Your expenses</h2>
        {expenses.length === 0 ? (
          <p className="panel-lead">No expenses submitted yet.</p>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="list-item" style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{e.merchant}</strong> — {formatCurrency(e.amount)}
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  {formatDate(e.date)} · {e.project}
                </div>
              </div>
              <span className="badge">{statusLabel(e.status)}</span>
            </div>
          ))
        )}
      </div>
    </TeamShell>
  );
}
