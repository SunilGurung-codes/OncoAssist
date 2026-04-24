import React, { useState, useEffect, useRef } from "react";
import { data } from "../data.js";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { useDrop } from "../components/ui/useDrop.js";
import { Micro } from "../components/ui/Micro.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { LeftPanel, RightPanel } from "../components/panels.jsx";

export function CopilotScreen({ patient = data.patientProfile, onNav, initialTab, theme, toggleTheme }) {
    const [tab, setTab] = useState(initialTab || "Notes");
    useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
    const [initial, setInitial] = useState(() => buildInitialMessages(patient));
    useEffect(() => setInitial(buildInitialMessages(patient)), [patient]);
    return <div className="stage" data-screen-label={`0${({ Notes: 3, Labs: 4, Imaging: 5 })[tab]} Co-pilot · ${tab}`}>
        <TopBar theme={theme} toggleTheme={toggleTheme} />
        <div className="screen-body">
            <LeftPanel patient={patient} />
            <CopilotCenter patient={patient} onNav={onNav} tab={tab} setTab={setTab} initial={initial} />
            <RightPanel patient={patient} tab={tab} onTab={setTab} notes={patient.notes} />
        </div>
    </div>;
}

function CopilotCenter({ patient, onNav, tab, setTab, initial }) {
    const [messages, setMessages] = useState(initial || []);
    const [input, setInput] = useState("");
    const [ctx, setCtx] = useState([{ kind: "data", label: "PSA history" }, { kind: "data", label: `Labs ${patient.labsPSA?.date || patient.visitDate}` }]);
    const drop = useDrop(d => setCtx(c => [...c, { kind: d.kind, label: d.label }]));
    const ref = useRef(null);
    useEffect(() => {
        setMessages(initial || []);
        setCtx([{ kind: "data", label: "PSA history" }, { kind: "data", label: `Labs ${patient.labsPSA?.date || patient.visitDate}` }]);
    }, [initial, patient]);
    useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
    const send = t => {
        if (!t.trim()) return; setMessages(m => [...m, { role: "user", text: t, t: "now" }]); setInput("");
        setTimeout(() => setMessages(m => [...m, { role: "ai", text: ans(t, patient), t: "now", cites: ["PSA history", patient.labsPSA?.date || "Current labs", patient.reason] }]), 500);
    };
    const steps = [
        { tag: "Q1", q: `Compare ${patient.name}'s PSA trend with recent visits.` },
        { tag: "Q2", q: `What monitoring cadence fits ${patient.medications?.[0] || "the current regimen"}?` },
        { tag: "Q3", q: `Summarize the key decision points for ${patient.reason.toLowerCase()}.` }
    ];

    return <div className="panel-main" style={{ background: "var(--c-surface)" }}>
        <div style={{ minHeight: 44, borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => onNav("dashboard")} style={{ cursor: "pointer", fontSize: 13, color: "var(--c-text-mute)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>{Icon.chevLeft({ s: 12 })} Dashboard</span>
                <span style={{ color: "var(--c-text-ghost)" }}>/</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{patient.name}</span>
                <Chip tone={patient.statusColor === "red" ? "red" : patient.statusColor === "amber" ? "amber" : patient.statusColor === "green" ? "green" : "blue"} size="sm">{patient.status}</Chip>
                <Chip tone="blue" size="sm">{patient.reason}</Chip>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
                {["Notes", "Labs", "Imaging", "Review"].map(t => <span key={t} onClick={() => t === "Review" ? onNav("review") : setTab(t)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: tab === t ? "var(--c-text)" : "var(--c-text-mute)", background: tab === t ? "var(--c-surface-alt)" : "transparent" }}>{t}</span>)}
            </div>
        </div>

        <div ref={ref} className="scroll" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ border: "0.5px solid var(--c-border-faint)", borderRadius: 10, padding: "12px 14px", background: "#FAFAF7", marginBottom: 14 }}>
                <div className="label-xs" style={{ color: "var(--c-blue-deep)", marginBottom: 6 }}>PATIENT BRIEF</div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}><b>{patient.name}, {patient.demo}</b> — {patient.dx}. On <b>{patient.medications?.[0] || "current therapy"}</b>. Latest PSA: <span style={{ color: "var(--c-green-deep)", fontWeight: 600 }}>{patient.labsPSA?.rows?.[0]?.v} {patient.labsPSA?.rows?.[0]?.unit}</span>{patient.labsPSA?.rows?.[0]?.note ? ` — ${patient.labsPSA.rows[0].note}.` : "."}</div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface-alt)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, fontSize: 13 }}><span style={{ color: "var(--c-blue)" }}>{Icon.sparkle({ s: 12 })}</span>Smart steps · AI-suggested</div>
                    <span style={{ fontSize: 12, color: "var(--c-text-mute)" }}>3 questions · 1 draft</span>
                </div>
                {steps.map((s, i) => <div key={i} style={{ borderTop: i === 0 ? "none" : "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Chip tone="blue" size="xs">{s.tag}</Chip>
                    <div style={{ flex: 1, fontSize: 14, lineHeight: 1.45 }}>{s.q}</div>
                    <span className="micro" onClick={() => send(s.q)}>Ask →</span>
                </div>)}
                <div style={{ borderTop: "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, background: "var(--c-blue-50)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--c-blue)" }} />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--c-blue-deep)" }}>Help me draft the follow-up note</div>
                    <span className="micro" style={{ background: "var(--c-surface)", color: "var(--c-blue-deep)" }} onClick={() => send("Draft follow-up note")}>Run →</span>
                </div>
            </div>

            {messages.map((m, i) => m.role === "user" ?
                <div key={i} className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <div style={{ maxWidth: "74%", background: "var(--c-surface-alt)", padding: "10px 14px", borderRadius: "10px 10px 0 10px", fontSize: 14, lineHeight: 1.55 }}>{m.text}</div>
                </div>
                : <div key={i} className="fade-in" style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Chip tone="blue-solid" size="sm">OncoAssist</Chip><span style={{ fontSize: 11, color: "var(--c-text-ghost)" }}>Apr 17 · {m.t}</span></div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
                    {m.cites && <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-blue-deep)", display: "flex", gap: 4, flexWrap: "wrap" }}>{m.cites.map((c, j) => <span key={j}>[{c}]</span>)}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}><Micro icon={Icon.copy({ s: 10 })}>Copy</Micro><Micro icon={Icon.edit({ s: 10 })}>Edit</Micro><Micro icon={Icon.plus({ s: 10 })}>Add to Note</Micro></div>
                </div>
            )}
        </div>

        <div style={{ borderTop: "0.5px solid var(--c-border-faint)" }}>
            <div style={{ padding: "10px 16px 6px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--c-text-soft)" }}>Context:</span>
                {ctx.map((c, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, fontSize: 12, background: c.kind === "note" ? "var(--c-blue-100)" : "var(--c-surface-alt)", border: "0.5px solid " + (c.kind === "note" ? "var(--c-blue-250)" : "var(--c-border)"), color: "var(--c-text-mute)" }}>
                    {c.kind === "note" ? Icon.file({ s: 10 }) : Icon.lab({ s: 10 })}{c.label}
                    <span onClick={() => setCtx(a => a.filter((_, j) => j !== i))} style={{ cursor: "pointer" }}>{Icon.x({ s: 9 })}</span>
                </span>)}
            </div>
            <div {...drop.props} className={drop.over ? "drop-active" : ""} style={{ margin: "4px 16px 14px", borderRadius: 10, background: "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--c-text-mute)" }}>{Icon.paperclip({ s: 14 })}</span>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask anything or drag a note here" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14 }} />
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-mute)", cursor: "pointer" }}>{Icon.mic({ s: 16 })}</div>
                    <div onClick={() => send(input)} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-blue)", color: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{Icon.send({ s: 14 })}</div>
                </div>
            </div>
        </div>
    </div>;
}

function buildInitialMessages(patient) {
    const psaTrend = (patient.psa || []).map((point) => point.v).join(" → ");
    return [
        { role: "user", text: `Compare ${patient.name}'s PSA to the last 7 readings.`, t: patient.visitTime || "09:08" },
        { role: "ai", text: `PSA trend (${(patient.psa || []).map((point) => point.m).join(" → ")}): ${psaTrend} ng/mL.\n\nCurrent visit focus: ${patient.reason}. Latest assessment remains ${patient.status.toLowerCase()} with chart context from notes, labs, and imaging loaded for this patient.`, t: patient.visitTime || "09:08", cites: ["PSA history", patient.labsPSA?.date || "Current labs", patient.reason] }
    ];
}

function ans(q, patient) {
    const l = q.toLowerCase();
    if (l.includes("draft") || l.includes("note")) return `Draft — ${patient.reason}\n\n${patient.name}, ${patient.demo}. ${patient.dx}.\n\nInterval history: ${patient.transcript?.find((entry) => /Patient/i.test(entry.speaker))?.text || "Patient reviewed in clinic."}\n\nLatest labs: ${patient.labsPSA?.rows?.[0]?.name} ${patient.labsPSA?.rows?.[0]?.v} ${patient.labsPSA?.rows?.[0]?.unit || ""}${patient.labsPSA?.rows?.[0]?.note ? ` — ${patient.labsPSA.rows[0].note}` : ""}.\n\nAssessment: ${patient.status} clinical picture with continued review of symptoms, imaging, and lab trends.\n\nPlan:\n• Continue current management pending clinician decision\n• Recheck labs per follow-up schedule\n• Review supportive care needs\n• Return to clinic as planned`;
    if (l.includes("monitor") || l.includes("cadence")) return `Recommended monitoring for ${patient.medications?.[0] || "this regimen"}:\n• PSA and key labs at the next scheduled follow-up\n• Symptom review at each visit\n• Imaging only if symptoms or labs suggest progression\n\nFor this patient: ${patient.reason}. Current status is ${patient.status.toLowerCase()}.`;
    if (l.includes("dose") || l.includes("lh")) return `Dose changes should be based on this patient's toxicities, functional status, and overall disease course rather than one hormone result alone.\n\nCurrent regimen in chart: ${patient.medications?.slice(0, 2).join(", ") || "see medication list"}.`;
    return `${patient.name}'s chart shows ${patient.dx}. Current visit reason: ${patient.reason}. Latest PSA is ${patient.labsPSA?.rows?.[0]?.v} ${patient.labsPSA?.rows?.[0]?.unit || ""}${patient.labsPSA?.rows?.[0]?.note ? ` (${patient.labsPSA.rows[0].note})` : ""}. Recent notes and imaging remain available in the side panel for deeper review.`;
}
