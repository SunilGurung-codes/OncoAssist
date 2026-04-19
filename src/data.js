export const data = {
  patients: [
    {
      mrn: "MRN-003291", name: "James Park", initials: "JP", demo: "67M", type: "Outpatient",
      dx: "Prostate adenoca · CRPC · Gleason 4+3", status: "Urgent", statusColor: "red",
      time: "09:00", reason: "Day 14 Enzalutamide · PSA follow-up", avatarBg: "#C7D9EB", primary: true
    },
    {
      mrn: "MRN-005432", name: "Robert Chen", initials: "RC", demo: "72M", type: "Outpatient",
      dx: "Prostate ca · localised · on active surveillance", status: "Stable", statusColor: "green",
      time: "09:30", reason: "Quarterly PSA check", avatarBg: "#D9CFB8"
    },
    {
      mrn: "MRN-006118", name: "Marcus Okafor", initials: "MO", demo: "64M", type: "Outpatient",
      dx: "Prostate ca · post-RP · biochemical recurrence", status: "Review", statusColor: "amber",
      time: "10:15", reason: "Salvage RT decision", avatarBg: "#E0C7B7"
    },
    {
      mrn: "MRN-004402", name: "David Nakamura", initials: "DN", demo: "70M", type: "New referral",
      dx: "Elevated PSA · biopsy pending", status: "New", statusColor: "blue",
      time: "11:00", reason: "Initial consult · biopsy review", avatarBg: "#F0D6C8"
    },
    {
      mrn: "MRN-007714", name: "Anika Patel", initials: "AP", demo: "55F", type: "Outpatient",
      dx: "Abdominal mass · imaging ordered", status: "Pending", statusColor: "amber",
      time: "11:30", reason: "Imaging review", avatarBg: "#E8D7BC"
    },
    {
      mrn: "MRN-009934", name: "Sara Lin", initials: "SL", demo: "38F", type: "Outpatient",
      dx: "Unexplained fatigue · CBC ordered", status: "Scheduled", statusColor: "neutral",
      time: "13:00", reason: "Lab review", avatarBg: "#D6D3C4"
    },
    {
      mrn: "MRN-002218", name: "William Hayes", initials: "WH", demo: "68M", type: "Outpatient",
      dx: "Prostate ca · on ADT only · stable", status: "Stable", statusColor: "green",
      time: "14:00", reason: "6-month check-in", avatarBg: "#C8D9C1"
    },
    {
      mrn: "MRN-008810", name: "Henry Adebayo", initials: "HA", demo: "61M", type: "Outpatient",
      dx: "Post-prostatectomy · undetectable PSA", status: "Stable", statusColor: "green",
      time: "14:45", reason: "Annual follow-up", avatarBg: "#E4CAB5"
    }
  ],

  flags: [
    { tone: "red", text: "PSA rose 5.2 → 18.4 over 7 months on ADT alone — CRPC confirmed Apr 1" },
    { tone: "green", text: "Testosterone suppressed < 50 ng/dL (castrate range maintained)" },
    { tone: "blue", text: "Started Enzalutamide 160mg Mar 28 — Day 14 today" },
    { tone: "amber", text: "Prior auth approved · patient counselled on seizure + fall risk" }
  ],

  psa: [
    { m: "Oct", v: 5.2 },
    { m: "Nov", v: 6.8 },
    { m: "Dec", v: 9.1 },
    { m: "Jan", v: 12.4 },
    { m: "Feb", v: 15.8 },
    { m: "Mar", v: 18.4 },
    { m: "Apr", v: 16.2, drop: true }
  ],

  notes: [
    {
      id: "n1", dept: "Oncology", type: "Consultant Note · CRPC escalation",
      author: "Dr. I. Riaz", date: "Apr 1 · 14:30", status: "Signed", pinned: true,
      preview: "PSA tripled over 6 months on ADT alone. Meets NCCN criteria for M0 CRPC. Starting Enzalutamide 160mg QD."
    },
    {
      id: "n2", dept: "Oncology", type: "Progress Note · Enzalutamide start",
      author: "Dr. S. Barker", cosign: "Dr. I. Riaz", date: "Apr 3 · 09:10", status: "Signed",
      preview: "Enzalutamide 160mg dispensed. Prior auth approved. Patient counselled on side effects. Next PSA at Apr 17 visit."
    },
    {
      id: "n3", dept: "Radiology", type: "CT Abd/Pelvis w/ contrast",
      author: "Dr. K. Nguyen", date: "Mar 20 · 11:40", status: "Final",
      preview: "No adenopathy. No visceral metastases. Prostate gland 45cc. No interval change from prior."
    },
    {
      id: "n4", dept: "Radiology", type: "Tc-99m Bone Scan",
      author: "Dr. K. Nguyen", date: "Mar 20 · 13:00", status: "Final",
      preview: "No abnormal radiotracer uptake to suggest osseous metastatic disease. Degenerative changes lumbar spine."
    },
    {
      id: "n5", dept: "Urology", type: "Progress Note · follow-up",
      author: "Dr. M. Choi", date: "Feb 18 · 10:20", status: "Signed",
      preview: "PSA rising despite ADT. Coordinating with oncology for ARPI consideration. Continue Leuprolide."
    },
    {
      id: "n6", dept: "Lab", type: "PSA + Testosterone panel",
      author: "Lab · Mayo Central", date: "Apr 17 · 07:45", status: "Resulted",
      preview: "PSA 16.2 ng/mL (H). Testosterone < 50 ng/dL. LH 0.8, FSH 1.4."
    },
    {
      id: "n7", dept: "Oncology", type: "Phone encounter · symptom check",
      author: "Dr. S. Barker", date: "Apr 10 · 16:20", status: "Signed",
      preview: "Patient reports mild fatigue, 3 hot flashes/week on Enzalutamide. No falls, no seizure activity. Reassured."
    },
    {
      id: "n8", dept: "ER", type: "ED Note · syncope ruled out",
      author: "Dr. R. Ortiz", date: "Mar 12 · 02:15", status: "Signed",
      preview: "Brief presyncope, resolved. Orthostatic BP unremarkable. Likely volume-related. Discharged home."
    },
    {
      id: "n9", dept: "Primary Care", type: "Annual physical",
      author: "Dr. L. Watson", date: "Jan 14 · 10:00", status: "Signed",
      preview: "Vitals stable, weight 78kg. PSA rising — escalating to urology. HTN well-controlled on amlodipine."
    },
    {
      id: "n10", dept: "Pharmacy", type: "Medication reconciliation",
      author: "Pharm. J. Alvarez", date: "Apr 3 · 11:00", status: "Final",
      preview: "Current meds: Leuprolide 22.5mg IM q3mo, Enzalutamide 160mg QD, Amlodipine 5mg QD, Vitamin D3."
    },
    {
      id: "n11", dept: "Oncology", type: "Tumor Board Summary",
      author: "Tumor Board", date: "Mar 25 · 17:00", status: "Signed",
      preview: "Case reviewed. Consensus: M0 CRPC per conventional imaging. Recommend Enzalutamide, Apalutamide, or Darolutamide."
    }
  ],

  labsCBC: {
    date: "Apr 17, 2026",
    rows: [
      { name: "WBC", v: "5.4", unit: "×10⁹/L", ref: "4.0–11.0", tone: "ok" },
      { name: "Hgb", v: "12.8", unit: "g/dL", ref: "13.5–17.5", tone: "low", flag: "L" },
      { name: "Hct", v: "38.2", unit: "%", ref: "41–53", tone: "low", flag: "L" },
      { name: "Platelets", v: "224", unit: "×10⁹/L", ref: "150–400", tone: "ok" },
      { name: "Neutrophils", v: "3.1", unit: "×10⁹/L", ref: "1.8–7.7", tone: "ok" }
    ]
  },
  labsPSA: {
    date: "Apr 17, 2026",
    rows: [
      {
        name: "PSA", v: "16.2", unit: "ng/mL", ref: "< 4.0", tone: "high", flag: "H",
        note: "↓ from 18.4 on Mar 26 (first decrease)"
      },
      { name: "Testosterone", v: "< 50", unit: "ng/dL", ref: "castrate < 50", tone: "ok" },
      { name: "LH", v: "0.8", unit: "IU/L", ref: "1.7–8.6", tone: "low", flag: "L" },
      { name: "FSH", v: "1.4", unit: "IU/L", ref: "1.5–12.4", tone: "low", flag: "L" },
      { name: "Creatinine", v: "1.1", unit: "mg/dL", ref: "0.7–1.3", tone: "ok" },
      { name: "ALT", v: "28", unit: "U/L", ref: "7–56", tone: "ok" }
    ]
  },

  imaging: [
    {
      id: "i1", dept: "Radiology", type: "CT Abdomen/Pelvis with contrast",
      date: "Mar 20, 2026", author: "Dr. K. Nguyen", thumb: "ct",
      findings: "Prostate gland measures 45cc. No focal enhancing lesion. No pelvic adenopathy. Liver, spleen, kidneys unremarkable.",
      impression: "No evidence of metastatic disease. No interval change from Oct 2025.",
      note: "Staging remains M0. Supports CRPC designation without visceral spread."
    },
    {
      id: "i2", dept: "Radiology", type: "Tc-99m MDP Bone Scan",
      date: "Mar 20, 2026", author: "Dr. K. Nguyen", thumb: "bone",
      findings: "Symmetric skeletal radiotracer uptake. Degenerative changes at L4-L5 and both knees. No focal abnormal uptake.",
      impression: "No scintigraphic evidence of osseous metastatic disease.",
      note: "Negative bone scan supports M0 CRPC. Consider PSMA PET if PSA continues to rise."
    },
    {
      id: "i3", dept: "Urology", type: "Transrectal Ultrasound",
      date: "Feb 18, 2026", author: "Dr. M. Choi", thumb: "us",
      findings: "Prostate volume 45cc. Mixed echogenicity. Hypoechoic region in left peripheral zone unchanged from prior.",
      impression: "Stable prostate appearance. No new suspicious lesion.",
      note: "No new biopsy target. Rising PSA reflects systemic progression, not local recurrence."
    }
  ],

  transcript: [
    { speaker: "Dr. Riaz", text: "So James, how have you been since our last visit?" },
    { speaker: "Patient", text: "A little more tired this week. But nothing major — I'm still walking the dog in the mornings." },
    { speaker: "Dr. Riaz", text: "Any hot flashes, falls, unusual headaches or anything like a seizure?" },
    { speaker: "Patient", text: "Hot flashes maybe three times a week. No falls, nothing like a seizure. I'd definitely know." },
    { speaker: "Dr. Riaz", text: "Good. Your PSA today was 16.2, down from 18.4 last month. That's the first decrease we've seen." },
    { speaker: "Patient", text: "That's good news, right?" },
    { speaker: "Dr. Riaz", text: "Yes — it means the Enzalutamide is starting to work. We'll continue the same dose and recheck in four weeks." }
  ]
};
