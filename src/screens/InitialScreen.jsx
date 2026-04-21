import React, { useState, useEffect } from "react";
import { data } from "../data.js";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { RightPanel } from "../components/panels.jsx";

export function InitialScreen({ onNav, onEnterNotes }) {
    const [state, setState] = useState("ready");
    const [tab, setTab] = useState("Notes");
    const [elapsed, setElapsed] = useState(0);
    const [vis, setVis] = useState(0);
    const tr = data.transcript;
    useEffect(() => { let id; if (state === "recording") id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, [state]);
    useEffect(() => { if (state !== "recording") return; const t = setInterval(() => setVis(v => Math.min(v + 1, tr.length)), 1500); return () => clearInterval(t); }, [state, tr]);
    useEffect(() => { if (state === "generating") { const t = setTimeout(() => setState("drafted"), 2200); return () => clearTimeout(t); } }, [state]);
    const fmt = s => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const start = () => { setElapsed(0); setVis(0); setState("recording"); };

    return <div className="stage" data-screen-label="02 Initial · Ambience">
        <TopBar />
        <div className="screen-body">
            <div className="panel-left">
                <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar lg" style={{ background: "#C7D9EB", color: "var(--c-blue-deep)" }}>JP</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500 }}>James Park</div><div style={{ fontSize: 11, color: "var(--c-text-mute)", marginTop: 2 }}>67M · Visit Apr 17</div></div>
                </div>
                {state === "ready" && <div>
                    <div style={{ height: 36, background: "#FFEBEB", padding: "0 12px", display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-red)" }} /><span className="label-xs" style={{ color: "var(--c-red-deep)" }}>AMBIENT · READY</span></div>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "#FCEBEB", border: "0.5px solid #F7C1C1", fontSize: 11, fontWeight: 500, color: "var(--c-red-deep)" }}>00:00:00</span>
                    </div>
                    <div style={{ padding: "10px 14px" }}><button onClick={start} className="btn sm" style={{ width: "100%", background: "var(--c-red)", color: "#fff" }}>Start recording</button></div>
                </div>}
                {state === "recording" && <div>
                    <div style={{ height: 36, background: "#FFEBEB", padding: "0 12px", display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="pulse-red" style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-red)" }} /><span className="label-xs" style={{ color: "var(--c-red-deep)" }}>AMBIENT · RECORDING</span></div>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "#FCEBEB", border: "0.5px solid #F7C1C1", fontSize: 11, fontWeight: 500, color: "var(--c-red-deep)" }}>{fmt(elapsed)}</span>
                    </div>
                    <div style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 22, marginBottom: 10 }}>
                            {Array.from({ length: 28 }).map((_, i) => <span key={i} className="wave-bar" style={{ height: Math.abs(Math.sin(i * 0.6 + elapsed * 0.8) * 16) + 4 + "px", animation: `wave ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.05}s` }} />)}
                        </div>
                        <button onClick={() => setState("generating")} className="btn sm" style={{ width: "100%", background: "var(--c-red)", color: "#fff" }}>{Icon.square({ s: 8 })} Stop</button>
                    </div>
                    <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--c-border-faint)", flex: 1, overflowY: "auto" }}>
                        <div className="label-xs" style={{ marginBottom: 8 }}>LIVE TRANSCRIPT</div>
                        {tr.slice(0, vis).map((l, i) => <div key={i} className="fade-in" style={{ marginBottom: 10, fontSize: 11, lineHeight: 1.5 }}>
                            <div style={{ color: "var(--c-blue)", fontWeight: 500, fontSize: 10, marginBottom: 2 }}>{l.speaker}</div>
                            <div>{l.text}</div>
                        </div>)}
                    </div>
                </div>}
                {state === "generating" && <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--c-text-mute)", fontSize: 12 }}>
                    <div style={{ margin: "0 auto 14px", width: 36, height: 36, borderRadius: 18, border: "2px solid var(--c-blue-200)", borderTopColor: "var(--c-blue)", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    Generating structured note…
                </div>}
                {state === "drafted" && <div style={{ padding: "12px 16px", borderTop: "0.5px solid #C4D9F0", background: "#EDF3FB", flex: 1 }}>
                    <div className="label-xs" style={{ color: "var(--c-blue-deep)", marginBottom: 8 }}>NOTE DRAFTED · AWAITING REVIEW</div>
                    <div style={{ background: "#fff", border: "0.5px solid #C4D9F0", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Chip tone="purple" size="sm">Oncology</Chip><div style={{ fontSize: 12, fontWeight: 500 }}>Day 14 Enzalutamide</div></div>
                        <div style={{ fontSize: 11, color: "var(--c-text-strong)", lineHeight: 1.5 }}>
                            <b>S:</b> Mild fatigue, 3 hot flashes/wk. <br />
                            <b>O:</b> PSA 16.2 (↓), Test {"<"} 50. Hgb 12.8.<br />
                            <b>A:</b> M0 CRPC, early response to Enza.<br />
                            <b>P:</b> Continue 160mg QD, recheck 4 wks.
                        </div>
                    </div>
                    <button className="btn btn-primary lg" style={{ width: "100%", marginBottom: 6 }} onClick={() => onNav("review")}>Review & sign →</button>
                </div>}
            </div>

            <div className="panel-main">
                <div style={{ minHeight: 44, padding: "8px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                    <span onClick={() => onNav("dashboard")} style={{ cursor: "pointer", fontSize: 12, color: "var(--c-text-mute)", display: "flex", alignItems: "center", gap: 4 }}>{Icon.chevLeft({ s: 12 })} Dashboard</span>
                    <span style={{ color: "var(--c-text-ghost)", margin: "0 8px" }}>/</span>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>James Park · Visit</span>
                </div>
                <div style={{ padding: "20px 24px" }}>
                    <div className="label-xs" style={{ marginBottom: 6 }}>VISIT · APR 17 · 09:00</div>
                    <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, letterSpacing: "-0.01em" }}>Follow-up · Day 14 of Enzalutamide</div>
                    <div style={{ fontSize: 13, color: "var(--c-text-mute)", marginBottom: 24, maxWidth: 560, lineHeight: 1.55 }}>OncoAssist preloads relevant oncology notes and surfaces the highest-impact questions for this visit.</div>
                    <div className="card" style={{ marginBottom: 18 }}>
                        <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", background: "var(--c-surface-alt)", fontWeight: 500, fontSize: 13, gap: 6 }}><span style={{ color: "var(--c-blue)" }}>{Icon.sparkle({ s: 12 })}</span>Smart steps · AI-suggested</div>
                        {[{ q: "Think through next steps for this patient", primary: true }, { q: "Compare today's PSA to the last 7 readings", tag: "Q1" }, { q: "Side-effect profile at Day 14 Enzalutamide", tag: "Q2" }].map((s, i) =>
                            <div key={i} style={{ borderTop: "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, background: s.primary ? "#F0F5FC" : "#fff" }}>
                                {s.primary ? <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--c-blue)" }} /> : <Chip tone="blue" size="xs">{s.tag}</Chip>}
                                <div style={{ flex: 1, fontSize: 13, color: s.primary ? "var(--c-blue-deep)" : "var(--c-text)", fontWeight: s.primary ? 500 : 400 }}>{s.q}</div>
                                <span className="micro" onClick={onEnterNotes}>Run →</span>
                            </div>)}
                    </div>
                </div>
            </div>
            {/* Adding Right Panel for Clinical Context */}
            <RightPanel tab={tab} onTab={setTab} />
        </div>
    </div>;
}
