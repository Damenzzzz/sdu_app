import { useEffect, useRef, useState } from "react";
import { chat, detectProvider, type ChatMessage, type ProviderStatus } from "../ai/provider";
import { Icon } from "../components/Icon";

const suggestions = [
  "Turn my Calculus syllabus into daily tasks",
  "Plan my study day around today's classes",
  "Explain eigenvalues simply",
];

export function AI() {
  const [status, setStatus] = useState<ProviderStatus>("none");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your SDUmi study assistant. Ask me to plan your day, break down a syllabus, or explain a topic.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    detectProvider().then(setStatus);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const reply = await chat(next.filter((m) => m.role !== "system"));
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } finally {
      setBusy(false);
    }
  };

  const badge =
    status === "local"
      ? { color: "var(--green)", label: "Local model connected (Ollama)" }
      : status === "cloud"
      ? { color: "var(--blue)", label: "Cloud model" }
      : { color: "var(--amber)", label: "No model connected" };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">AI Assistant</div>
          <div className="provider-badge">
            <span className="dot" style={{ background: badge.color }} /> {badge.label}
          </div>
        </div>
      </div>

      <div className="card chat">
        <div className="chat-log" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "user" : "bot"}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="msg bot">Thinking…</div>}
        </div>

        {messages.length <= 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {suggestions.map((s) => (
              <button key={s} className="chip" style={{ cursor: "pointer", height: 30 }} onClick={() => send(s)}>
                <Icon name="sparkles" size={13} /> {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input">
          <input
            className="input"
            placeholder="Ask anything about your studies…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button className="btn btn-primary" onClick={() => send(input)} disabled={busy}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
