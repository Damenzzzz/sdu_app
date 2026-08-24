// AI provider abstraction.
//
// Strategy (hybrid): try a local Ollama server first (private, offline, free).
// If it's not running, fall back to a cloud provider (stub here — wire your
// API key + endpoint later). If neither is available, return a helpful message
// so the UI never breaks.

export type ProviderStatus = "local" | "cloud" | "none";

const OLLAMA_URL = "http://127.0.0.1:11434";
const OLLAMA_MODEL = "qwen2.5:3b";

export async function detectProvider(): Promise<ProviderStatus> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: "GET" });
    if (res.ok) return "local";
  } catch {
    /* Ollama not running */
  }
  // Cloud fallback is wired later; report "none" until configured.
  return "none";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT =
  "You are SDUmi Assistant, a helpful study companion for SDU students. " +
  "Help with planning the day, breaking a syllabus into daily tasks, and explaining course material concisely. " +
  "Be brief and practical. When the student's real courses/schedule are provided below, use them.";

// `context` is a short snapshot of the student's real data (courses, today's
// classes, pending tasks) so answers are personalised.
export async function chat(messages: ChatMessage[], context?: string): Promise<string> {
  const status = await detectProvider();
  const system = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

  if (status === "local") {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    const data = await res.json();
    return data?.message?.content ?? "(empty response)";
  }

  // No provider available yet — friendly stub so the feature is demoable.
  return (
    "🤖 AI is not connected yet.\n\n" +
    "To enable the local assistant:\n" +
    "1. Install Ollama from ollama.com\n" +
    `2. Run:  ollama pull ${OLLAMA_MODEL}\n` +
    "3. Reopen this tab.\n\n" +
    "Once connected I can turn your syllabus into dailies, plan your day around " +
    "deadlines, and explain course topics."
  );
}
