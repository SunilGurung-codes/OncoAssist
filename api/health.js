import { buildHealthPayload } from "../server/ai.js";

export default function handler(_req, res) {
  res.status(200).json(buildHealthPayload());
}
