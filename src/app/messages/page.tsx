"use client";

import { FormEvent, useEffect, useState } from "react";
import { TeamShell } from "@/components/TeamShell";
import { getSignedInEmployee } from "@/lib/demo-data";
import { getChannelsForEmployee, getMessages, sendMessage } from "@/lib/data";
import type { Channel, Employee, Message } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export default function MessagesPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function refresh() {
    const me = getSignedInEmployee();
    if (!me) return;
    setEmployee(me);
    const chans = getChannelsForEmployee(me.id);
    setChannels(chans);
    if (!activeChannel && chans.length) setActiveChannel(chans[0].id);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeChannel) {
      setMessages(getMessages(activeChannel));
    }
  }, [activeChannel]);

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!employee || !draft.trim() || !activeChannel) return;
    sendMessage(activeChannel, employee, draft.trim());
    setDraft("");
    setMessages(getMessages(activeChannel));
  }

  if (!employee) return null;

  const active = channels.find((c) => c.id === activeChannel);

  return (
    <TeamShell title="Messages">
      <div className="panel">
        <p className="panel-lead">
          Message your manager, coworkers, and project teams. Conversations from Boss Atlas appear here too — one backend, two interfaces.
        </p>
      </div>

      <div className="msg-layout">
        <div className="channel-list panel" style={{ padding: "0.5rem" }}>
          {channels.map((ch) => (
            <button
              key={ch.id}
              className={`channel-btn${ch.id === activeChannel ? " active" : ""}`}
              onClick={() => setActiveChannel(ch.id)}
            >
              {ch.type === "dm" ? "💬" : ch.type === "project" ? "📁" : ch.type === "announcement" ? "📢" : "👥"}{" "}
              {ch.name}
            </button>
          ))}
        </div>

        <div className="msg-thread">
          <div className="msg-thread-header">{active?.name ?? "Select a channel"}</div>
          <div className="msg-messages">
            {messages.length === 0 ? (
              <p className="empty-state">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`msg-bubble${m.senderId === employee.id ? " mine" : " theirs"}`}
                >
                  {m.senderId !== employee.id && <div className="msg-sender">{m.senderName}</div>}
                  {m.text}
                  <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: "0.2rem" }}>
                    {relativeTime(m.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
          <form className="msg-compose" onSubmit={onSend}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
            />
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </TeamShell>
  );
}
