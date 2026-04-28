import { patientCharts } from "../src/data.js";

export const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

export function findPatient(patientId) {
  return patientCharts.find((chart) => chart.id === patientId) || patientCharts[0];
}

function summarizeRows(rows = []) {
  return rows
    .map((row) => {
      const flag = row.flag ? ` (${row.flag})` : "";
      const note = row.note ? ` — ${row.note}` : "";
      return `${row.name}: ${row.v}${row.unit ? ` ${row.unit}` : ""}${flag}${row.ref ? ` [ref ${row.ref}]` : ""}${note}`;
    })
    .join("\n");
}

function summarizeNotes(notes = [], maxNotes = 6) {
  return notes
    .slice(0, maxNotes)
    .map((note, index) => {
      const byline = [note.author, note.date].filter(Boolean).join(" · ");
      return `${index + 1}. ${note.dept} | ${note.type} | ${byline}\n${note.preview}`;
    })
    .join("\n\n");
}

function summarizeImaging(imaging = [], maxStudies = 4) {
  return imaging
    .slice(0, maxStudies)
    .map(
      (study, index) =>
        `${index + 1}. ${study.type} | ${study.date} | ${study.author}\nFindings: ${study.findings}\nImpression: ${study.impression}\nClinical note: ${study.note}`,
    )
    .join("\n\n");
}

function summarizeNoteStates(notes = []) {
  const counts = notes.reduce((acc, note) => {
    const key = note.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([status, count]) => `${status}: ${count}`)
    .join(", ");
}

function buildPrompt({ patient, question, selectedText, conversation = [], context = [] }) {
  const meds = (patient.medications || []).join(", ");
  const problems = (patient.comorbidities || []).join(", ");
  const allergies = (patient.allergies || []).join(", ");
  const contextLabels =
    context.length > 0 ? context.map((item) => `${item.kind}: ${item.label}`).join("; ") : "None";

  return [
    `Patient: ${patient.name} (${patient.demo}, ${patient.mrn})`,
    `Visit: ${patient.visitDate} ${patient.visitTime} with ${patient.provider}`,
    `Reason: ${patient.reason}`,
    `Diagnosis summary: ${patient.dx}`,
    `Cancer details: ${patient.diagnosis.primaryCancer}; stage ${patient.diagnosis.stage}; Gleason ${patient.diagnosis.gleason}; ECOG ${patient.diagnosis.ecog}`,
    `Comorbidities: ${problems}`,
    `Allergies: ${allergies}`,
    `Medications: ${meds}`,
    `Loaded context in this chat: ${contextLabels}`,
    `Available chart domains: notes, labs, imaging, medications, orders, transcript, demographics, diagnosis, flags, PSA trend`,
    `Current note states in chart: ${summarizeNoteStates(patient.notes) || "None"}`,
    selectedText ? `Selected text: ${selectedText}` : null,
    `Question: ${question}`,
    `Recent notes:\n${summarizeNotes(patient.notes)}`,
    `CBC / general labs (${patient.labsCBC.date}):\n${summarizeRows(patient.labsCBC.rows)}`,
    `PSA / disease labs (${patient.labsPSA.date}):\n${summarizeRows(patient.labsPSA.rows)}`,
    `Imaging:\n${summarizeImaging(patient.imaging)}`,
    conversation.length > 0
      ? `Conversation so far:\n${conversation.map((msg) => `${msg.role}: ${msg.text}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizeAssistantText(text = "") {
  return String(text)
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\u2014/g, "-")
    .replace(/\u2022/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function askOpenRouter({ patient, question, selectedText, conversation, context, appUrl }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error:
        "OpenRouter is not configured yet. Add OPENROUTER_API_KEY to your environment before using live AI responses.",
    };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(appUrl ? { "HTTP-Referer": appUrl } : {}),
      "X-OpenRouter-Title": "OncoAssist",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: [
            "You are OncoAssist, a clinical education assistant for a fictional college project.",
            "Use only the patient context provided in the prompt.",
            "Do not invent facts not supported by the supplied chart data.",
            "If the context is insufficient, say that clearly.",
            "Before answering, silently verify every date, number, medication, lab value, and trend against the supplied chart data.",
            "Be especially careful with numeric comparisons and time ordering.",
            "If a later value is lower than an earlier value, describe it as a decrease, not an increase.",
            "If a value is still abnormal but has improved, say both facts clearly.",
            "Do not describe disease progression unless the supplied context actually supports progression.",
            "If multiple chart facts appear to conflict, acknowledge the ambiguity instead of forcing a conclusion.",
            "Assume the chart is a synthetic demo EHR, but answer as if the workflow is real.",
            "You may reference or summarize only the context the user asked for plus any directly relevant loaded chart facts.",
            "Do not dump the entire chart unless the user explicitly asks for a full summary.",
            "When the user asks about an order, note update, medication update, or patient-data change, answer with the most relevant suggested action and what part of the chart it affects.",
            "Be aware of note states such as Draft, Signed, Resulted, and Final when referring to chart documents.",
            "Keep answers concise, clinically literate, and easy to read.",
            "Do not use markdown symbols like #, *, **, backticks, or bullet glyphs in your response.",
            "Write in clean plain text only.",
            "If emphasis is helpful, wrap only the most important phrase or value in double brackets like [[important phrase]].",
            "Use at most 1 to 3 highlighted phrases in a response, and only for the most important parts.",
            "Do not use any other symbol-based emphasis.",
            "Use simple hyphens instead of em dashes.",
            "Do not present yourself as a substitute for a clinician.",
          ].join(" "),
        },
        {
          role: "user",
          content: buildPrompt({ patient, question, selectedText, conversation, context }),
        },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || payload?.error || "OpenRouter request failed.";
    return { ok: false, status: response.status, error: message };
  }

  return {
    ok: true,
    answer: normalizeAssistantText(
      payload?.choices?.[0]?.message?.content || "No response returned from model.",
    ),
    model: payload?.model || MODEL,
    usage: payload?.usage || null,
  };
}

export function buildHealthPayload() {
  return {
    ok: true,
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    model: MODEL,
  };
}
