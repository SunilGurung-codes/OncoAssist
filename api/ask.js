import { askOpenRouter, findPatient } from "../server/ai.js";

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function getAppUrl(req) {
  const proto =
    req.headers["x-forwarded-proto"] || (req.headers.host?.includes("localhost") ? "http" : "https");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${proto}://${host}` : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const parsed = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const patient = findPatient(parsed.patientId);
    const question = String(parsed.question || "").trim();

    if (!question) {
      sendJson(res, 400, { error: "Question is required." });
      return;
    }

    const result = await askOpenRouter({
      patient,
      question,
      selectedText: parsed.selectedText || "",
      conversation: Array.isArray(parsed.conversation) ? parsed.conversation : [],
      context: Array.isArray(parsed.context) ? parsed.context : [],
      appUrl: getAppUrl(req),
    });

    if (!result.ok) {
      sendJson(res, result.status || 500, { error: result.error });
      return;
    }

    sendJson(res, 200, {
      answer: result.answer,
      model: result.model,
      usage: result.usage,
      patientId: patient.id,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
}
