import React, { useState, useRef } from "react";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { TextSelectionPopup } from "../components/ui/TextSelectionPopup.jsx";

// Note sections — used for both rendering and the timeline scrubber
const SECTIONS = [
    { id: "subj", label: "Subjective" },
    { id: "obj", label: "Objective" },
    { id: "ass", label: "Assessment" },
    { id: "plan", label: "Plan" },
];

export function ReviewScreen({ onNav, theme, toggleTheme }) {
    const [chk, setChk] = useState({ vitals: true, psa: true, sides: true, plan: true, meds: false, fu: false });
    const items = [
        { k: "vitals", l: "Vitals reviewed" },
        { k: "psa", l: "PSA result confirmed (16.2)" },
        { k: "sides", l: "Side effects documented" },
        { k: "plan", l: "Assessment & plan complete" },
        { k: "meds", l: "Medication reconciliation" },
        { k: "fu", l: "Follow-up scheduled" },
    ];
    const done = Object.values(chk).filter(Boolean).length;

    // Refs for timeline scroll navigation
    const sectionRefs = useRef({});
    const [activeSection, setActiveSection] = useState("subj");

    // Inline OncoAssist bar state (wired from TextSelectionPopup)
    const [askQuery, setAskQuery] = useState(null); // { word, question }
    const [askVisible, setAskVisible] = useState(false);

    const onExplaining = (msg) => {
        // msg arrives as `Regarding "word": question`
        setAskQuery(msg);
        setAskVisible(true);
    };

    const navToSection = (id) => {
        const el = sectionRefs.current[id];
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); }
    };

    return (
        <div className="stage" data-screen-label="06 Review">
            <TopBar theme={theme} toggleTheme={toggleTheme} />
            <div className="screen-body">

                {/* ── Left panel ── */}
                <div className="panel-left" style={{ width: 300, flexShrink: 0 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span onClick={() => onNav("initial")} style={{ cursor: "pointer", color: "var(--c-text-mute)" }}>{Icon.chevLeft({ s: 14 })}</span>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Review & sign</div>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div className="avatar" style={{ background: "var(--c-blue-200)", color: "var(--c-blue-deep)" }}>JP</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>James Park</div>
                                <div style={{ fontSize: 10, color: "var(--c-text-mute)" }}>67M · MRN-003291</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--c-text-mute)", lineHeight: 1.6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Visit</span><span>Apr 17 · 09:00</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Drafted</span><span>Ambience AI</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Signing</span><span style={{ color: "var(--c-blue)", fontWeight: 500 }}>Dr. I. Riaz</span></div>
                        </div>

                        <div className="label-xs" style={{ marginTop: 20, marginBottom: 10 }}>READING GUIDE</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--c-blue-200)", border: "0.5px solid var(--c-blue)" }} />
                            <span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Ambience captured</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--c-amber-100)", border: "0.5px solid var(--c-amber)" }} />
                            <span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Fellow edited</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--c-surface)", border: "0.5px dashed var(--c-border)" }} />
                            <span style={{ fontSize: 11, color: "var(--c-text-mute)" }}>Auto-pulled</span>
                        </div>
                    </div>
                </div>

                {/* ── Centre: note editor ── */}
                <div className="panel-main scroll" style={{ overflowY: "auto", padding: "24px 0" }}>
                    {/* Ask OncoAssist inline banner (shown after highlight → ask) */}
                    {askVisible && (
                        <div style={{
                            maxWidth: 720, margin: "0 auto 16px", padding: "10px 14px",
                            background: "var(--c-blue-50)", border: "0.5px solid var(--c-blue-250)",
                            borderRadius: 10, display: "flex", alignItems: "center", gap: 10
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                            </svg>
                            <div style={{ flex: 1, fontSize: 12, color: "var(--c-text-mute)" }}>
                                <span style={{ fontWeight: 500, color: "var(--c-blue)" }}>OncoAssist:</span> {askQuery}
                            </div>
                            <span onClick={() => setAskVisible(false)} style={{ cursor: "pointer", fontSize: 12, color: "var(--c-text-ghost)" }}>✕</span>
                        </div>
                    )}

                    {/* Note body + timeline scrubber side-by-side */}
                    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 40px", display: "flex", gap: 12 }}>

                        {/* Note card */}
                        <div style={{ flex: 1, background: "var(--c-surface)", border: "0.5px solid var(--c-border)", borderRadius: 10, padding: "36px 44px", fontSize: 13, lineHeight: 1.6 }}>
                            <div className="label-xs" style={{ marginBottom: 4 }}>CONSULTANT NOTE · ONCOLOGY</div>
                            <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>Follow-up · Day 14 Enzalutamide</div>
                            <div style={{ fontSize: 11, color: "var(--c-text-mute)", marginBottom: 20 }}>James Park · Apr 17, 2026 · Dr. I. Riaz</div>

                            <div ref={el => sectionRefs.current["subj"] = el}>
                                <H>Subjective</H>
                                <p><Hl k="amb">Patient tolerating Enzalutamide 160mg QD. Mild fatigue, 3 hot flashes/week. No falls, no seizure activity.</Hl> <Hl k="edit">Denies bone pain or LUTS.</Hl></p>
                            </div>

                            <div ref={el => sectionRefs.current["obj"] = el}>
                                <H>Objective</H>
                                <p><Hl k="auto">PSA 16.2 ng/mL (Apr 17) — ↓ from 18.4. Testosterone {"<"} 50. Hgb 12.8. LH 0.8, FSH 1.4 (expected suppression).</Hl></p>
                            </div>

                            <div ref={el => sectionRefs.current["ass"] = el}>
                                <H>Assessment</H>
                                <p><Hl k="amb">M0 CRPC, early biochemical response to Enzalutamide.</Hl> <Hl k="edit">12% PSA decline at Day 14 consistent with PCWG3 response.</Hl></p>
                            </div>

                            <div ref={el => sectionRefs.current["plan"] = el}>
                                <H>Plan</H>
                                <ul style={{ paddingLeft: 20 }}>
                                    <li><Hl k="amb">Continue Enzalutamide 160mg QD.</Hl></li>
                                    <li><Hl k="edit">Recheck PSA + CBC in 4 weeks (May 15).</Hl></li>
                                    <li><Hl k="edit">RTC Jun 12.</Hl></li>
                                    <li><Hl k="auto">Counselled on fall + seizure precautions.</Hl></li>
                                </ul>
                            </div>
                        </div>

                        {/* Note section timeline scrubber */}
                        <div style={{ width: 28, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 2 }}>
                            {/* Up */}
                            <button
                                onClick={() => { const idx = SECTIONS.findIndex(s => s.id === activeSection); if (idx > 0) navToSection(SECTIONS[idx - 1].id); }}
                                disabled={activeSection === SECTIONS[0].id}
                                style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: activeSection === SECTIONS[0].id ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                    border: "0.5px solid var(--c-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: activeSection === SECTIONS[0].id ? "default" : "pointer",
                                    color: activeSection === SECTIONS[0].id ? "var(--c-text-ghost)" : "var(--c-text-mute)",
                                    flexShrink: 0
                                }}
                                title="Previous section">
                                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </button>

                            {/* Section bars */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center", padding: "2px 0" }}>
                                {SECTIONS.map(s => (
                                    <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                        <div
                                            onClick={() => navToSection(s.id)}
                                            title={s.label}
                                            style={{
                                                width: s.id === activeSection ? 12 : 8,
                                                height: 3,
                                                borderRadius: 1.5,
                                                background: s.id === activeSection ? "var(--c-blue)" : "var(--c-border)",
                                                cursor: "pointer",
                                                transition: "width 0.15s, background 0.15s"
                                            }}
                                        />
                                        {s.id === activeSection && (
                                            <div style={{ fontSize: 8, color: "var(--c-text-mute)", whiteSpace: "nowrap" }}>{s.label}</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Down */}
                            <button
                                onClick={() => { const idx = SECTIONS.findIndex(s => s.id === activeSection); if (idx < SECTIONS.length - 1) navToSection(SECTIONS[idx + 1].id); }}
                                disabled={activeSection === SECTIONS[SECTIONS.length - 1].id}
                                style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: activeSection === SECTIONS[SECTIONS.length - 1].id ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                    border: "0.5px solid var(--c-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: activeSection === SECTIONS[SECTIONS.length - 1].id ? "default" : "pointer",
                                    color: activeSection === SECTIONS[SECTIONS.length - 1].id ? "var(--c-text-ghost)" : "var(--c-text-mute)",
                                    flexShrink: 0
                                }}
                                title="Next section">
                                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right: checklist panel ── */}
                <div className="panel-side" style={{ background: "var(--c-surface)" }}>
                    <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Review checklist</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <div style={{ flex: 1, height: 6, background: "var(--c-surface-alt)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${(done / items.length) * 100}%`, height: "100%", background: "var(--c-green)", transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--c-text-mute)" }}>{done}/{items.length}</span>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        {items.map(c => (
                            <div key={c.k} onClick={() => setChk(x => ({ ...x, [c.k]: !x[c.k] }))}
                                style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                                <span style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid " + (chk[c.k] ? "var(--c-green)" : "var(--c-border)"), background: chk[c.k] ? "var(--c-green)" : "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-surface)", transition: "background 0.15s" }}>
                                    {chk[c.k] && Icon.check({ s: 10 })}
                                </span>
                                <span style={{ fontSize: 12 }}>{c.l}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "14px 16px", borderTop: "0.5px solid var(--c-border-faint)", display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-primary lg" style={{ width: "100%", background: done === items.length ? "var(--c-green)" : "var(--c-blue)" }}>
                            {Icon.check({ s: 14 })} Approve & Sign
                        </button>
                        <button className="btn btn-ghost lg" style={{ width: "100%" }}>Return to Fellow</button>
                    </div>
                </div>
            </div>

            {/* Text selection popup — works everywhere on this screen */}
            <TextSelectionPopup onExplaining={onExplaining} />
        </div>
    );
}

function H({ children }) {
    return <div className="label-xs" style={{ marginTop: 14, marginBottom: 4 }}>{children}</div>;
}

function Hl({ k, children }) {
    if (k === "auto") return <span style={{ borderBottom: "1px dashed var(--c-border)" }}>{children}</span>;
    const bg = k === "amb" ? "var(--c-blue-150)" : "var(--c-amber-100)";
    const border = k === "amb" ? "var(--c-blue-250)" : "var(--c-amber-300)";
    return <span style={{ background: bg, borderBottom: `1px solid ${border}`, padding: "1px 3px", borderRadius: 2 }}>{children}</span>;
}
