const note = (patientId, suffix, dept, type, author, date, status, preview, extra = {}) => ({
  id: `${patientId}-${suffix}`,
  dept,
  type,
  author,
  date,
  status,
  preview,
  ...extra,
});

const imagingStudy = (patientId, suffix, dept, type, date, author, thumb, findings, impression, noteText) => ({
  id: `${patientId}-${suffix}`,
  dept,
  type,
  date,
  author,
  thumb,
  findings,
  impression,
  note: noteText,
});

const cbcPanel = (date, rows) => ({ date, rows });
const psaPanel = (date, rows) => ({ date, rows });

const SYNTHETIC_PATIENT_NAMES = [
  "Demo Patient Alpha",
  "Demo Patient Bravo",
  "Demo Patient Charlie",
  "Demo Patient Delta",
  "Demo Patient Echo",
  "Demo Patient Foxtrot",
  "Demo Patient Gamma",
  "Demo Patient Helix",
  "Demo Patient Indigo",
  "Demo Patient Juniper",
  "Demo Patient Kilo",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BASELINE_APP_DATE = new Date(2026, 3, 17);
const TODAY = new Date();
const APP_DAY_OFFSET = Math.round(
  (new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) - BASELINE_APP_DATE) / 86400000,
);

function shiftDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthIndex(mon) {
  return MONTHS.indexOf(mon);
}

function formatMonthDayYear(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonthDayTime(date, time) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()} · ${time}`;
}

function formatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDisplayDateString(value) {
  const match = String(value || "").match(/^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/);
  if (!match) return value;
  const [, mon, day, year] = match;
  const date = new Date(Number(year), monthIndex(mon), Number(day));
  return formatMonthDayYear(shiftDate(date, APP_DAY_OFFSET));
}

function shiftDateTimeStamp(value) {
  const match = String(value || "").match(/^([A-Z][a-z]{2}) (\d{1,2}) · (\d{2}:\d{2})$/);
  if (!match) return value;
  const [, mon, day, time] = match;
  const date = new Date(2026, monthIndex(mon), Number(day));
  return formatMonthDayTime(shiftDate(date, APP_DAY_OFFSET), time);
}

function normalizeProviderName(value = "") {
  return String(value)
    .replace(/\bDr\. I\. Riaz\b/g, "Dr. XYZ")
    .replace(/\bDr\. Riaz\b/g, "Dr. XYZ")
    .replace(/\bL\.Riaz, MD\b/g, "XYZ, MD")
    .replace(/\bIR\b/g, "XY");
}

function shiftStringDates(value = "") {
  return String(value)
    .replace(/\b([A-Z][a-z]{2}) (\d{1,2}), (\d{4})\b/g, (_, mon, day, year) =>
      formatMonthDayYear(shiftDate(new Date(Number(year), monthIndex(mon), Number(day)), APP_DAY_OFFSET)),
    )
    .replace(/\b([A-Z][a-z]{2}) (\d{1,2}) · (\d{2}:\d{2})\b/g, (_, mon, day, time) =>
      formatMonthDayTime(shiftDate(new Date(2026, monthIndex(mon), Number(day)), APP_DAY_OFFSET), time),
    );
}

function deepMapStrings(value, transform) {
  if (typeof value === "string") return transform(value);
  if (Array.isArray(value)) return value.map((item) => deepMapStrings(item, transform));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepMapStrings(item, transform)]));
  }
  return value;
}

export const patientCharts = [
  {
    id: "james-park",
    mrn: "MRN-003291",
    name: "James Park",
    initials: "JP",
    demo: "67M",
    age: 67,
    sex: "Male",
    dob: "1958-10-12",
    type: "Outpatient",
    avatarBg: "#C7D9EB",
    primary: true,
    visitDate: "Apr 17, 2026",
    visitTime: "09:00",
    provider: "Dr. I. Riaz",
    dx: "Prostate adenoca · CRPC · Gleason 4+3",
    status: "Urgent",
    statusColor: "red",
    reason: "Day 14 Enzalutamide · PSA follow-up",
    diagnosis: {
      primaryCancer: "Prostate adenocarcinoma",
      stage: "mCRPC by clinical workflow prototype",
      gleason: "4+3=7",
      diagnosisDate: "2022-03-11",
      ecog: "0",
      pathology: "Acinar adenocarcinoma from 12-core biopsy; dominant left base core 70% involvement.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Hypertension", "Hyperlipidemia", "Osteopenia"],
    medications: [
      "Enzalutamide 160mg PO daily",
      "Leuprolide 22.5mg IM q3mo",
      "Amlodipine 5mg PO daily",
      "Vitamin D3 2000 IU daily",
    ],
    flags: [
      { tone: "red", text: "PSA rose 5.2 → 18.4 over 7 months on ADT alone — CRPC confirmed Apr 1" },
      { tone: "green", text: "Testosterone suppressed < 50 ng/dL (castrate range maintained)" },
      { tone: "blue", text: "Started Enzalutamide 160mg Mar 28 — Day 14 today" },
      { tone: "amber", text: "Prior auth approved · patient counselled on seizure + fall risk" },
    ],
    psa: [
      { m: "Oct", v: 5.2 },
      { m: "Nov", v: 6.8 },
      { m: "Dec", v: 9.1 },
      { m: "Jan", v: 12.4 },
      { m: "Feb", v: 15.8 },
      { m: "Mar", v: 18.4 },
      { m: "Apr", v: 16.2, drop: true },
    ],
    notes: [
      note("james-park", "n1", "Oncology", "Consultant Note · CRPC escalation", "Dr. I. Riaz", "Apr 1 · 14:30", "Signed", "PSA tripled over 6 months on ADT alone. Meets NCCN criteria for M0 CRPC. Starting Enzalutamide 160mg QD.", { pinned: true }),
      note("james-park", "n2", "Oncology", "Progress Note · Enzalutamide start", "Dr. S. Barker", "Apr 3 · 09:10", "Signed", "Enzalutamide 160mg dispensed. Prior auth approved. Patient counselled on side effects. Next PSA at Apr 17 visit.", { cosign: "Dr. I. Riaz" }),
      note("james-park", "n3", "Radiology", "CT Abd/Pelvis w/ contrast", "Dr. K. Nguyen", "Mar 20 · 11:40", "Final", "No adenopathy. No visceral metastases. Prostate gland 45cc. No interval change from prior."),
      note("james-park", "n4", "Radiology", "Tc-99m Bone Scan", "Dr. K. Nguyen", "Mar 20 · 13:00", "Final", "No abnormal radiotracer uptake to suggest osseous metastatic disease. Degenerative changes lumbar spine."),
      note("james-park", "n5", "Urology", "Progress Note · follow-up", "Dr. M. Choi", "Feb 18 · 10:20", "Signed", "PSA rising despite ADT. Coordinating with oncology for ARPI consideration. Continue Leuprolide."),
      note("james-park", "n6", "Lab", "PSA + Testosterone panel", "Lab · Mayo Central", "Apr 17 · 07:45", "Resulted", "PSA 16.2 ng/mL (H). Testosterone < 50 ng/dL. LH 0.8, FSH 1.4."),
      note("james-park", "n7", "Oncology", "Phone encounter · symptom check", "Dr. S. Barker", "Apr 10 · 16:20", "Signed", "Patient reports mild fatigue, 3 hot flashes/week on Enzalutamide. No falls, no seizure activity. Reassured."),
      note("james-park", "n8", "Pharmacy", "Medication reconciliation", "Pharm. J. Alvarez", "Apr 3 · 11:00", "Final", "Current meds: Leuprolide 22.5mg IM q3mo, Enzalutamide 160mg QD, Amlodipine 5mg QD, Vitamin D3."),
    ],
    labsCBC: cbcPanel("Apr 17, 2026", [
      { name: "WBC", v: "5.4", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "12.8", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Hct", v: "38.2", unit: "%", ref: "41–53", tone: "low", flag: "L" },
      { name: "Platelets", v: "224", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Neutrophils", v: "3.1", unit: "×10⁹/L", ref: "1.8–7.7", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 17, 2026", [
      { name: "PSA", v: "16.2", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "↓ from 18.4 on Mar 26 (first decrease)" },
      { name: "Testosterone", v: "< 50", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "LH", v: "0.8", unit: "IU/L", ref: "1.7–8.6", tone: "low", flag: "L" },
      { name: "FSH", v: "1.4", unit: "IU/L", ref: "1.5–12.4", tone: "low", flag: "L" },
      { name: "Creatinine", v: "1.1", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "ALT", v: "28", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("james-park", "i1", "Radiology", "CT Abdomen/Pelvis with contrast", "Mar 20, 2026", "Dr. K. Nguyen", "ct", "Prostate gland measures 45cc. No focal enhancing lesion. No pelvic adenopathy. Liver, spleen, kidneys unremarkable.", "No evidence of metastatic disease. No interval change from Oct 2025.", "Staging remains M0. Supports CRPC designation without visceral spread."),
      imagingStudy("james-park", "i2", "Radiology", "Tc-99m MDP Bone Scan", "Mar 20, 2026", "Dr. K. Nguyen", "bone", "Symmetric skeletal radiotracer uptake. Degenerative changes at L4-L5 and both knees. No focal abnormal uptake.", "No scintigraphic evidence of osseous metastatic disease.", "Negative bone scan supports M0 CRPC. Consider PSMA PET if PSA continues to rise."),
      imagingStudy("james-park", "i3", "Urology", "Transrectal Ultrasound", "Feb 18, 2026", "Dr. M. Choi", "us", "Prostate volume 45cc. Mixed echogenicity. Hypoechoic region in left peripheral zone unchanged from prior.", "Stable prostate appearance. No new suspicious lesion.", "No new biopsy target. Rising PSA reflects systemic progression, not local recurrence."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "So James, how have you been since our last visit?" },
      { speaker: "Patient", text: "A little more tired this week. But nothing major — I'm still walking the dog in the mornings." },
      { speaker: "Dr. Riaz", text: "Any hot flashes, falls, unusual headaches or anything like a seizure?" },
      { speaker: "Patient", text: "Hot flashes maybe three times a week. No falls, nothing like a seizure. I'd definitely know." },
      { speaker: "Dr. Riaz", text: "Good. Your PSA today was 16.2, down from 18.4 last month. That's the first decrease we've seen." },
      { speaker: "Patient", text: "That's good news, right?" },
      { speaker: "Dr. Riaz", text: "Yes — it means the Enzalutamide is starting to work. We'll continue the same dose and recheck in four weeks." },
    ],
  },
  {
    id: "robert-chen",
    mrn: "MRN-005432",
    name: "Robert Chen",
    initials: "RC",
    demo: "72M",
    age: 72,
    sex: "Male",
    dob: "1953-05-02",
    type: "Outpatient",
    avatarBg: "#D9CFB8",
    visitDate: "Apr 17, 2026",
    visitTime: "09:30",
    provider: "Dr. L. Watson",
    dx: "Prostate ca · localized · active surveillance",
    status: "Stable",
    statusColor: "green",
    reason: "Quarterly PSA check",
    diagnosis: {
      primaryCancer: "Low-risk prostate adenocarcinoma",
      stage: "cT1cN0M0",
      gleason: "3+3=6",
      diagnosisDate: "2024-06-18",
      ecog: "0",
      pathology: "2/12 biopsy cores positive, maximum 10% involvement, no perineural invasion.",
    },
    allergies: ["Penicillin rash"],
    comorbidities: ["Type 2 diabetes", "BPH", "Mild CKD stage 2"],
    medications: ["Tamsulosin 0.4mg nightly", "Metformin 500mg BID", "Rosuvastatin 10mg nightly"],
    flags: [
      { tone: "green", text: "PSA stable over last 3 surveillance visits" },
      { tone: "blue", text: "MRI from Jan 2026 showed no interval target progression" },
      { tone: "amber", text: "Prefers surveillance; revisits treatment decisions only if PSA velocity increases" },
    ],
    psa: [
      { m: "Oct", v: 5.8 },
      { m: "Nov", v: 5.6 },
      { m: "Dec", v: 5.9 },
      { m: "Jan", v: 6.1 },
      { m: "Feb", v: 5.7 },
      { m: "Mar", v: 5.8 },
      { m: "Apr", v: 5.6, drop: true },
    ],
    notes: [
      note("robert-chen", "n1", "Urology", "Active surveillance follow-up", "Dr. L. Watson", "Apr 17 · 09:30", "Signed", "Patient remains comfortable with surveillance. No obstructive symptoms beyond baseline nocturia 1x nightly.", { pinned: true }),
      note("robert-chen", "n2", "Radiology", "Prostate MRI", "Dr. E. Morris", "Jan 22 · 15:20", "Final", "PIRADS 3 lesion unchanged in right mid gland. No extracapsular extension."),
      note("robert-chen", "n3", "Lab", "PSA panel", "Lab · Valley Diagnostics", "Apr 15 · 08:00", "Resulted", "PSA 5.6 ng/mL. Creatinine 1.2 mg/dL. A1c 6.7%."),
      note("robert-chen", "n4", "Primary Care", "Chronic disease follow-up", "Dr. L. Watson", "Mar 4 · 10:15", "Signed", "Blood pressure controlled. Diabetes stable. Continue shared plan with urology."),
    ],
    labsCBC: cbcPanel("Apr 15, 2026", [
      { name: "WBC", v: "6.1", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "13.7", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Hct", v: "41.3", unit: "%", ref: "41–53", tone: "ok" },
      { name: "Platelets", v: "238", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "ANC", v: "3.8", unit: "×10⁹/L", ref: "1.8–7.7", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 15, 2026", [
      { name: "PSA", v: "5.6", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "Stable vs 5.8 last quarter" },
      { name: "Creatinine", v: "1.2", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "A1c", v: "6.7", unit: "%", ref: "< 7.0", tone: "ok" },
      { name: "Glucose", v: "122", unit: "mg/dL", ref: "70–140", tone: "ok" },
      { name: "eGFR", v: "64", unit: "mL/min", ref: "> 60", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("robert-chen", "i1", "Radiology", "Multiparametric MRI Prostate", "Jan 22, 2026", "Dr. E. Morris", "ct", "22cc gland. Stable PIRADS 3 lesion in right posterolateral mid gland. Capsule preserved.", "No radiographic progression compared with Jul 2025 MRI.", "Supports continued active surveillance."),
      imagingStudy("robert-chen", "i2", "Urology", "TRUS surveillance study", "Oct 9, 2025", "Dr. K. Shore", "us", "Mild transition zone hypertrophy. No new focal lesion visualized.", "Stable surveillance ultrasound.", "No trigger for repeat biopsy ahead of planned 2027 interval."),
    ],
    transcript: [
      { speaker: "Dr. Watson", text: "Any change in urination or pelvic discomfort since January?" },
      { speaker: "Patient", text: "No, pretty much the same. Maybe one bathroom trip at night." },
      { speaker: "Dr. Watson", text: "Your PSA is still very steady, which supports surveillance." },
      { speaker: "Patient", text: "Good. I still want to avoid treatment unless we really need it." },
    ],
  },
  {
    id: "marcus-okafor",
    mrn: "MRN-006118",
    name: "Marcus Okafor",
    initials: "MO",
    demo: "64M",
    age: 64,
    sex: "Male",
    dob: "1961-02-09",
    type: "Outpatient",
    avatarBg: "#E0C7B7",
    visitDate: "Apr 17, 2026",
    visitTime: "10:15",
    provider: "Dr. I. Riaz",
    dx: "Prostate ca · post-RP · biochemical recurrence",
    status: "Review",
    statusColor: "amber",
    reason: "Salvage RT decision",
    diagnosis: {
      primaryCancer: "Post-prostatectomy biochemical recurrence",
      stage: "pT3aN0M0",
      gleason: "4+3=7",
      diagnosisDate: "2023-01-05",
      ecog: "0",
      pathology: "Extraprostatic extension present. Surgical margins focally positive at apex.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Obesity", "OSA on CPAP"],
    medications: ["Ibuprofen PRN", "Vitamin D3 1000 IU daily"],
    flags: [
      { tone: "amber", text: "PSA now 0.38 after prostatectomy — salvage RT discussion due today" },
      { tone: "blue", text: "PSMA PET negative for distant disease" },
      { tone: "green", text: "Urinary continence preserved; functional status remains excellent" },
    ],
    psa: [
      { m: "Oct", v: 0.12 },
      { m: "Nov", v: 0.15 },
      { m: "Dec", v: 0.18 },
      { m: "Jan", v: 0.24 },
      { m: "Feb", v: 0.31 },
      { m: "Mar", v: 0.34 },
      { m: "Apr", v: 0.38 },
    ],
    notes: [
      note("marcus-okafor", "n1", "Oncology", "Post-RP recurrence consult", "Dr. I. Riaz", "Apr 17 · 10:15", "Signed", "Rising PSA after RP now meets threshold for salvage radiation planning. Reviewed pelvic RT plus short-course ADT.", { pinned: true }),
      note("marcus-okafor", "n2", "Nuclear Medicine", "PSMA PET/CT", "Dr. J. Keller", "Apr 5 · 13:20", "Final", "No avid nodal or osseous lesions. Mild uptake only at bladder neck favored post-surgical change."),
      note("marcus-okafor", "n3", "Urology", "Radical prostatectomy follow-up", "Dr. A. Gomez", "Mar 11 · 08:40", "Signed", "Continence nearly baseline. Erectile dysfunction discussed. Repeat PSA in 4 weeks advised."),
      note("marcus-okafor", "n4", "Radiation Oncology", "Planning intake", "Dr. M. Patel", "Apr 14 · 16:10", "Draft", "Candidate for prostate bed RT 66.6 Gy/37 fractions if patient elects treatment."),
    ],
    labsCBC: cbcPanel("Apr 12, 2026", [
      { name: "WBC", v: "7.0", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "14.3", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "246", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "1.0", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "ALT", v: "25", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 12, 2026", [
      { name: "PSA", v: "0.38", unit: "ng/mL", ref: "< 0.10", tone: "high", flag: "H", note: "Slow but consistent post-RP rise" },
      { name: "Testosterone", v: "438", unit: "ng/dL", ref: "264–916", tone: "ok" },
      { name: "Alk Phos", v: "78", unit: "U/L", ref: "44–147", tone: "ok" },
      { name: "Calcium", v: "9.1", unit: "mg/dL", ref: "8.5–10.5", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("marcus-okafor", "i1", "Nuclear Medicine", "PSMA PET/CT", "Apr 5, 2026", "Dr. J. Keller", "ct", "No suspicious avid lesions in nodes, bone, or viscera. Mild tracer near vesicourethral anastomosis likely post-operative.", "No radiographic metastatic disease.", "Supports curative-intent salvage radiation discussion."),
      imagingStudy("marcus-okafor", "i2", "Radiology", "Pelvic MRI", "Feb 18, 2026", "Dr. E. Morris", "ct", "Post-surgical changes without measurable local mass. No enlarged pelvic lymph nodes.", "No visible local recurrence by MRI.", "Biochemical recurrence remains imaging-occult."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "Your PSA is still low, but the trend confirms recurrence after surgery." },
      { speaker: "Patient", text: "If the scans are clear, does that mean radiation can still cure this?" },
      { speaker: "Dr. Riaz", text: "That is exactly why we talk about salvage radiation early." },
      { speaker: "Patient", text: "I want the best chance at cure, even if treatment is inconvenient." },
    ],
  },
  {
    id: "david-nakamura",
    mrn: "MRN-004402",
    name: "David Nakamura",
    initials: "DN",
    demo: "70M",
    age: 70,
    sex: "Male",
    dob: "1955-07-21",
    type: "New referral",
    avatarBg: "#F0D6C8",
    visitDate: "Apr 17, 2026",
    visitTime: "11:00",
    provider: "Dr. M. Choi",
    dx: "High-risk prostate ca · biopsy review",
    status: "New",
    statusColor: "blue",
    reason: "Initial consult · biopsy review",
    diagnosis: {
      primaryCancer: "High-risk localized prostate adenocarcinoma",
      stage: "cT2cN0M0",
      gleason: "4+5=9",
      diagnosisDate: "2026-03-29",
      ecog: "1",
      pathology: "8/12 cores positive. Cribriform pattern and perineural invasion present.",
    },
    allergies: ["Shellfish intolerance"],
    comorbidities: ["CAD with prior PCI", "GERD"],
    medications: ["Aspirin 81mg daily", "Atorvastatin 40mg daily", "Pantoprazole 40mg daily"],
    flags: [
      { tone: "blue", text: "New patient with Gleason 9 disease referred for multidisciplinary planning" },
      { tone: "red", text: "Baseline PSA 22.4 ng/mL with extensive core positivity" },
      { tone: "amber", text: "Cardiology clearance may be needed if surgery considered" },
    ],
    psa: [
      { m: "Oct", v: 11.2 },
      { m: "Nov", v: 12.9 },
      { m: "Dec", v: 15.3 },
      { m: "Jan", v: 17.1 },
      { m: "Feb", v: 18.9 },
      { m: "Mar", v: 21.7 },
      { m: "Apr", v: 22.4 },
    ],
    notes: [
      note("david-nakamura", "n1", "Urology", "New consult · biopsy review", "Dr. M. Choi", "Apr 17 · 11:00", "Signed", "Reviewed Gleason 4+5 disease and treatment pathways including surgery versus RT plus ADT.", { pinned: true }),
      note("david-nakamura", "n2", "Pathology", "TRUS biopsy pathology", "Dr. H. Singh", "Mar 29 · 14:00", "Final", "8/12 cores positive for acinar adenocarcinoma. Highest grade group 5 in left base."),
      note("david-nakamura", "n3", "Radiology", "CT chest/abdomen/pelvis staging", "Dr. E. Morris", "Apr 8 · 12:10", "Final", "No adenopathy or visceral metastases. Mild prostatomegaly."),
      note("david-nakamura", "n4", "Radiation Oncology", "Second-opinion planning visit", "Dr. M. Patel", "Apr 15 · 09:25", "Signed", "Discussed external beam RT with long-course ADT and possible brachy boost."),
    ],
    labsCBC: cbcPanel("Apr 8, 2026", [
      { name: "WBC", v: "6.6", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "14.0", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "231", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "1.0", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "AST", v: "23", unit: "U/L", ref: "10–40", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 8, 2026", [
      { name: "PSA", v: "22.4", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "New baseline pre-treatment" },
      { name: "Testosterone", v: "512", unit: "ng/dL", ref: "264–916", tone: "ok" },
      { name: "Alk Phos", v: "86", unit: "U/L", ref: "44–147", tone: "ok" },
      { name: "LDH", v: "176", unit: "U/L", ref: "140–280", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("david-nakamura", "i1", "Radiology", "CT CAP staging", "Apr 8, 2026", "Dr. E. Morris", "ct", "No chest, abdominal, or pelvic metastatic disease. Prostate mildly enlarged.", "No distant metastases identified by CT.", "Localized but high-risk disease; treatment intensification decisions depend on local therapy choice."),
      imagingStudy("david-nakamura", "i2", "Radiology", "Bone Scan", "Apr 8, 2026", "Dr. C. Huang", "bone", "No focal osseous uptake suspicious for metastatic disease.", "Negative nuclear bone scan.", "Allows curative-intent treatment planning."),
    ],
    transcript: [
      { speaker: "Dr. Choi", text: "Your biopsy shows a more aggressive prostate cancer, but the scans are still negative." },
      { speaker: "Patient", text: "So we caught it before it spread?" },
      { speaker: "Dr. Choi", text: "Based on conventional staging, yes. That is why we should move quickly into definitive treatment planning." },
      { speaker: "Patient", text: "I want the option with the best cancer control, even if it means more treatment upfront." },
    ],
  },
  {
    id: "william-hayes",
    mrn: "MRN-002218",
    name: "William Hayes",
    initials: "WH",
    demo: "68M",
    age: 68,
    sex: "Male",
    dob: "1957-11-03",
    type: "Outpatient",
    avatarBg: "#C8D9C1",
    visitDate: "Apr 17, 2026",
    visitTime: "14:00",
    provider: "Dr. I. Riaz",
    dx: "Prostate ca · on ADT only · stable",
    status: "Stable",
    statusColor: "green",
    reason: "6-month check-in",
    diagnosis: {
      primaryCancer: "Node-negative metastatic-hormone-sensitive prostate cancer in durable biochemical control",
      stage: "M1a by prior nodal disease history",
      gleason: "4+4=8",
      diagnosisDate: "2021-09-14",
      ecog: "1",
      pathology: "High-grade acinar adenocarcinoma with seminal vesicle invasion on original prostatectomy specimen.",
    },
    allergies: ["ACE inhibitor cough"],
    comorbidities: ["HTN", "Prediabetes", "Osteoarthritis"],
    medications: ["Leuprolide 22.5mg IM q3mo", "Losartan 50mg daily", "Calcium/Vitamin D"],
    flags: [
      { tone: "green", text: "Undetectable PSA maintained on ADT alone" },
      { tone: "amber", text: "Hot flashes manageable; no treatment escalation requested" },
      { tone: "blue", text: "DEXA due this summer for bone health monitoring" },
    ],
    psa: [
      { m: "Oct", v: 0.06 },
      { m: "Nov", v: 0.05 },
      { m: "Dec", v: 0.05 },
      { m: "Jan", v: 0.04 },
      { m: "Feb", v: 0.05 },
      { m: "Mar", v: 0.04 },
      { m: "Apr", v: 0.04, drop: true },
    ],
    notes: [
      note("william-hayes", "n1", "Oncology", "ADT maintenance follow-up", "Dr. I. Riaz", "Apr 17 · 14:00", "Signed", "Disease remains biochemically quiet on leuprolide alone. Continue current schedule and monitor bone health.", { pinned: true }),
      note("william-hayes", "n2", "Lab", "PSA/Testosterone surveillance", "Lab · Mayo Central", "Apr 15 · 07:20", "Resulted", "PSA 0.04 ng/mL. Testosterone < 20 ng/dL."),
      note("william-hayes", "n3", "Primary Care", "HTN follow-up", "Dr. L. Watson", "Feb 9 · 09:00", "Signed", "BP at goal. Continue losartan. Encouraged exercise."),
      note("william-hayes", "n4", "Radiology", "DEXA scan", "Dr. N. Shah", "Jul 18 · 10:30", "Final", "Osteopenia without osteoporosis. Repeat in 12 months."),
    ],
    labsCBC: cbcPanel("Apr 15, 2026", [
      { name: "WBC", v: "5.8", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "13.1", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "214", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "1.0", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "Calcium", v: "9.2", unit: "mg/dL", ref: "8.5–10.5", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 15, 2026", [
      { name: "PSA", v: "0.04", unit: "ng/mL", ref: "< 4.0", tone: "ok", note: "Undetectable/stable" },
      { name: "Testosterone", v: "< 20", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "Vitamin D", v: "34", unit: "ng/mL", ref: "30–100", tone: "ok" },
      { name: "Alk Phos", v: "71", unit: "U/L", ref: "44–147", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("william-hayes", "i1", "Radiology", "DEXA", "Jul 18, 2025", "Dr. N. Shah", "bone", "Lumbar T-score -1.4. Femoral neck T-score -1.1.", "Osteopenia without osteoporosis.", "Continue calcium, vitamin D, and weight-bearing exercise."),
      imagingStudy("william-hayes", "i2", "Radiology", "CT CAP surveillance", "Jan 10, 2026", "Dr. E. Morris", "ct", "No pathologic adenopathy or visceral metastases.", "No evidence of progression on surveillance imaging.", "Supports continued observation on current ADT."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "Your PSA is still essentially undetectable." },
      { speaker: "Patient", text: "Good. The hot flashes are annoying, but manageable." },
      { speaker: "Dr. Riaz", text: "As long as quality of life remains okay, we stay the course." },
      { speaker: "Patient", text: "That sounds reasonable." },
    ],
  },
  {
    id: "henry-adebayo",
    mrn: "MRN-008810",
    name: "Henry Adebayo",
    initials: "HA",
    demo: "61M",
    age: 61,
    sex: "Male",
    dob: "1964-01-26",
    type: "Outpatient",
    avatarBg: "#E4CAB5",
    visitDate: "Apr 17, 2026",
    visitTime: "14:45",
    provider: "Dr. A. Gomez",
    dx: "Post-prostatectomy · undetectable PSA",
    status: "Stable",
    statusColor: "green",
    reason: "Annual follow-up",
    diagnosis: {
      primaryCancer: "Post-prostatectomy remission",
      stage: "pT2N0M0",
      gleason: "3+4=7",
      diagnosisDate: "2022-08-12",
      ecog: "0",
      pathology: "Organ-confined disease. Negative margins and negative seminal vesicles.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Mild asthma"],
    medications: ["Albuterol inhaler PRN", "Sildenafil PRN"],
    flags: [
      { tone: "green", text: "Undetectable PSA since surgery" },
      { tone: "blue", text: "Excellent urinary control and improving sexual function" },
      { tone: "amber", text: "Continues survivorship monitoring annually" },
    ],
    psa: [
      { m: "Oct", v: 0.01 },
      { m: "Nov", v: 0.01 },
      { m: "Dec", v: 0.01 },
      { m: "Jan", v: 0.01 },
      { m: "Feb", v: 0.01 },
      { m: "Mar", v: 0.01 },
      { m: "Apr", v: 0.01, drop: true },
    ],
    notes: [
      note("henry-adebayo", "n1", "Urology", "Annual post-RP survivorship visit", "Dr. A. Gomez", "Apr 17 · 14:45", "Signed", "No biochemical evidence of recurrence. Continue annual PSA and survivorship support.", { pinned: true }),
      note("henry-adebayo", "n2", "Lab", "Ultrasensitive PSA", "Lab · Valley Diagnostics", "Apr 14 · 07:10", "Resulted", "PSA 0.01 ng/mL."),
      note("henry-adebayo", "n3", "Pelvic Floor Therapy", "Discharge note", "K. Rivera PT", "Jan 6 · 15:00", "Signed", "Patient met continence goals. Home exercise plan reinforced."),
      note("henry-adebayo", "n4", "Primary Care", "Preventive care visit", "Dr. L. Watson", "Feb 22 · 11:30", "Signed", "Routine health maintenance up to date."),
    ],
    labsCBC: cbcPanel("Apr 14, 2026", [
      { name: "WBC", v: "5.9", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "14.8", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "227", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "0.9", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "ALT", v: "21", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 14, 2026", [
      { name: "PSA", v: "0.01", unit: "ng/mL", ref: "< 0.10", tone: "ok", note: "Undetectable" },
      { name: "Testosterone", v: "471", unit: "ng/dL", ref: "264–916", tone: "ok" },
      { name: "LDL", v: "88", unit: "mg/dL", ref: "< 100", tone: "ok" },
      { name: "A1c", v: "5.7", unit: "%", ref: "< 5.7", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("henry-adebayo", "i1", "Radiology", "Post-op CT pelvis", "Sep 20, 2024", "Dr. E. Morris", "ct", "Expected post-surgical anatomy. No pelvic collection or nodal enlargement.", "No local recurrence by CT.", "No imaging concern in remission setting."),
      imagingStudy("henry-adebayo", "i2", "Urology", "Cystoscopy", "Nov 14, 2024", "Dr. A. Gomez", "us", "Normal urethrovesical anastomosis. No stricture.", "Benign surveillance cystoscopy.", "Supports recovered post-op function."),
    ],
    transcript: [
      { speaker: "Dr. Gomez", text: "Everything looks good. Your PSA remains undetectable." },
      { speaker: "Patient", text: "That is what I hoped to hear." },
      { speaker: "Dr. Gomez", text: "We keep following yearly, but there is no sign of recurrence." },
      { speaker: "Patient", text: "Great. I can live with annual check-ins." },
    ],
  },
  {
    id: "luis-romero",
    mrn: "MRN-007204",
    name: "Luis Romero",
    initials: "LR",
    demo: "69M",
    age: 69,
    sex: "Male",
    dob: "1956-06-15",
    type: "Outpatient",
    avatarBg: "#D7C9B4",
    visitDate: "Apr 17, 2026",
    visitTime: "15:15",
    provider: "Dr. I. Riaz",
    dx: "mHSPC · docetaxel completed · surveillance",
    status: "Stable",
    statusColor: "green",
    reason: "Post-chemotherapy surveillance",
    diagnosis: {
      primaryCancer: "Metastatic hormone-sensitive prostate cancer",
      stage: "M1b",
      gleason: "4+4=8",
      diagnosisDate: "2025-02-02",
      ecog: "1",
      pathology: "High-volume disease at presentation with diffuse pelvic bone involvement.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Peripheral neuropathy from docetaxel", "HTN"],
    medications: ["Abiraterone 1000mg daily", "Prednisone 5mg daily", "Leuprolide q3mo", "Lisinopril 10mg daily"],
    flags: [
      { tone: "green", text: "PSA down >95% after ADT + docetaxel + abiraterone" },
      { tone: "amber", text: "Mild residual neuropathy in toes" },
      { tone: "blue", text: "Bone pain resolved since systemic therapy initiation" },
    ],
    psa: [
      { m: "Oct", v: 48.2 },
      { m: "Nov", v: 22.1 },
      { m: "Dec", v: 8.4 },
      { m: "Jan", v: 2.3 },
      { m: "Feb", v: 0.9 },
      { m: "Mar", v: 0.5 },
      { m: "Apr", v: 0.4, drop: true },
    ],
    notes: [
      note("luis-romero", "n1", "Oncology", "mHSPC surveillance follow-up", "Dr. I. Riaz", "Apr 17 · 15:15", "Signed", "Excellent biochemical response maintained after triplet-intensified therapy. Continue current hormonal backbone.", { pinned: true }),
      note("luis-romero", "n2", "Medical Oncology", "Cycle 6 docetaxel completion", "Dr. S. Barker", "Jan 9 · 13:00", "Signed", "Completed docetaxel without dose reduction. Neuropathy grade 1 at discharge."),
      note("luis-romero", "n3", "Radiology", "Bone scan response assessment", "Dr. K. Nguyen", "Mar 14 · 10:40", "Final", "Markedly decreased tracer uptake in previously active pelvic and rib lesions."),
      note("luis-romero", "n4", "Lab", "CMP / PSA / Testosterone", "Lab · Mayo Central", "Apr 15 · 07:55", "Resulted", "PSA 0.4 ng/mL. Potassium and LFTs stable on abiraterone."),
    ],
    labsCBC: cbcPanel("Apr 15, 2026", [
      { name: "WBC", v: "5.3", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "12.9", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "219", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "AST", v: "24", unit: "U/L", ref: "10–40", tone: "ok" },
      { name: "ALT", v: "26", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 15, 2026", [
      { name: "PSA", v: "0.4", unit: "ng/mL", ref: "< 4.0", tone: "ok", note: "Near nadir" },
      { name: "Testosterone", v: "< 20", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "Potassium", v: "4.2", unit: "mmol/L", ref: "3.5–5.1", tone: "ok" },
      { name: "Bilirubin", v: "0.8", unit: "mg/dL", ref: "0.2–1.2", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("luis-romero", "i1", "Radiology", "Bone Scan response assessment", "Mar 14, 2026", "Dr. K. Nguyen", "bone", "Substantial reduction in prior widespread skeletal tracer uptake. No new lesions.", "Positive treatment response.", "Matches clinical improvement and PSA decline."),
      imagingStudy("luis-romero", "i2", "Radiology", "CT CAP restaging", "Mar 14, 2026", "Dr. E. Morris", "ct", "Decreased pelvic nodal bulk. No visceral metastases. Treated sclerotic osseous lesions stable.", "Overall partial response to therapy.", "Continue present systemic regimen."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "Your numbers continue to look excellent after chemotherapy." },
      { speaker: "Patient", text: "The neuropathy is annoying, but the bone pain is gone." },
      { speaker: "Dr. Riaz", text: "That tradeoff is unfortunately common, but overall this is a very encouraging response." },
      { speaker: "Patient", text: "I can live with some numbness if the cancer stays quiet." },
    ],
  },
  {
    id: "peter-sullivan",
    mrn: "MRN-010114",
    name: "Peter Sullivan",
    initials: "PS",
    demo: "74M",
    age: 74,
    sex: "Male",
    dob: "1951-03-01",
    type: "Outpatient",
    avatarBg: "#CFD7E7",
    visitDate: "Apr 17, 2026",
    visitTime: "15:45",
    provider: "Dr. M. Patel",
    dx: "Very-high-risk localized prostate ca · RT on treatment",
    status: "Review",
    statusColor: "amber",
    reason: "Week 4 toxicity review",
    diagnosis: {
      primaryCancer: "Very-high-risk localized prostate adenocarcinoma",
      stage: "cT3bN0M0",
      gleason: "4+5=9",
      diagnosisDate: "2025-12-11",
      ecog: "1",
      pathology: "Seminal vesicle invasion suspected clinically; 10/12 positive cores.",
    },
    allergies: ["Sulfa rash"],
    comorbidities: ["AFib on anticoagulation", "BPH"],
    medications: ["Leuprolide q3mo", "Apixaban 5mg BID", "Tamsulosin 0.4mg BID"],
    flags: [
      { tone: "amber", text: "Grade 2 urinary frequency during pelvic RT" },
      { tone: "green", text: "PSA already falling after ADT initiation" },
      { tone: "blue", text: "No rectal bleeding or treatment interruption to date" },
    ],
    psa: [
      { m: "Oct", v: 19.0 },
      { m: "Nov", v: 21.4 },
      { m: "Dec", v: 24.7 },
      { m: "Jan", v: 10.2 },
      { m: "Feb", v: 4.8 },
      { m: "Mar", v: 2.1 },
      { m: "Apr", v: 1.4, drop: true },
    ],
    notes: [
      note("peter-sullivan", "n1", "Radiation Oncology", "On-treatment visit · week 4", "Dr. M. Patel", "Apr 17 · 15:45", "Signed", "Increased urinary urgency/frequency managed with alpha blocker escalation. RT continues as planned.", { pinned: true }),
      note("peter-sullivan", "n2", "Lab", "PSA surveillance", "Lab · Valley Diagnostics", "Apr 14 · 08:15", "Resulted", "PSA 1.4 ng/mL while on ADT + RT."),
      note("peter-sullivan", "n3", "Radiology", "Simulation CT", "Dr. M. Patel", "Mar 3 · 07:45", "Final", "Pelvic nodes and prostate outlined for IMRT planning."),
      note("peter-sullivan", "n4", "Oncology", "ADT start note", "Dr. I. Riaz", "Jan 5 · 11:10", "Signed", "Began long-course ADT in advance of definitive radiation."),
    ],
    labsCBC: cbcPanel("Apr 14, 2026", [
      { name: "WBC", v: "4.8", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "12.6", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "198", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "1.1", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "Sodium", v: "138", unit: "mmol/L", ref: "135–145", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 14, 2026", [
      { name: "PSA", v: "1.4", unit: "ng/mL", ref: "< 4.0", tone: "ok", note: "Expected decline on ADT" },
      { name: "Testosterone", v: "< 20", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "INR equivalent", v: "n/a", unit: "", ref: "", tone: "ok", note: "On apixaban, not warfarin" },
      { name: "Urinalysis", v: "Negative", unit: "", ref: "", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("peter-sullivan", "i1", "Radiation Oncology", "Planning CT", "Mar 3, 2026", "Dr. M. Patel", "ct", "Large prostate and seminal vesicle contouring completed. No gross nodal disease on planning scan.", "Simulation complete for IMRT.", "Treatment proceeding without technical issue."),
      imagingStudy("peter-sullivan", "i2", "Radiology", "Pelvic MRI", "Dec 20, 2025", "Dr. E. Morris", "ct", "Posterior extracapsular extension with probable right seminal vesicle involvement.", "Very-high-risk local disease without visible nodal spread.", "Supports combined-modality treatment."),
    ],
    transcript: [
      { speaker: "Dr. Patel", text: "Your side effects are typical for this point in radiation." },
      { speaker: "Patient", text: "Mostly I just need to stay near a bathroom." },
      { speaker: "Dr. Patel", text: "That is annoying, but manageable, and your PSA is falling nicely." },
      { speaker: "Patient", text: "I can push through if we are on the right track." },
    ],
  },
  {
    id: "omar-haddad",
    mrn: "MRN-011207",
    name: "Omar Haddad",
    initials: "OH",
    demo: "66M",
    age: 66,
    sex: "Male",
    dob: "1959-09-09",
    type: "Outpatient",
    avatarBg: "#D7CFC2",
    visitDate: "Apr 17, 2026",
    visitTime: "16:15",
    provider: "Dr. I. Riaz",
    dx: "nmCRPC · apalutamide monitoring",
    status: "Pending",
    statusColor: "amber",
    reason: "Rash and fatigue review",
    diagnosis: {
      primaryCancer: "Non-metastatic castration-resistant prostate cancer",
      stage: "nmCRPC",
      gleason: "4+4=8",
      diagnosisDate: "2020-10-02",
      ecog: "1",
      pathology: "Persistent biochemical progression on continuous ADT without conventional radiographic metastases.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Hypothyroidism", "HTN"],
    medications: ["Apalutamide 240mg daily", "Leuprolide q3mo", "Levothyroxine 75mcg daily", "Amlodipine 5mg daily"],
    flags: [
      { tone: "amber", text: "Diffuse grade 1 maculopapular rash after Apalutamide initiation" },
      { tone: "blue", text: "TSH mildly elevated — likely needs closer monitoring" },
      { tone: "green", text: "PSA slowing with no imaging progression" },
    ],
    psa: [
      { m: "Oct", v: 8.1 },
      { m: "Nov", v: 9.8 },
      { m: "Dec", v: 11.6 },
      { m: "Jan", v: 12.4 },
      { m: "Feb", v: 10.2, drop: true },
      { m: "Mar", v: 8.8, drop: true },
      { m: "Apr", v: 7.6, drop: true },
    ],
    notes: [
      note("omar-haddad", "n1", "Oncology", "Apalutamide toxicity check", "Dr. I. Riaz", "Apr 17 · 16:15", "Signed", "Mild rash and fatigue present but tolerable. Continue therapy with supportive measures and repeat TFTs.", { pinned: true }),
      note("omar-haddad", "n2", "Radiology", "CT/Bone scan surveillance", "Dr. K. Nguyen", "Apr 7 · 11:25", "Final", "No new metastatic lesions on conventional imaging."),
      note("omar-haddad", "n3", "Lab", "Thyroid / PSA panel", "Lab · Mayo Central", "Apr 14 · 08:05", "Resulted", "PSA 7.6 ng/mL. TSH 6.1 mIU/L."),
      note("omar-haddad", "n4", "Dermatology", "eConsult", "Dr. R. Vega", "Apr 12 · 17:10", "Final", "Drug rash likely mild and manageable with topical steroid plus antihistamine."),
    ],
    labsCBC: cbcPanel("Apr 14, 2026", [
      { name: "WBC", v: "5.9", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "13.4", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "206", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "TSH", v: "6.1", unit: "mIU/L", ref: "0.4–4.5", tone: "high", flag: "H" },
      { name: "Free T4", v: "0.9", unit: "ng/dL", ref: "0.8–1.8", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 14, 2026", [
      { name: "PSA", v: "7.6", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "Improving on Apalutamide" },
      { name: "Testosterone", v: "< 20", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "AST", v: "20", unit: "U/L", ref: "10–40", tone: "ok" },
      { name: "ALT", v: "19", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("omar-haddad", "i1", "Radiology", "CT CAP", "Apr 7, 2026", "Dr. K. Nguyen", "ct", "No new adenopathy or visceral lesions. Stable post-treatment pelvic changes.", "No metastatic progression on CT.", "Continues to meet non-metastatic CRPC definition by conventional imaging."),
      imagingStudy("omar-haddad", "i2", "Radiology", "Bone Scan", "Apr 7, 2026", "Dr. K. Nguyen", "bone", "No focal uptake suspicious for osseous metastases.", "Negative bone scan.", "Continue systemic therapy and surveillance."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "The rash is frustrating, but it still looks mild." },
      { speaker: "Patient", text: "I can handle it if the medicine is working." },
      { speaker: "Dr. Riaz", text: "Your PSA is improving, so I would rather support through the side effect than stop too early." },
      { speaker: "Patient", text: "Okay, as long as we keep watching it." },
    ],
  },
  {
    id: "daniel-brooks",
    mrn: "MRN-012609",
    name: "Daniel Brooks",
    initials: "DB",
    demo: "71M",
    age: 71,
    sex: "Male",
    dob: "1954-04-12",
    type: "Outpatient",
    avatarBg: "#CFC8D8",
    visitDate: "Apr 17, 2026",
    visitTime: "16:45",
    provider: "Dr. S. Barker",
    dx: "mCRPC · cabazitaxel planning",
    status: "Urgent",
    statusColor: "red",
    reason: "Progression on ARPI",
    diagnosis: {
      primaryCancer: "Metastatic castration-resistant prostate cancer",
      stage: "M1b",
      gleason: "4+5=9",
      diagnosisDate: "2019-05-07",
      ecog: "2",
      pathology: "High-grade metastatic disease with diffuse bone involvement and prior docetaxel exposure.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Chronic pain", "Anemia of malignancy"],
    medications: ["Leuprolide q3mo", "Prednisone 5mg BID", "Oxycodone 5mg q6h PRN", "Zoledronic acid q12wk"],
    flags: [
      { tone: "red", text: "PSA and bone pain increasing despite ARPI therapy" },
      { tone: "amber", text: "Needs treatment transition discussion today" },
      { tone: "blue", text: "Palliative care already engaged for symptom support" },
    ],
    psa: [
      { m: "Oct", v: 18.0 },
      { m: "Nov", v: 22.4 },
      { m: "Dec", v: 27.6 },
      { m: "Jan", v: 33.2 },
      { m: "Feb", v: 41.8 },
      { m: "Mar", v: 54.7 },
      { m: "Apr", v: 63.1 },
    ],
    notes: [
      note("daniel-brooks", "n1", "Oncology", "Progression review · treatment transition", "Dr. S. Barker", "Apr 17 · 16:45", "Signed", "Clinical and biochemical progression despite ARPI. Reviewed cabazitaxel vs Lu-PSMA referral depending access and performance status.", { pinned: true }),
      note("daniel-brooks", "n2", "Radiology", "Whole-body bone scan", "Dr. K. Nguyen", "Apr 9 · 10:10", "Final", "Increased multifocal uptake in thoracic spine, sacrum, and right iliac wing compared with January."),
      note("daniel-brooks", "n3", "Palliative Care", "Symptom management follow-up", "Dr. R. Nelson", "Apr 11 · 14:30", "Signed", "Escalating nighttime bone pain. Breakthrough opioid dosing adjusted."),
      note("daniel-brooks", "n4", "Lab", "CBC/CMP/PSA", "Lab · Mayo Central", "Apr 15 · 06:55", "Resulted", "PSA 63.1 ng/mL. Hgb 10.8 g/dL. Alk phos rising."),
    ],
    labsCBC: cbcPanel("Apr 15, 2026", [
      { name: "WBC", v: "7.8", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "10.8", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "281", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Alk Phos", v: "211", unit: "U/L", ref: "44–147", tone: "high", flag: "H" },
      { name: "Creatinine", v: "1.2", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 15, 2026", [
      { name: "PSA", v: "63.1", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "Rapid rise from 54.7 last month" },
      { name: "Testosterone", v: "< 20", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "LDH", v: "322", unit: "U/L", ref: "140–280", tone: "high", flag: "H" },
      { name: "Albumin", v: "3.5", unit: "g/dL", ref: "3.4–5.4", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("daniel-brooks", "i1", "Radiology", "Bone Scan", "Apr 9, 2026", "Dr. K. Nguyen", "bone", "Progressive multifocal osseous metastatic burden involving thoracic spine, pelvis, and proximal femurs.", "Progressive skeletal metastatic disease.", "Matches pain escalation and rising PSA."),
      imagingStudy("daniel-brooks", "i2", "Radiology", "CT CAP", "Apr 9, 2026", "Dr. E. Morris", "ct", "Stable small retroperitoneal nodes. No liver or lung metastases. Worsening sclerotic osseous lesions.", "Bony progression without new visceral metastases.", "Systemic treatment change indicated."),
    ],
    transcript: [
      { speaker: "Dr. Barker", text: "The scans and PSA both show the current treatment is no longer controlling the cancer." },
      { speaker: "Patient", text: "I figured something was changing because the pain is getting worse." },
      { speaker: "Dr. Barker", text: "We need to talk about the next treatment line today." },
      { speaker: "Patient", text: "I want the plan that gives me the best chance of slowing this down." },
    ],
  },
  {
    id: "victor-ionescu",
    mrn: "MRN-013004",
    name: "Victor Ionescu",
    initials: "VI",
    demo: "63M",
    age: 63,
    sex: "Male",
    dob: "1962-12-04",
    type: "Outpatient",
    avatarBg: "#C7D2C0",
    visitDate: "Apr 17, 2026",
    visitTime: "17:15",
    provider: "Dr. M. Choi",
    dx: "Intermediate-risk prostate ca · focal therapy consult",
    status: "Scheduled",
    statusColor: "neutral",
    reason: "Treatment options review",
    diagnosis: {
      primaryCancer: "Favorable intermediate-risk prostate adenocarcinoma",
      stage: "cT2aN0M0",
      gleason: "3+4=7",
      diagnosisDate: "2026-02-10",
      ecog: "0",
      pathology: "4/12 cores positive, limited grade group 2 focus in left apex.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["None significant"],
    medications: [],
    flags: [
      { tone: "blue", text: "Newly diagnosed grade group 2 disease under treatment planning review" },
      { tone: "green", text: "PSA density modest; MRI target localized" },
      { tone: "amber", text: "Patient comparing surgery, RT, and focal therapy options" },
    ],
    psa: [
      { m: "Oct", v: 6.4 },
      { m: "Nov", v: 6.8 },
      { m: "Dec", v: 7.1 },
      { m: "Jan", v: 7.8 },
      { m: "Feb", v: 8.4 },
      { m: "Mar", v: 8.2, drop: true },
      { m: "Apr", v: 8.3 },
    ],
    notes: [
      note("victor-ionescu", "n1", "Urology", "Treatment planning consult", "Dr. M. Choi", "Apr 17 · 17:15", "Signed", "Reviewed surgery, RT, surveillance, and investigational focal approaches. Patient prioritizes maintaining urinary and sexual function.", { pinned: true }),
      note("victor-ionescu", "n2", "Radiology", "Prostate MRI", "Dr. E. Morris", "Feb 28 · 15:40", "Final", "PIRADS 4 lesion 1.1 cm in left apex peripheral zone. No ECE."),
      note("victor-ionescu", "n3", "Pathology", "Fusion biopsy result", "Dr. H. Singh", "Feb 10 · 13:30", "Final", "Grade group 2 focus in targeted lesion. Remaining positive cores grade group 1."),
      note("victor-ionescu", "n4", "Oncology", "Second opinion", "Dr. I. Riaz", "Apr 8 · 10:10", "Signed", "Disease remains organ-confined; definitive local treatment remains optional but reasonable."),
    ],
    labsCBC: cbcPanel("Apr 9, 2026", [
      { name: "WBC", v: "6.0", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "14.5", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "244", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "0.9", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "A1c", v: "5.5", unit: "%", ref: "< 5.7", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 9, 2026", [
      { name: "PSA", v: "8.3", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "Planning-phase baseline" },
      { name: "PSA density", v: "0.16", unit: "ng/mL/cc", ref: "< 0.15", tone: "high", flag: "H" },
      { name: "Testosterone", v: "486", unit: "ng/dL", ref: "264–916", tone: "ok" },
      { name: "Urinalysis", v: "Negative", unit: "", ref: "", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("victor-ionescu", "i1", "Radiology", "Multiparametric MRI Prostate", "Feb 28, 2026", "Dr. E. Morris", "ct", "1.1 cm PIRADS 4 lesion in left apical peripheral zone. No extracapsular extension.", "Organ-confined MRI-visible lesion.", "Supports discussion of focal versus whole-gland treatment."),
      imagingStudy("victor-ionescu", "i2", "Urology", "Fusion biopsy map", "Feb 10, 2026", "Dr. M. Choi", "us", "Targeted lesion confirms grade group 2 disease; remainder low-volume grade group 1.", "Intermediate-risk localized prostate cancer.", "Decision remains preference-sensitive."),
    ],
    transcript: [
      { speaker: "Dr. Choi", text: "You have several reasonable options, and none of them have to happen urgently this week." },
      { speaker: "Patient", text: "My biggest concern is preserving function if the cancer can still be controlled." },
      { speaker: "Dr. Choi", text: "That is exactly why we are taking time to compare approaches rather than rushing." },
      { speaker: "Patient", text: "I appreciate that. I want to understand the tradeoffs." },
    ],
  },
  {
    id: "samir-khan",
    mrn: "MRN-014108",
    name: "Samir Khan",
    initials: "SK",
    demo: "62M",
    age: 62,
    sex: "Male",
    dob: "1963-08-27",
    type: "Outpatient",
    avatarBg: "#D8CFC8",
    visitDate: "Apr 18, 2026",
    visitTime: "08:30",
    provider: "Dr. I. Riaz",
    dx: "Oligometastatic recurrence · SBRT follow-up",
    status: "Review",
    statusColor: "amber",
    reason: "Post-SBRT PSA review",
    diagnosis: {
      primaryCancer: "Oligometastatic recurrent prostate cancer",
      stage: "M1a limited nodal recurrence",
      gleason: "4+3=7",
      diagnosisDate: "2021-06-19",
      ecog: "0",
      pathology: "Biochemical recurrence after RT; PSMA PET localized two pelvic nodal lesions.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Hyperlipidemia"],
    medications: ["Relugolix 120mg daily", "Atorvastatin 20mg daily"],
    flags: [
      { tone: "amber", text: "PSA response after nodal SBRT still incomplete" },
      { tone: "blue", text: "PSMA PET had shown only 2 pelvic nodal lesions" },
      { tone: "green", text: "No new pain or constitutional symptoms" },
    ],
    psa: [
      { m: "Oct", v: 1.8 },
      { m: "Nov", v: 2.3 },
      { m: "Dec", v: 3.4 },
      { m: "Jan", v: 2.1, drop: true },
      { m: "Feb", v: 1.4, drop: true },
      { m: "Mar", v: 1.1, drop: true },
      { m: "Apr", v: 0.9, drop: true },
    ],
    notes: [
      note("samir-khan", "n1", "Oncology", "Oligometastatic recurrence follow-up", "Dr. I. Riaz", "Apr 18 · 08:30", "Signed", "PSA continues to decline after SBRT to two pelvic nodes plus Relugolix. Continue current plan and reimage only if PSA plateaus.", { pinned: true }),
      note("samir-khan", "n2", "Radiation Oncology", "SBRT completion note", "Dr. M. Patel", "Jan 12 · 16:40", "Signed", "Delivered 30 Gy in 5 fractions to bilateral pelvic nodal targets without acute toxicity."),
      note("samir-khan", "n3", "Nuclear Medicine", "PSMA PET", "Dr. J. Keller", "Dec 3 · 10:25", "Final", "Two avid pelvic nodes; no osseous or visceral disease."),
      note("samir-khan", "n4", "Lab", "PSA follow-up", "Lab · Valley Diagnostics", "Apr 16 · 07:30", "Resulted", "PSA 0.9 ng/mL. Testosterone 22 ng/dL."),
    ],
    labsCBC: cbcPanel("Apr 16, 2026", [
      { name: "WBC", v: "5.6", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "13.6", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "228", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "0.9", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "ALT", v: "24", unit: "U/L", ref: "7–56", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 16, 2026", [
      { name: "PSA", v: "0.9", unit: "ng/mL", ref: "< 4.0", tone: "ok", note: "Continued decline after SBRT" },
      { name: "Testosterone", v: "22", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "LDH", v: "168", unit: "U/L", ref: "140–280", tone: "ok" },
      { name: "Alk Phos", v: "74", unit: "U/L", ref: "44–147", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("samir-khan", "i1", "Nuclear Medicine", "PSMA PET", "Dec 3, 2025", "Dr. J. Keller", "ct", "Two PSMA-avid right pelvic nodal lesions. No other avid disease.", "Oligometastatic nodal recurrence.", "Reasonable target for metastasis-directed therapy."),
      imagingStudy("samir-khan", "i2", "Radiation Oncology", "SBRT treatment summary", "Jan 12, 2026", "Dr. M. Patel", "ct", "Plan coverage met for two pelvic nodes. Organs at risk within tolerance.", "SBRT completed as prescribed.", "Supports observation with serial PSA."),
    ],
    transcript: [
      { speaker: "Dr. Riaz", text: "The PSA trend looks like a response after the node-directed radiation." },
      { speaker: "Patient", text: "So we do not need more scans right away?" },
      { speaker: "Dr. Riaz", text: "Not if the PSA keeps moving in the right direction and you feel well." },
      { speaker: "Patient", text: "That is good. I would rather avoid unnecessary imaging." },
    ],
  },
  {
    id: "gregory-finn",
    mrn: "MRN-015222",
    name: "Gregory Finn",
    initials: "GF",
    demo: "76M",
    age: 76,
    sex: "Male",
    dob: "1950-01-18",
    type: "Outpatient",
    avatarBg: "#D8D1BC",
    visitDate: "Apr 18, 2026",
    visitTime: "09:15",
    provider: "Dr. L. Watson",
    dx: "Frailty-focused prostate ca follow-up",
    status: "Scheduled",
    statusColor: "neutral",
    reason: "Shared decision-making follow-up",
    diagnosis: {
      primaryCancer: "Localized intermediate-risk prostate adenocarcinoma",
      stage: "cT2bN0M0",
      gleason: "3+4=7",
      diagnosisDate: "2025-10-09",
      ecog: "2",
      pathology: "Moderate-volume grade group 2 cancer in 5/12 cores.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["CHF", "COPD", "Mild cognitive impairment"],
    medications: ["Furosemide 20mg daily", "Spironolactone 25mg daily", "Tiotropium inhaler daily"],
    flags: [
      { tone: "amber", text: "Treatment choice driven heavily by frailty and competing comorbidities" },
      { tone: "blue", text: "Family meeting scheduled to review surveillance versus limited-course RT" },
      { tone: "green", text: "Symptoms remain dominated by non-cancer comorbidity burden" },
    ],
    psa: [
      { m: "Oct", v: 7.4 },
      { m: "Nov", v: 7.9 },
      { m: "Dec", v: 8.1 },
      { m: "Jan", v: 8.4 },
      { m: "Feb", v: 8.7 },
      { m: "Mar", v: 8.6, drop: true },
      { m: "Apr", v: 8.8 },
    ],
    notes: [
      note("gregory-finn", "n1", "Geriatric Oncology", "Shared decision-making visit", "Dr. L. Watson", "Apr 18 · 09:15", "Draft", "Discussing surveillance versus symptom-focused local therapy in context of frailty and heart failure.", { pinned: true }),
      note("gregory-finn", "n2", "Cardiology", "CHF follow-up", "Dr. R. Mehta", "Apr 2 · 13:45", "Signed", "Volume status stable. Dyspnea baseline. Cleared for limited outpatient procedures only."),
      note("gregory-finn", "n3", "Pathology", "Biopsy result", "Dr. H. Singh", "Oct 9 · 12:30", "Final", "Grade group 2 prostate adenocarcinoma in 5 of 12 cores."),
      note("gregory-finn", "n4", "Radiology", "MRI Prostate", "Dr. E. Morris", "Nov 12 · 14:20", "Final", "PIRADS 4 right peripheral zone lesion without ECE."),
    ],
    labsCBC: cbcPanel("Apr 10, 2026", [
      { name: "WBC", v: "7.2", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "12.1", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Platelets", v: "255", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "BNP", v: "312", unit: "pg/mL", ref: "< 100", tone: "high", flag: "H" },
      { name: "Creatinine", v: "1.3", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 10, 2026", [
      { name: "PSA", v: "8.8", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H", note: "Slowly rising but not explosive" },
      { name: "Testosterone", v: "402", unit: "ng/dL", ref: "264–916", tone: "ok" },
      { name: "Albumin", v: "3.6", unit: "g/dL", ref: "3.4–5.4", tone: "ok" },
      { name: "eGFR", v: "58", unit: "mL/min", ref: "> 60", tone: "low", flag: "L" },
    ]),
    imaging: [
      imagingStudy("gregory-finn", "i1", "Radiology", "MRI Prostate", "Nov 12, 2025", "Dr. E. Morris", "ct", "Right peripheral zone PIRADS 4 lesion. No extracapsular extension.", "Localized MRI-visible disease.", "Cancer control options must be weighed against comorbidity burden."),
      imagingStudy("gregory-finn", "i2", "Radiology", "CT chest", "Mar 18, 2026", "Dr. K. Nguyen", "ct", "Mild emphysematous changes. No suspicious pulmonary nodules.", "No thoracic metastatic disease.", "Performed for pulmonary symptoms rather than cancer progression."),
    ],
    transcript: [
      { speaker: "Dr. Watson", text: "The cancer is not the only thing we have to think about here." },
      { speaker: "Patient", text: "I mostly care about staying out of the hospital." },
      { speaker: "Dr. Watson", text: "That is exactly why we are balancing benefit with treatment burden." },
      { speaker: "Patient", text: "I want the least disruptive safe option." },
    ],
  },
  {
    id: "noah-ellis",
    mrn: "MRN-016341",
    name: "Noah Ellis",
    initials: "NE",
    demo: "58M",
    age: 58,
    sex: "Male",
    dob: "1967-04-06",
    type: "Outpatient",
    avatarBg: "#C8D7D6",
    visitDate: "Apr 18, 2026",
    visitTime: "10:00",
    provider: "Dr. A. Gomez",
    dx: "Young-onset prostate ca · survivorship / testosterone recovery",
    status: "Stable",
    statusColor: "green",
    reason: "Post-RT survivorship review",
    diagnosis: {
      primaryCancer: "Localized unfavorable intermediate-risk prostate adenocarcinoma",
      stage: "cT2bN0M0",
      gleason: "4+3=7",
      diagnosisDate: "2023-04-18",
      ecog: "0",
      pathology: "Grade group 3 disease treated with RT plus 6 months ADT.",
    },
    allergies: ["No known drug allergies"],
    comorbidities: ["Anxiety"],
    medications: ["Sertraline 50mg daily"],
    flags: [
      { tone: "green", text: "PSA remains low after definitive RT" },
      { tone: "blue", text: "Testosterone recovery underway after short-course ADT" },
      { tone: "amber", text: "Interested in exercise and sexual health optimization" },
    ],
    psa: [
      { m: "Oct", v: 0.24 },
      { m: "Nov", v: 0.20 },
      { m: "Dec", v: 0.18 },
      { m: "Jan", v: 0.16 },
      { m: "Feb", v: 0.15 },
      { m: "Mar", v: 0.14 },
      { m: "Apr", v: 0.13, drop: true },
    ],
    notes: [
      note("noah-ellis", "n1", "Oncology", "Survivorship follow-up", "Dr. A. Gomez", "Apr 18 · 10:00", "Signed", "Excellent PSA control after RT. Testosterone recovering gradually. Reviewed exercise, bone health, and sexual health expectations.", { pinned: true }),
      note("noah-ellis", "n2", "Lab", "PSA/Testosterone panel", "Lab · Valley Diagnostics", "Apr 16 · 08:25", "Resulted", "PSA 0.13 ng/mL. Testosterone 286 ng/dL."),
      note("noah-ellis", "n3", "Radiation Oncology", "Treatment completion summary", "Dr. M. Patel", "Nov 17 · 15:00", "Signed", "Completed 70 Gy prostate RT with mild GU toxicity only."),
      note("noah-ellis", "n4", "Behavioral Health", "Coping support", "Dr. T. Nguyen", "Mar 7 · 09:40", "Signed", "Adjustment symptoms improving with structured exercise and counseling."),
    ],
    labsCBC: cbcPanel("Apr 16, 2026", [
      { name: "WBC", v: "6.4", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "14.2", unit: "g/dL", ref: "13.5–17.5", tone: "ok" },
      { name: "Platelets", v: "248", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Creatinine", v: "0.9", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "Vitamin D", v: "37", unit: "ng/mL", ref: "30–100", tone: "ok" },
    ]),
    labsPSA: psaPanel("Apr 16, 2026", [
      { name: "PSA", v: "0.13", unit: "ng/mL", ref: "< 4.0", tone: "ok", note: "Appropriate post-RT nadir trend" },
      { name: "Testosterone", v: "286", unit: "ng/dL", ref: "264–916", tone: "ok", note: "Recovering after prior ADT" },
      { name: "TSH", v: "1.8", unit: "mIU/L", ref: "0.4–4.5", tone: "ok" },
      { name: "Lipid panel", v: "at goal", unit: "", ref: "", tone: "ok" },
    ]),
    imaging: [
      imagingStudy("noah-ellis", "i1", "Radiation Oncology", "Treatment summary CT", "Nov 17, 2025", "Dr. M. Patel", "ct", "Adaptive treatment completed with acceptable target coverage.", "Definitive RT completed.", "No immediate follow-up imaging indicated."),
      imagingStudy("noah-ellis", "i2", "Radiology", "Pelvic MRI baseline post-RT", "Feb 20, 2026", "Dr. E. Morris", "ct", "Expected post-radiation changes. No focal recurrence.", "No imaging evidence of local progression.", "Continue routine biochemical surveillance."),
    ],
    transcript: [
      { speaker: "Dr. Gomez", text: "Your recovery is going well, and the PSA remains low." },
      { speaker: "Patient", text: "I mostly want to know what normal testosterone recovery should look like." },
      { speaker: "Dr. Gomez", text: "You are moving in the right direction, and that often improves energy and libido over time." },
      { speaker: "Patient", text: "That is reassuring." },
    ],
  },
];

const originalPatientNames = patientCharts.map((chart) => chart.name);
const syntheticNameMap = Object.fromEntries(
  originalPatientNames.map((name, index) => [name, SYNTHETIC_PATIENT_NAMES[index] || `Demo Patient ${index + 1}`]),
);
const syntheticMrnMap = Object.fromEntries(
  patientCharts.map((chart, index) => [chart.mrn, `SYN-${String(index + 1).padStart(4, "0")}`]),
);

patientCharts.forEach((chart) => {
  const syntheticName = syntheticNameMap[chart.name];
  const transformText = (value) => {
    let next = shiftStringDates(normalizeProviderName(value));
    originalPatientNames.forEach((originalName) => {
      next = next.replaceAll(originalName, syntheticNameMap[originalName]);
    });
    Object.entries(syntheticMrnMap).forEach(([originalMrn, syntheticMrn]) => {
      next = next.replaceAll(originalMrn, syntheticMrn);
    });
    return next;
  };

  chart.synthetic = true;
  chart.name = syntheticName;
  chart.initials = syntheticName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  chart.mrn = syntheticMrnMap[chart.mrn];
  chart.demo = `${chart.age}${chart.sex?.[0] || ""} · Synthetic`;
  chart.dob = chart.dob ? `${chart.dob.slice(0, 7)}-01` : chart.dob;
  chart.provider = normalizeProviderName(chart.provider);
  chart.visitDate = shiftDisplayDateString(chart.visitDate);
  chart.reason = transformText(chart.reason);
  chart.dx = transformText(chart.dx);
  chart.flags = chart.flags.map((flag) => ({ ...flag, text: transformText(flag.text) }));
  chart.notes = chart.notes.map((note) => deepMapStrings(note, transformText));
  chart.labsCBC.date = shiftDisplayDateString(chart.labsCBC.date);
  chart.labsPSA.date = shiftDisplayDateString(chart.labsPSA.date);
  chart.imaging = chart.imaging.map((study) => ({
    ...deepMapStrings(study, transformText),
    date: shiftDisplayDateString(study.date),
    author: normalizeProviderName(study.author),
  }));
  chart.transcript = chart.transcript.map((entry) => ({
    ...entry,
    speaker: normalizeProviderName(entry.speaker),
    text: transformText(entry.text),
  }));
});

export const patientIndex = Object.fromEntries(patientCharts.map((chart) => [chart.id, chart]));

export function getPatientChart(id) {
  return patientIndex[id] || patientCharts[0];
}

function toPatientListRow(chart) {
  return {
    mrn: chart.mrn,
    name: chart.name,
    initials: chart.initials,
    demo: chart.demo,
    type: chart.type,
    dx: chart.dx,
    status: chart.status,
    statusColor: chart.statusColor,
    time: chart.visitTime,
    reason: chart.reason,
    avatarBg: chart.avatarBg,
    primary: !!chart.primary,
  };
}

function toScreenData(chart) {
  return {
    activePatientId: chart.id,
    patientCharts,
    patientProfile: chart,
    patients: patientCharts.map(toPatientListRow),
    flags: chart.flags,
    psa: chart.psa,
    notes: chart.notes,
    labsCBC: chart.labsCBC,
    labsPSA: chart.labsPSA,
    imaging: chart.imaging,
    transcript: chart.transcript,
  };
}

export const data = toScreenData(getPatientChart("james-park"));
