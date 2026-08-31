"use client";

import type { Task } from "@/lib/types";
import { formatDate, priorityClass, statusLabel } from "@/lib/utils";

export function TaskCard({
  task,
  selected,
  onClick,
}: {
  task: Task;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className={`task-card${selected ? " selected" : ""}`} onClick={onClick}>
      <h4>{task.title}</h4>
      <div className="task-meta">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>
          Priority: <span className={priorityClass(task.priority)}>{task.priority}</span>
        </span>
        <span>Assigned by: {task.assignedByName}</span>
      </div>
      {task.status === "in_progress" && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
        </div>
      )}
      {task.blocked && <span className="badge warn" style={{ marginTop: "0.4rem" }}>Blocked</span>}
    </div>
  );
}

export function TaskDetail({
  task,
  onStart,
  onComplete,
  onBlock,
  onComment,
  commentDraft,
  onCommentChange,
}: {
  task: Task;
  onStart: () => void;
  onComplete: () => void;
  onBlock: () => void;
  onComment: () => void;
  commentDraft: string;
  onCommentChange: (v: string) => void;
}) {
  return (
    <div className="task-detail panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2>{task.title}</h2>
        <span className="badge muted">{statusLabel(task.status)}</span>
      </div>
      <p className="panel-lead" style={{ margin: "0.5rem 0 1rem" }}>{task.description}</p>
      <div className="task-meta" style={{ flexDirection: "row", flexWrap: "wrap", gap: "1rem" }}>
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Priority: <span className={priorityClass(task.priority)}>{task.priority}</span></span>
        <span>Assigned by: {task.assignedByName}</span>
        {task.project && <span>Project: {task.project}</span>}
      </div>
      {task.blocked && (
        <p className="flash warn" style={{ marginTop: "0.75rem" }}>
          Blocked: {task.blockReason}
        </p>
      )}
      <div className="task-actions">
        {task.status === "todo" && (
          <button className="btn btn-primary" onClick={onStart}>Start Task</button>
        )}
        {task.status === "in_progress" && (
          <button className="btn btn-primary" onClick={onComplete}>Complete</button>
        )}
        {task.status !== "completed" && task.status !== "waiting" && (
          <button className="btn" onClick={onBlock}>Mark Blocked</button>
        )}
        {task.status === "waiting" && (
          <button className="btn btn-primary" onClick={onStart}>Resume</button>
        )}
      </div>
      {task.comments.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>Comments</h3>
          {task.comments.map((c) => (
            <div key={c.id} className="list-item">
              <strong>{c.authorName}</strong>: {c.text}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "1rem" }}>
        <div className="chat-input-row">
          <input
            placeholder="Add a comment…"
            value={commentDraft}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onComment()}
          />
          <button className="btn" onClick={onComment}>Post</button>
        </div>
      </div>
    </div>
  );
}
