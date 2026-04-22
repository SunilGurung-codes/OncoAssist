import React, { useState, useEffect, useRef } from "react";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { useDrop } from "../components/ui/useDrop.js";
import { Micro } from "../components/ui/Micro.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { LeftPanel, RightPanel } from "../components/panels.jsx";

export function CopilotScreen({ onNav, initialTab }) {
    const [tab, setTab] = useState(initialTab || "Notes");
    useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
    const [initial] = useState([
        { role: "user", text: "Compare today's PSA to the last 7 readings.", t: "09:08" },
        { role: "ai", text: "PSA (Oct 2025 → Apr 2026): 5.2 → 6.8 → 9.1 → 12.4 → 15.8 → 18.4 → 16.2 ng/mL.\n\nApr 17 is the first decrease in 7 readings — ~12% drop from the Mar peak. Aligns with Day 14 Enzalutamide and the expected early-response window for ARPI in M0 CRPC.", t: "09:08", cites: ["PSA history", "Labs Apr 17", "NCCN PROS-11"] }
    ]);
    return <div className="stage" data-screen-label={`0${({ Notes: 3, Labs: 4, Imaging: 5 })[tab]} Co-pilot · ${tab}`}>
        <TopBar />
        <div className="screen-body">
            <LeftPanel />
            <CopilotCenter onNav={onNav} tab={tab} setTab={setTab} initial={initial} />
            <RightPanel tab={tab} onTab={setTab} />
        </div>
    </div>;
}

function CopilotCenter({ onNav, tab, setTab, initial }) {
    const [messages, setMessages] = useState(initial || []);
    const [input, setInput] = useState("");
    const [ctx, setCtx] = useState([{ kind: "data", label: "PSA history" }, { kind: "data", label: "Labs Apr 17" }]);
    const drop = useDrop(d => setCtx(c => [...c, { kind: d.kind, label: d.label }]));
    const ref = useRef(null);
    useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
    const send = t => {
        if (!t.trim()) return; setMessages(m => [...m, { role: "user", text: t, t: "now" }]); setInput("");
        setTimeout(() => setMessages(m => [...m, { role: "ai", text: ans(t), t: "now", cites: ["PSA history", "NCCN PROS-11", "Labs Apr 17"] }]), 500);
    };
    const steps = [{ tag: "Q1", q: "Does the PSA drop confirm early Enzalutamide response?" }, { tag: "Q2", q: "Recommended monitoring cadence on Enzalutamide?" }, { tag: "Q3", q: "Any dose adjustments needed given LH/FSH suppression?" }];

    return <div className="panel-main" style={{ background: "var(--c-surface)" }}>
        <div style={{ minHeight: 44, borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => onNav("dashboard")} style={{ cursor: "pointer", fontSize: 12, color: "var(--c-text-mute)", display: "flex", alignItems: "center", gap: 4 }}>{Icon.chevLeft({ s: 12 })} Dashboard</span>
                <span style={{ color: "var(--c-text-ghost)" }}>/</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>James Park</span>
                <Chip tone="red" size="sm">CRPC</Chip>
                <Chip tone="blue" size="sm">Enzalutamide · 14d</Chip>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
                {["Notes", "Labs", "Imaging", "Review"].map(t => <span key={t} onClick={() => t === "Review" ? onNav("review") : setTab(t)} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", color: tab === t ? "var(--c-text)" : "var(--c-text-mute)", background: tab === t ? "var(--c-surface-alt)" : "transparent" }}>{t}</span>)}
            </div>
        </div>

        <div ref={ref} className="scroll" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ border: "0.5px solid var(--c-border-faint)", borderRadius: 10, padding: "12px 14px", background: "#FAFAF7", marginBottom: 14 }}>
                <div className="label-xs" style={{ color: "var(--c-blue-deep)", marginBottom: 6 }}>PATIENT BRIEF</div>
                <div style={{ fontSize: 13, lineHeight: 1.55 }}><b>James Park, 67M</b> — Prostate adenoca, Gleason 4+3, cT2cN0M0. On ADT + <b>Enzalutamide 160mg QD</b> (Mar 28). PSA: 5.2 → 18.4 → <span style={{ color: "var(--c-green-deep)", fontWeight: 500 }}>16.2 ng/mL</span> — first decrease in 7 months.</div>
            </div>

            <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface-alt)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, fontSize: 13 }}><span style={{ color: "var(--c-blue)" }}>{Icon.sparkle({ s: 12 })}</span>Smart steps · AI-suggested</div>
                    <span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>3 questions · 1 draft</span>
                </div>
                {steps.map((s, i) => <div key={i} style={{ borderTop: i === 0 ? "none" : "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Chip tone="blue" size="xs">{s.tag}</Chip>
                    <div style={{ flex: 1, fontSize: 13 }}>{s.q}</div>
                    <span className="micro" onClick={() => send(s.q)}>Ask →</span>
                </div>)}
                <div style={{ borderTop: "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, background: "var(--c-blue-50)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--c-blue)" }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--c-blue-deep)" }}>Help me draft the follow-up note</div>
                    <span className="micro" style={{ background: "var(--c-surface)", color: "var(--c-blue-deep)" }} onClick={() => send("Draft follow-up note")}>Run →</span>
                </div>
            </div>

            {messages.map((m, i) => m.role === "user" ?
                <div key={i} className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                    <div style={{ maxWidth: "74%", background: "var(--c-surface-alt)", padding: "10px 14px", borderRadius: "10px 10px 0 10px", fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                </div>
                : <div key={i} className="fade-in" style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Chip tone="blue-solid" size="sm">OncoAssist</Chip><span style={{ fontSize: 10, color: "var(--c-text-ghost)" }}>Apr 17 · {m.t}</span></div>
                    <div style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.text}</div>
                    {m.cites && <div style={{ marginTop: 8, fontSize: 10, color: "var(--c-blue)", display: "flex", gap: 4, flexWrap: "wrap" }}>{m.cites.map((c, j) => <span key={j}>[{c}]</span>)}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}><Micro icon={Icon.copy({ s: 10 })}>Copy</Micro><Micro icon={Icon.edit({ s: 10 })}>Edit</Micro><Micro icon={Icon.plus({ s: 10 })}>Add to Note</Micro></div>
                </div>
            )}
        </div>

        <div style={{ borderTop: "0.5px solid var(--c-border-faint)" }}>
            <div style={{ padding: "10px 16px 6px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--c-text-soft)" }}>Context:</span>
                {ctx.map((c, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 6, fontSize: 11, background: c.kind === "note" ? "var(--c-blue-100)" : "var(--c-surface-alt)", border: "0.5px solid " + (c.kind === "note" ? "var(--c-blue-250)" : "var(--c-border)"), color: "var(--c-text-mute)" }}>
                    {c.kind === "note" ? Icon.file({ s: 10 }) : Icon.lab({ s: 10 })}{c.label}
                    <span onClick={() => setCtx(a => a.filter((_, j) => j !== i))} style={{ cursor: "pointer" }}>{Icon.x({ s: 9 })}</span>
                </span>)}
            </div>
            <div {...drop.props} className={drop.over ? "drop-active" : ""} style={{ margin: "4px 16px 14px", borderRadius: 10, background: "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--c-text-mute)" }}>{Icon.paperclip({ s: 14 })}</span>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask anything or drag a note here" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13 }} />
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-mute)", cursor: "pointer" }}>{Icon.mic({ s: 16 })}</div>
                    <div onClick={() => send(input)} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-blue)", color: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{Icon.send({ s: 14 })}</div>
                </div>
            </div>
        </div>
    </div>;
}

function ans(q) {
    const l = q.toLowerCase();
    if (l.includes("draft") || l.includes("note")) return `Draft — Follow-up · Day 14 Enzalutamide\n\nJames Park, 67M. Day 14 Enzalutamide 160mg QD for M0 CRPC.\n\nInterval history: Mild fatigue, occasional hot flashes (~3/wk). No falls, no seizure activity.\n\nLabs (Apr 17): PSA 16.2 ng/mL — decreased from 18.4 (Mar). Testosterone < 50 ng/dL.\n\nAssessment: Early biochemical response to ARPI therapy.\n\nPlan:\n• Continue Enzalutamide 160mg QD\n• Continue Leuprolide\n• Recheck PSA + CBC in 4 weeks (May 15)\n• RTC Jun 12`;
    if (l.includes("monitor") || l.includes("cadence")) return `Recommended monitoring on Enzalutamide (NCCN PROS-11):\n• PSA + testosterone q4-8 wk for first 6 mo, then q3 mo\n• CBC + LFTs q3 mo\n• BP at each visit (HTN risk 5-7%)\n• Fall + seizure screen at each visit\n\nFor this patient: Day 14 drop is a strong early signal. 4-week recheck (May 15) is appropriate.`;
    if (l.includes("dose") || l.includes("lh")) return `Suppressed LH/FSH reflect Leuprolide (GnRH agonist) — expected, not reason to adjust Enzalutamide.\n\nTarget is castrate T < 50 ng/dL, achieved. Enzalutamide dose is adjusted for toxicity (fatigue, HTN, seizure), not endocrine labs. No dose change indicated.`;
    return `Yes — a PSA decline of 18.4 → 16.2 (~12%) at Day 14 meets early PSA response criteria per PCWG3. Castrate testosterone maintained, no new symptoms, no radiographic progression. Continue regimen; recheck 4 weeks.`;
}
