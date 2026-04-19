import React, { useState } from "react";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";

export function ReviewScreen({ onNav }) {
    const [chk, setChk] = useState({ vitals: true, psa: true, sides: true, plan: true, meds: false, fu: false });
    const items = [{ k: "vitals", l: "Vitals reviewed" }, { k: "psa", l: "PSA result confirmed (16.2)" }, { k: "sides", l: "Side effects documented" }, { k: "plan", l: "Assessment & plan complete" }, { k: "meds", l: "Medication reconciliation" }, { k: "fu", l: "Follow-up scheduled" }];
    const done = Object.values(chk).filter(Boolean).length;

    return <div className="stage" data-screen-label="06 Review">
        <TopBar />
        <div className="screen-body">
            <div className="panel-left" style={{ width: 300 }}>
                <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span onClick={() => onNav("notes")} style={{ cursor: "pointer" }}>{Icon.chevLeft({ s: 14 })}</span>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Review & sign</div>
                </div>
                <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div className="avatar" style={{ background: "#C7D9EB", color: "var(--c-blue-deep)" }}>JP</div>
                        <div><div style={{ fontSize: 13, fontWeight: 500 }}>James Park</div><div style={{ fontSize: 10, color: "var(--c-text-faint)" }}>67M · MRN-003291</div></div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--c-text-mute)", lineHeight: 1.6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ color: "var(--c-text-faint)" }}>Visit</span><span>Apr 17 · 09:00</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ color: "var(--c-text-faint)" }}>Drafted</span><span>Ambience AI</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ color: "var(--c-text-faint)" }}>Signing</span><span style={{ color: "var(--c-blue)", fontWeight: 500 }}>Dr. I. Riaz</span></div>
                    </div>
                    <div className="label-xs" style={{ marginTop: 20, marginBottom: 10 }}>READING GUIDE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#D4E8F9", border: "0.5px solid var(--c-blue)" }} /><span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Ambience captured</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#FDF4E5", border: "0.5px solid var(--c-amber)" }} /><span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Fellow edited</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#fff", border: "0.5px dashed var(--c-border)" }} /><span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Auto-pulled</span></div>
                </div>
            </div>

            <div className="panel-main scroll" style={{ background: "var(--c-bg)", overflowY: "auto", padding: "24px 40px" }}>
                <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", border: "0.5px solid var(--c-border)", borderRadius: 10, padding: "36px 44px", fontSize: 13, lineHeight: 1.6 }}>
                    <div className="label-xs" style={{ marginBottom: 4 }}>CONSULTANT NOTE · ONCOLOGY</div>
                    <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>Follow-up · Day 14 Enzalutamide</div>
                    <div style={{ fontSize: 11, color: "var(--c-text-mute)", marginBottom: 20 }}>James Park · Apr 17, 2026 · Dr. I. Riaz</div>
                    <H>Interval history</H>
                    <p><Hl k="amb">Patient tolerating Enzalutamide 160mg QD. Mild fatigue, 3 hot flashes/week. No falls, no seizure activity.</Hl> <Hl k="edit">Denies bone pain or LUTS.</Hl></p>
                    <H>Results</H>
                    <p><Hl k="auto">PSA 16.2 ng/mL (Apr 17) — ↓ from 18.4. Testosterone {"<"} 50. Hgb 12.8. LH 0.8, FSH 1.4 (expected suppression).</Hl></p>
                    <H>Assessment</H>
                    <p><Hl k="amb">M0 CRPC, early biochemical response to Enzalutamide.</Hl> <Hl k="edit">12% PSA decline at Day 14 consistent with PCWG3 response.</Hl></p>
                    <H>Plan</H>
                    <ul style={{ paddingLeft: 20 }}>
                        <li><Hl k="amb">Continue Enzalutamide 160mg QD.</Hl></li>
                        <li><Hl k="edit">Recheck PSA + CBC in 4 weeks (May 15).</Hl></li>
                        <li><Hl k="edit">RTC Jun 12.</Hl></li>
                        <li><Hl k="auto">Counselled on fall + seizure precautions.</Hl></li>
                    </ul>
                </div>
            </div>

            <div className="panel-side" style={{ background: "#fff" }}>
                <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Review checklist</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--c-surface-alt)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${(done / items.length) * 100}%`, height: "100%", background: "var(--c-green)" }} /></div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--c-text-mute)" }}>{done}/{items.length}</span>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    {items.map(c => <div key={c.k} onClick={() => setChk(x => ({ ...x, [c.k]: !x[c.k] }))} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                        <span style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid " + (chk[c.k] ? "var(--c-green)" : "var(--c-border)"), background: chk[c.k] ? "var(--c-green)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{chk[c.k] && Icon.check({ s: 10 })}</span>
                        <span style={{ fontSize: 12 }}>{c.l}</span>
                    </div>)}
                </div>
                <div style={{ padding: "14px 16px", borderTop: "0.5px solid var(--c-border-faint)", display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn btn-primary lg" style={{ width: "100%", background: done === items.length ? "var(--c-green)" : "var(--c-blue)" }}>{Icon.check({ s: 14 })} Approve & Sign</button>
                    <button className="btn btn-ghost lg" style={{ width: "100%" }}>Return to Fellow</button>
                </div>
            </div>
        </div>
    </div>;
}

function H({ children }) { return <div className="label-xs" style={{ marginTop: 14, marginBottom: 4 }}>{children}</div>; }
function Hl({ k, children }) { const bg = k === "amb" ? "#E6F1FB" : k === "edit" ? "#FDF4E5" : "transparent"; if (k === "auto") return <span style={{ borderBottom: "1px dashed var(--c-border)" }}>{children}</span>; return <span style={{ background: bg, padding: "1px 3px", borderRadius: 2 }}>{children}</span>; }
