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
    selectedText ? `Selected text: ${selectedText}` : null,
    `Question: ${question}`,
    `Dragged context references: ${contextLabels}`,
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
            "Keep answers concise, clinically literate, and easy to read.",
            "Avoid markdown formatting such as # headings, **bold**, or bullet-heavy styling unless the user explicitly asks for it.",
            "Use plain clinical prose and simple hyphens instead of em dashes.",
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
    answer: payload?.choices?.[0]?.message?.content || "No response returned from model.",
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
