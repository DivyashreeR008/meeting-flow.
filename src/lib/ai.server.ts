export type GeneratedInsights = {
  executive_summary: string;
  key_points: string[];
  decisions: string[];
  risks: string[];
  follow_up_questions: string[];
  action_items: {
    task: string;
    assignee?: string | null;
    due_date?: string | null;
    priority?: "low" | "medium" | "high";
  }[];
};

const SYSTEM_PROMPT = `You are MinuteFlow, an expert meeting analyst.
Read the transcript or raw notes and produce structured minutes.
Be concise, concrete and business-ready. Never invent facts that are not supported by the text.
Return ONLY valid JSON with this exact shape:
{
  "executive_summary": string,
  "key_points": string[],
  "decisions": string[],
  "risks": string[],
  "follow_up_questions": string[],
  "action_items": [{ "task": string, "assignee": string | null, "due_date": string | null, "priority": "low" | "medium" | "high" }]
}
due_date must be an ISO date (YYYY-MM-DD) or null.`;

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).filter(Boolean).slice(0, 20);
}

export function normalizeInsights(raw: unknown): GeneratedInsights {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const actions = Array.isArray(obj["action_items"]) ? (obj["action_items"] as unknown[]) : [];

  return {
    executive_summary:
      typeof obj["executive_summary"] === "string" ? (obj["executive_summary"] as string) : "",
    key_points: safeArray(obj["key_points"]),
    decisions: safeArray(obj["decisions"]),
    risks: safeArray(obj["risks"]),
    follow_up_questions: safeArray(obj["follow_up_questions"]),
    action_items: actions
      .slice(0, 25)
      .map((a): GeneratedInsights["action_items"][number] => {
        const item = (a ?? {}) as Record<string, unknown>;
        const task = typeof item["task"] === "string" ? (item["task"] as string) : "";
        const priority = item["priority"];
        const due = item["due_date"];
        return {
          task,
          assignee: typeof item["assignee"] === "string" ? (item["assignee"] as string) : null,
          due_date: typeof due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null,
          priority:
            priority === "low" || priority === "high" ? priority : "medium",
        };
      })
      .filter((a) => a.task.length > 0),
  };
}

export async function generateInsights(input: {
  title: string;
  meetingType: string;
  participants: string[];
  transcript: string;
}): Promise<GeneratedInsights> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Meeting title: ${input.title}
Meeting type: ${input.meetingType}
Participants: ${input.participants.join(", ") || "unknown"}

Transcript / notes:
${input.transcript.slice(0, 60000)}`,
        },
      ],
    }),
  });

  if (response.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
  if (response.status === 402) throw new Error("AI credits exhausted for this workspace.");
  if (!response.ok) throw new Error(`AI request failed (${response.status}).`);

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content ?? "{}";

  let parsed: unknown = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : {};
  }

  return normalizeInsights(parsed);
}
