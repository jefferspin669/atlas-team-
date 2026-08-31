"use client";

import { FormEvent, useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { getInventory, useInventory as recordInventoryUse } from "@/lib/data";
import type { Employee, InventoryItem } from "@/lib/types";

export default function InventoryPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  function refresh() {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setItems(getInventory());
  }

  useEffect(() => {
    refresh();
  }, []);

  function onUse(e: FormEvent) {
    e.preventDefault();
    if (!employee || !selected) return;
    const result = recordInventoryUse(employee, selected.id, quantity, reason);
    if (!result) {
      setFlash("Not enough inventory for that quantity.");
      return;
    }
    setFlash(`Used ${quantity} ${selected.unit} of ${selected.name}. Inventory updated.`);
    setSelected(null);
    setQuantity(1);
    setReason("");
    refresh();
    setTimeout(() => setFlash(null), 3000);
  }

  if (!employee) return null;

  if (!employee.permissions.inventory) {
    return (
      <TeamShell title="Inventory">
        <div className="panel">
          <p className="panel-lead">You don&apos;t have inventory permissions. Contact your manager if you need access.</p>
        </div>
      </TeamShell>
    );
  }

  return (
    <TeamShell title="Inventory">
      {flash && <div className="flash">{flash}</div>}

      <div className="panel">
        <h2>Use Inventory</h2>
        <p className="panel-lead">Select an item, enter quantity and reason. Atlas records who did what.</p>
      </div>

      {items.map((item) => (
        <div key={item.id} className="inv-row">
          <div>
            <strong>{item.name}</strong>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              {item.location} · SKU {item.sku}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="inv-qty">{item.quantity} {item.unit}</span>
            <button className="btn btn-sm" onClick={() => setSelected(item)}>Use</button>
          </div>
        </div>
      ))}

      {selected && (
        <div className="panel">
          <h2>Use {selected.name}</h2>
          <p className="panel-lead">Current: {selected.quantity} {selected.unit}</p>
          <form className="form-grid" onSubmit={onUse} style={{ marginTop: "1rem" }}>
            <label>
              Quantity
              <input
                type="number"
                min={1}
                max={selected.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <label>
              Reason
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Customer job"
                required
              />
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" type="submit">Confirm</button>
              <button className="btn" type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </TeamShell>
  );
}
