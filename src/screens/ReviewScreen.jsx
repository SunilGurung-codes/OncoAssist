import React, { useState, useRef } from "react";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { TextSelectionPopup } from "../components/ui/TextSelectionPopup.jsx";

// Note sections for timeline
const SECTIONS = [
    { id: "subj", label: "S \u2014 Subjective" },
    { id: "obj", label: "O \u2014 Objective" },
    { id: "ass", label: "A \u2014 Assessment" },
    { id: "plan", label: "P \u2014 Plan" },
];

const DEFAULT_NOTE = {
    subj: "Chief Complaint (CC): Follow-up on new ADT.\nHistory of Present Illness (HPI): Patient tolerating Enzalutamide 160mg QD. Denies bone pain or LUTS.\nDiagnosis (type, stage): Prostate adenocarcinoma, CRPC.\nDate of diagnosis: 2022\nCurrent treatment regimen: Enzalutamide\nCycle/day: Day 14\nSymptoms (onset, duration, severity): Mild fatigue, 3 hot flashes/week. No falls or seizure activity.\nFunctional status (e.g., ECOG): ECOG 0",
    obj: "Vitals: BP 122/78, HR 76, Temp 37.1\u00b0C, RR 16, SpO2 98%, Weight 84 kg\n\nPhysical Examination: General \u2014 Well-appearing, NAD. Cardiovascular \u2014 RRR. Respiratory \u2014 CTAB. Abdomen \u2014 Soft, non-tender. Extremities \u2014 No edema.\n\nLabs: CBC \u2014 Hgb 12.8 (L). CMP \u2014 WNL. Tumor markers \u2014 PSA 16.2 ng/mL (\u2193 from 18.4). Testosterone < 50 ng/dL. LH 0.8, FSH 1.4.\n\nImaging/Diagnostics: CT/MRI/PET \u2014 Stable. Pathology \u2014 N/A",
    ass: "Primary cancer diagnosis: Metastatic CRPC.\nStage: IV.\nTreatment response: Early PCWG3 biochemical response to Enzalutamide.\nToxicities / adverse effects: Mild fatigue and systemic flashes.\nComorbidities: None active.\n12% PSA decline at Day 14 consistent with PCWG3 response.",
    plan: "\u2022 Continue Enzalutamide 160mg QD.\n\u2022 Recheck PSA + CBC in 4 weeks (May 15).\n\u2022 RTC Jun 12.\n\u2022 Counselled on fall + seizure precautions.\n\u2022 Medications: Refill authorized.\n\u2022 Nutrition: Standard diet.\n\u2022 Psychosocial support: Coping well."
};

export function ReviewScreen({ onNav, theme, toggleTheme }) {
    const [note, setNote] = useState(DEFAULT_NOTE);
    const [activeSection, setActiveSection] = useState("subj");
    const sectionRefs = useRef({});

    // Floating edit toolbar state
    const [editMenuOpen, setEditMenuOpen] = useState(false);
    const [editAction, setEditAction] = useState(null);

    // OncoAssist ask bar
    const [askQuery, setAskQuery] = useState(null);
    const [askVisible, setAskVisible] = useState(false);

    const onExplaining = (msg) => { setAskQuery(msg); setAskVisible(true); };

    const navToSection = (id) => {
        const el = sectionRefs.current[id];
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); }
    };

    const handleEditAction = (action) => {
        setEditAction(action);
        setTimeout(() => setEditAction(null), 1500);
    };

    return (
        <div className="stage" data-screen-label="06 Canvas Editor">
            <TopBar theme={theme} toggleTheme={toggleTheme} />
            <div className="screen-body">

                {/* Left panel */}
                <div className="panel-left" style={{ width: 300, flexShrink: 0 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span onClick={() => onNav("initial")} style={{ cursor: "pointer", color: "var(--c-text-mute)" }}>{Icon.chevLeft({ s: 14 })}</span>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Canvas Editor</div>
                        <div style={{ flex: 1 }} />
                        <Chip tone="green" size="sm">Editing</Chip>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <div className="avatar" style={{ background: "var(--c-blue-200)", color: "var(--c-blue-deep)" }}>JP</div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>James Park</div>
                                <div style={{ fontSize: 13, color: "var(--c-text-mute)" }}>67M · MRN-003291</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--c-text-mute)", lineHeight: 1.65 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Visit</span><span>Apr 17 · 09:00</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Drafted</span><span>Ambience AI</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Signing</span><span style={{ color: "var(--c-blue)", fontWeight: 500 }}>Dr. I. Riaz</span></div>
                        </div>

                        {/* Section navigator */}
                        <div className="label-xs" style={{ marginTop: 20, marginBottom: 10 }}>SECTIONS</div>
                        {SECTIONS.map(s => (
                            <div key={s.id} onClick={() => navToSection(s.id)} style={{
                                padding: "8px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer",
                                background: s.id === activeSection ? "var(--c-blue-50)" : "transparent",
                                color: s.id === activeSection ? "var(--c-blue)" : "var(--c-text-mute)",
                                fontSize: 14, fontWeight: s.id === activeSection ? 600 : 500,
                                transition: "background 0.15s"
                            }}>
                                {s.label}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "0.5px solid var(--c-border-faint)", display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-primary lg" style={{ width: "100%" }} onClick={() => onNav("review")}>
                            {Icon.check({ s: 14 })} Review & Sign
                        </button>
                        <button className="btn btn-ghost lg" style={{ width: "100%" }} onClick={() => onNav("initial")}>
                            ← Back to Chat
                        </button>
                    </div>
                </div>

                {/* Centre: Canvas editor — full width, no right panel */}
                <div className="panel-main scroll" style={{ overflowY: "auto", padding: "32px 48px", position: "relative" }}>

                    {/* Ask OncoAssist response banner */}
                    {askVisible && (
                        <div style={{
                            margin: "0 auto 20px", padding: "12px 16px",
                            background: "var(--c-blue-50)", border: "0.5px solid var(--c-blue-250)",
                            borderRadius: 10, display: "flex", alignItems: "center", gap: 10
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                            </svg>
                            <div style={{ flex: 1, fontSize: 14, color: "var(--c-text-mute)", lineHeight: 1.5 }}>
                                <span style={{ fontWeight: 500, color: "var(--c-blue)" }}>OncoAssist:</span> {askQuery}
                            </div>
                            <span onClick={() => setAskVisible(false)} style={{ cursor: "pointer", fontSize: 14, color: "var(--c-text-ghost)" }}>{"\u2715"}</span>
                        </div>
                    )}

                    {/* Note card (with embedded timeline) + floating edit toolbar */}
                    <div style={{ display: "flex", gap: 16, width: "100%" }}>

                        {/* Editable note card with timeline inside */}
                        <div style={{
                            flex: 1, background: "var(--c-surface)", border: "0.5px solid var(--c-border)",
                            borderRadius: 12, padding: "40px 24px 40px 48px", fontSize: 14, lineHeight: 1.7,
                            display: "flex", gap: 20
                        }}>
                            {/* Note content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="label-xs" style={{ marginBottom: 4 }}>CONSULTANT NOTE · ONCOLOGY</div>
                                <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em" }}>Follow-up · Day 14 Enzalutamide</div>
                                <div style={{ fontSize: 14, color: "var(--c-text-mute)", marginBottom: 24 }}>James Park · Apr 17, 2026 · Dr. I. Riaz</div>

                                {SECTIONS.map(s => (
                                    <div key={s.id} ref={el => sectionRefs.current[s.id] = el} style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text-strong)", marginBottom: 8 }}>
                                            {s.label}
                                        </div>
                                        <textarea
                                            value={note[s.id]}
                                            onChange={e => setNote(n => ({ ...n, [s.id]: e.target.value }))}
                                            onFocus={() => setActiveSection(s.id)}
                                            style={{
                                                width: "100%", border: "none", outline: "none", resize: "none",
                                                background: "transparent", fontSize: 14, lineHeight: 1.7,
                                                color: "var(--c-text)", fontFamily: "inherit",
                                                minHeight: 80, overflow: "hidden"
                                            }}
                                            onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                                            ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Timeline scrubber — inside note card, right edge */}
                            <div style={{
                                width: 40, flexShrink: 0, position: "sticky", top: 40,
                                alignSelf: "flex-start", display: "flex", flexDirection: "column",
                                alignItems: "center", gap: 8, paddingTop: 60
                            }}>
                                <button
                                    onClick={() => { const idx = SECTIONS.findIndex(s => s.id === activeSection); if (idx > 0) navToSection(SECTIONS[idx - 1].id); }}
                                    disabled={activeSection === SECTIONS[0].id}
                                    style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: activeSection === SECTIONS[0].id ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                        border: "0.5px solid var(--c-border)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: activeSection === SECTIONS[0].id ? "default" : "pointer",
                                        color: activeSection === SECTIONS[0].id ? "var(--c-text-ghost)" : "var(--c-text-mute)"
                                    }}
                                    title="Previous section">
                                    <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                </button>

                                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", padding: "4px 0" }}>
                                    {SECTIONS.map(s => (
                                        <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                            <div
                                                onClick={() => navToSection(s.id)}
                                                title={s.label}
                                                style={{
                                                    width: s.id === activeSection ? 18 : 12,
                                                    height: 3,
                                                    borderRadius: 2,
                                                    background: s.id === activeSection ? "var(--c-blue)" : "var(--c-border)",
                                                    cursor: "pointer",
                                                    transition: "width 0.15s, background 0.15s"
                                                }}
                                            />
                                            {s.id === activeSection && (
                                                <div style={{ fontSize: 10, color: "var(--c-text-mute)", whiteSpace: "nowrap" }}>
                                                    {s.label.split(" \u2014 ")[0]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { const idx = SECTIONS.findIndex(s => s.id === activeSection); if (idx < SECTIONS.length - 1) navToSection(SECTIONS[idx + 1].id); }}
                                    disabled={activeSection === SECTIONS[SECTIONS.length - 1].id}
                                    style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: activeSection === SECTIONS[SECTIONS.length - 1].id ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                        border: "0.5px solid var(--c-border)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: activeSection === SECTIONS[SECTIONS.length - 1].id ? "default" : "pointer",
                                        color: activeSection === SECTIONS[SECTIONS.length - 1].id ? "var(--c-text-ghost)" : "var(--c-text-mute)"
                                    }}
                                    title="Next section">
                                    <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Floating edit sidebar (ChatGPT Canvas-style) */}
                        <div style={{
                            width: 48, flexShrink: 0, position: "sticky", top: 40,
                            alignSelf: "flex-start", display: "flex", flexDirection: "column",
                            alignItems: "center", gap: 0
                        }}>
                            <div
                                onClick={() => setEditMenuOpen(!editMenuOpen)}
                                style={{
                                    width: 44, height: 44, borderRadius: "50%",
                                    background: editMenuOpen ? "var(--c-blue)" : "var(--c-surface)",
                                    border: "0.5px solid var(--c-border)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: editMenuOpen ? "#fff" : "var(--c-text-mute)",
                                    transition: "all 0.2s"
                                }}
                                title="Suggest Edit"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    <path d="M9 11l3 3" strokeWidth="1.5" strokeDasharray="2 2" />
                                </svg>
                            </div>

                            {editMenuOpen && (
                                <div style={{
                                    marginTop: 8, background: "var(--c-surface)",
                                    border: "0.5px solid var(--c-border)", borderRadius: 14,
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                    padding: "8px 0", display: "flex", flexDirection: "column",
                                    alignItems: "center", gap: 2, overflow: "hidden",
                                    animation: "jumpIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
                                }}>
                                    <EditBtn
                                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>}
                                        label="Suggest edit" active={editAction === "suggest"} onClick={() => handleEditAction("suggest")}
                                    />
                                    <EditBtn
                                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>}
                                        label="Adjust length" active={editAction === "length"} onClick={() => handleEditAction("length")}
                                    />
                                    <EditBtn
                                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>}
                                        label="Reading level" active={editAction === "reading"} onClick={() => handleEditAction("reading")}
                                    />
                                    <EditBtn
                                        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                                        label="Final polish" active={editAction === "polish"} onClick={() => handleEditAction("polish")}
                                    />
                                    <style>{`@keyframes jumpIn { from { opacity: 0; transform: scale(0.92) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Text selection popup for tap-to-ask */}
            <TextSelectionPopup onExplaining={onExplaining} />
        </div>
    );
}

function EditBtn({ icon, label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            title={label}
            style={{
                width: 40, height: 40, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: active ? "var(--c-blue)" : "var(--c-text-mute)",
                background: active ? "var(--c-blue-50)" : "transparent",
                transition: "all 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = active ? "var(--c-blue-50)" : "transparent"}
        >
            {icon}
        </div>
    );
}
