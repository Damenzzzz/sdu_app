import { useEffect, useMemo, useRef, useState } from "react";
import { chat, detectProvider, type ChatMessage, type ProviderStatus } from "../ai/provider";
import { useSchedule } from "../sdu/useSchedule";
import { useDailies } from "../store/useDailies";
import { Icon } from "../components/Icon";

function todayIndex() {
  const d = new Date().getDay();
  return d === 0 || d === 6 ? 0 : d - 1;
}

export function AI() {
  const [status, setStatus] = useState<ProviderStatus>("none");
  const { entries, courses } = useSchedule();
  const dailies = useDailies();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your SDUmi study assistant. I can see your courses, today's classes and your tasks — ask me to plan your day, break a course into tasks, or explain a topic.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Snapshot of the student's real data, sent to the model as context.
  const context = useMemo(() => {
    const ti = todayIndex();
    const todays = entries
      .filter((e) => e.day === ti)
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((e) => {
        const c = courses.find((x) => x.id === e.courseId);
        return `${e.start}-${e.end} ${c?.code ?? e.courseId}${e.room ? " (" + e.room + ")" : ""}`;
      });
    const courseList = courses.map((c) => `${c.code}${c.title ? " " + c.title : ""}`);
    const pending = dailies.items.filter((d) => !d.done).map((d) => d.title);
    return [
      "STUDENT CONTEXT:",
      `Courses: ${courseList.join("; ") || "unknown"}`,
      `Today's classes: ${todays.join("; ") || "none"}`,
      `Pending tasks: ${pending.join("; ") || "none"}`,
    ].join("\n");
  }, [entries, courses, dailies.items]);

  const suggestions = useMemo(() => {
    const firstCourse = courses[0]?.code ?? "my course";
    return [
      "Plan my study day around today's classes",
      `Break ${firstCourse} into 3 daily tasks`,
      "What should I focus on this week?",
    ];
  }, [courses]);

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
      const reply = await chat(next.filter((m) => m.role !== "system"), context);
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
