export type ActionRow = {
  task: string;
  assignee: string | null;
  due_date: string | null;
  status: string;
  priority: string;
  progress: number;
};

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadActionsCsv(rows: ActionRow[], filename = "action-items.csv") {
  const header = ["Task", "Assignee", "Due date", "Status", "Priority", "Progress"];
  const body = rows.map((r) =>
    [r.task, r.assignee ?? "", r.due_date ?? "", r.status, r.priority, `${r.progress}%`]
      .map(escapeCell)
      .join(","),
  );
  download(filename, [header.map(escapeCell).join(","), ...body].join("\n"), "text/csv;charset=utf-8");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type MeetingExport = {
  title: string;
  meetingDate: string;
  meetingType: string;
  participants: string[];
  executiveSummary?: string | null;
  keyPoints?: string[];
  decisions?: string[];
  risks?: string[];
  followUpQuestions?: string[];
  actionItems?: ActionRow[];
};

function list(title: string, items?: string[]) {
  if (!items || items.length === 0) return "";
  return `<h2>${escapeHtml(title)}</h2><ul>${items
    .map((i) => `<li>${escapeHtml(i)}</li>`)
    .join("")}</ul>`;
}

/** Opens a print-ready document; the browser print dialog can save it as PDF. */
export function exportMeetingPdf(meeting: MeetingExport) {
  const actions = (meeting.actionItems ?? [])
    .map(
      (a) =>
        `<tr><td>${escapeHtml(a.task)}</td><td>${escapeHtml(a.assignee ?? "—")}</td><td>${escapeHtml(
          a.due_date ?? "—",
        )}</td><td>${escapeHtml(a.status)}</td><td>${escapeHtml(a.priority)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    meeting.title,
  )}</title><style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#101828;margin:40px;line-height:1.55}
    h1{font-size:26px;margin:0 0 4px}
    h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#2f5fd0;margin:26px 0 8px}
    .meta{color:#667085;font-size:13px;margin-bottom:8px}
    ul{margin:0;padding-left:20px}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
    th,td{text-align:left;border-bottom:1px solid #e4e7ec;padding:7px 8px}
    th{color:#667085;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    footer{margin-top:36px;color:#98a2b3;font-size:11px}
  </style></head><body>
    <h1>${escapeHtml(meeting.title)}</h1>
    <div class="meta">${escapeHtml(meeting.meetingType)} · ${escapeHtml(meeting.meetingDate)}</div>
    <div class="meta">Participants: ${escapeHtml(meeting.participants.join(", ") || "—")}</div>
    ${
      meeting.executiveSummary
        ? `<h2>Executive summary</h2><p>${escapeHtml(meeting.executiveSummary)}</p>`
        : ""
    }
    ${list("Key discussion points", meeting.keyPoints)}
    ${list("Decisions made", meeting.decisions)}
    ${list("Risks", meeting.risks)}
    ${list("Follow-up questions", meeting.followUpQuestions)}
    ${
      actions
        ? `<h2>Action items</h2><table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Priority</th></tr></thead><tbody>${actions}</tbody></table>`
        : ""
    }
    <footer>Generated with MinuteFlow</footer>
  </body></html>`;

  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
  return true;
}
