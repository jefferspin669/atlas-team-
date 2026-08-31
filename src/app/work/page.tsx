"use client";

import { useCallback, useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { TaskCard, TaskDetail } from "@/components/TaskCard";
import { getSignedInEmployee } from "@/lib/demo-data";
import {
  addTaskComment,
  blockTask,
  completeTask,
  getTasksForEmployee,
  startTask,
} from "@/lib/data";
import type { Employee, Task, TaskStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "waiting", "completed"];

export default function WorkPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    setTasks(getTasksForEmployee(me.id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  function handleStart() {
    if (!selected || !employee) return;
    startTask(selected.id);
    setFlash(`Started "${selected.title}" — your manager can see the status.`);
    refresh();
    setTimeout(() => setFlash(null), 3000);
  }

  function handleComplete() {
    if (!selected) return;
    completeTask(selected.id);
    setFlash(`Completed "${selected.title}".`);
    refresh();
    setTimeout(() => setFlash(null), 3000);
  }

  function handleBlock() {
    if (!selected) return;
    const reason = prompt("Why is this blocked?") || "Waiting on input";
    blockTask(selected.id, reason);
    refresh();
  }

  function handleComment() {
    if (!selected || !employee || !commentDraft.trim()) return;
    addTaskComment(selected.id, employee, commentDraft.trim());
    setCommentDraft("");
    refresh();
  }

  if (!employee) return null;

  return (
    <TeamShell title="My Work">
      {flash && <div className="flash">{flash}</div>}

      <div className="panel">
        <h2>My Work</h2>
        <p className="panel-lead">
          Your main task area. Start tasks so your manager sees progress without asking.
        </p>
      </div>

      <div className="task-columns">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="task-column">
              <h3>{statusLabel(status)} ({columnTasks.length})</h3>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  selected={selectedId === task.id}
                  onClick={() => setSelectedId(task.id)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {selected && (
        <TaskDetail
          task={selected}
          onStart={handleStart}
          onComplete={handleComplete}
          onBlock={handleBlock}
          onComment={handleComment}
          commentDraft={commentDraft}
          onCommentChange={setCommentDraft}
        />
      )}
    </TeamShell>
  );
}
