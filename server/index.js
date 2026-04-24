import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { askOpenRouter, buildHealthPayload, findPatient } from "./ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const rawLine of envLines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const PORT = Number(process.env.PORT || 8787);

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/health") {
    json(res, 200, buildHealthPayload());
    return;
  }

  if (req.method === "POST" && req.url === "/api/ask") {
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      const parsed = body ? JSON.parse(body) : {};
      const patient = findPatient(parsed.patientId);
      const question = String(parsed.question || "").trim();

      if (!question) {
        json(res, 400, { error: "Question is required." });
        return;
      }

      const result = await askOpenRouter({
        patient,
        question,
        selectedText: parsed.selectedText || "",
        conversation: Array.isArray(parsed.conversation) ? parsed.conversation : [],
        context: Array.isArray(parsed.context) ? parsed.context : [],
        appUrl: "http://localhost:5173",
      });

      if (!result.ok) {
        json(res, result.status || 500, { error: result.error });
        return;
      }

      json(res, 200, {
        answer: result.answer,
        model: result.model,
        usage: result.usage,
        patientId: patient.id,
      });
    } catch (error) {
      json(res, 500, {
        error: error instanceof Error ? error.message : "Unexpected server error.",
      });
    }
    return;
  }

  json(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`OncoAssist local AI server listening on http://localhost:${PORT}`);
});
