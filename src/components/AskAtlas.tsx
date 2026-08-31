"use client";

import { useState } from "react";
import type { AtlasReply } from "@/lib/types";

type ChatMessage = { role: "user" | "ai"; text: string; denied?: boolean };

const SUGGESTIONS = [
  "What am I supposed to work on today?",
  "What's our refund policy?",
  "When is my next shift?",
  "Summarize the project I'm working on.",
  "Tell Sarah I'm waiting on the customer.",
];

export function AskAtlasPanel({
  onAsk,
  placeholder = "Ask Atlas anything about your work…",
}: {
  onAsk: (input: string) => AtlasReply;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  function submit(text: string) {
    if (!text.trim()) return;
    const reply = onAsk(text.trim());
    setMessages((prev) => [
      ...prev,
      { role: "user", text: text.trim() },
      { role: "ai", text: reply.text, denied: reply.denied },
    ]);
    setInput("");
  }

  return (
    <div>
      <div className="chat-box">
        {messages.length === 0 && (
          <p className="panel-lead">
            Atlas knows your tasks, schedule, and company policies — and respects your permissions.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}${m.denied ? " denied" : ""}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="suggestion-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => submit(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && submit(input)}
        />
        <button className="btn btn-primary" onClick={() => submit(input)}>
          Ask
        </button>
      </div>
    </div>
  );
}
