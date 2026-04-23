import React, { useState, useEffect, useRef } from "react";
import { data } from "../data.js";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { TextSelectionPopup } from "../components/ui/TextSelectionPopup.jsx";
import { LeftPanel, RightPanel } from "../components/panels.jsx";
import { useDrop } from "../components/ui/useDrop.js";
import { Micro } from "../components/ui/Micro.jsx";

export function InitialScreen({ onNav, onEnterNotes, theme, toggleTheme }) {
    const [state, setState] = useState("ready");
    const [tab, setTab] = useState("Notes");
    const [lCol, setLCol] = useState(false);
    const [leftW, setLeftW] = useState(359);
    const [rCol, setRCol] = useState(false);
    const [rightW, setRightW] = useState(610);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [ctx, setCtx] = useState([]);
    const drop = useDrop(d => setCtx(c => [...c, { kind: d.kind, label: d.label }]));
    const ref = useRef(null);
    const msgRefs = useRef([]);
    const [activeMsg, setActiveMsg] = useState(0);
    const [editingIdx, setEditingIdx] = useState(null); // which message index is in canvas edit mode
    const [notes, setNotes] = useState(data.notes);
    useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
    useEffect(() => {
        // Track which message is most visible in the scroll area
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        const idx = msgRefs.current.indexOf(e.target);
                        if (idx !== -1) setActiveMsg(idx);
                    }
                });
            },
            { root: ref.current, threshold: 0.5 }
        );
        msgRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [messages]);
    const navTo = idx => {
        const el = msgRefs.current[idx];
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveMsg(idx); }
    };
    const navPrev = () => navTo(Math.max(0, activeMsg - 1));
    const navNext = () => navTo(Math.min(messages.length - 1, activeMsg + 1));
    const send = t => {
        if (!t.trim()) return; setMessages(m => [...m, { role: "user", text: t, t: "now" }]); setInput("");
        setTimeout(() => setMessages(m => [...m, { role: "ai", text: ans(t), t: "now", cites: [] }]), 500);
    };
    const [elapsed, setElapsed] = useState(0);
    const [vis, setVis] = useState(0);
    const tr = data.transcript;
    useEffect(() => { let id; if (state === "recording") id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, [state]);
    useEffect(() => { if (state !== "recording") return; const t = setInterval(() => setVis(v => Math.min(v + 1, tr.length)), 1500); return () => clearInterval(t); }, [state, tr]);
    useEffect(() => {
        if (state === "generating") {
            const t = setTimeout(() => {
                setState("drafted");
                const draftText = `**Oncology SOAP Note**\n\n` +
                    `**Patient Information**\nName: James Park\nMRN: 8820194\nDOB / Age: Oct 12, 1958 / 67\nSex: Male\nDate of Visit: Apr 17, 2026\nProvider: Dr. I. Riaz\n\n` +
                    `**S — Subjective**\nChief Complaint (CC): Follow-up on new ADT.\nHistory of Present Illness (HPI): Patient tolerating Enzalutamide 160mg QD. Denies bone pain or LUTS.\nDiagnosis (type, stage): Prostate adenocarcinoma, CRPC.\nDate of diagnosis: 2022\nCurrent treatment regimen: Enzalutamide\nCycle/day: Day 14\nSymptoms (onset, duration, severity): Mild fatigue, 3 hot flashes/week. No falls or seizure activity.\nFunctional status (e.g., ECOG): ECOG 0\n\nReview of Systems (ROS):\nConstitutional: Endorses fatigue.\nHEENT: Unremarkable.\nCardiovascular: Negative.\nRespiratory: Negative.\nGastrointestinal: Negative.\nGenitourinary: Normal.\nMusculoskeletal: Negative for bone pain.\nNeurologic: No seizure activity.\nPsychiatric: Normal.\nMedications: Enzalutamide 160mg QD, Leuprolide.\nAllergies: NKDA\n\n` +
                    `**O — Objective**\nVitals:\nBP: 122/78\nHR: 76\nTemp: 37.1 C\nRR: 16\nSpO2: 98%\nWeight: 84 kg\n\nPhysical Examination:\nGeneral: Well-appearing, NAD.\nHEENT: WNL\nCardiovascular: RRR.\nRespiratory: CTAB.\nAbdomen: Soft, non-tender.\nExtremities: No edema.\nSkin: Warm, dry.\nNeurologic: Alert and oriented.\n\nLabs:\nCBC: Hgb 12.8 (L)\nCMP: WNL\nTumor markers: PSA 16.2 ng/mL (Apparent decrease from 18.4)\n\nImaging/Diagnostics:\nCT/MRI/PET: Stable.\nPathology: N/A\n\n` +
                    `**A — Assessment**\nPrimary cancer diagnosis: Metastatic CRPC.\nStage: IV.\nTreatment response: Early PCWG3 biochemical response to Enzalutamide.\nToxicities / adverse effects: Mild fatigue and systemic flashes.\nComorbidities: None active.\n\n` +
                    `**P — Plan**\nTreatment Plan:\nContinue / modify / hold therapy: Continue Enzalutamide 160mg QD.\nNext cycle: Continuous.\nMedications: Refill authorized.\n\nMonitoring:\nLabs: Recheck PSA + CBC in 4 weeks (May 15).\nImaging: None currently.\n\nSupportive Care:\nPain management: N/A\nNutrition: Standard diet.\nPsychosocial support: Coping well.\n\nFollow-Up:\nNext visit: June 12.\nReferrals: N/A\n\n**Notes:**\nECOG Performance Status: 0\nAdvance directives discussed: No changes.`;
                setMessages(m => [...m, { role: "ai", text: draftText, t: "now", cites: [] }]);
            }, 2200);
            return () => clearTimeout(t);
        }
    }, [state]);
    const fmt = s => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const start = () => { setElapsed(0); setVis(0); setState("recording"); };
    const getDraftMessageIndex = React.useCallback(() => messages.map((m, i) => ({ m, i })).filter(({ m }) => m.role === "ai" && m.text.includes("**Oncology SOAP Note**")).at(-1)?.i ?? null, [messages]);
    const toDraftPreview = (text) => {
        const clean = text
            .replace(/\*\*/g, "")
            .replace(/\n+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return clean.slice(0, 110) + (clean.length > 110 ? "…" : "");
    };
    const buildDraftNote = React.useCallback((text) => ({
        id: "draft-note",
        dept: "Oncology",
        type: "Follow-up · Day 14 Enzalutamide",
        author: "Dr. I. Riaz",
        date: "Today · Draft",
        status: "Draft",
        pinned: true,
        preview: toDraftPreview(text),
    }), []);
    const draftMessageIndex = getDraftMessageIndex();
    const currentDraftNote = draftMessageIndex !== null ? buildDraftNote(messages[draftMessageIndex].text) : null;
    const openCurrentDraft = React.useCallback(() => {
        const idx = getDraftMessageIndex();
        if (idx === null) return;
        setEditingIdx(idx);
        requestAnimationFrame(() => navTo(idx));
    }, [getDraftMessageIndex]);
    const addOrUpdateDraftNote = React.useCallback((draftText) => {
        const nextDraft = buildDraftNote(draftText);
        setNotes(existing => {
            const hasDraft = existing.some(n => n.id === nextDraft.id);
            return hasDraft
                ? existing.map(n => n.id === nextDraft.id ? { ...n, ...nextDraft } : n)
                : [nextDraft, ...existing];
        });
    }, [buildDraftNote]);
    const addCurrentDraftToNotes = React.useCallback(() => {
        const idx = getDraftMessageIndex();
        if (idx === null) return;
        addOrUpdateDraftNote(messages[idx].text);
    }, [addOrUpdateDraftNote, getDraftMessageIndex, messages]);

    return <div className="stage" data-screen-label="02 Initial · Ambience">
        <TopBar theme={theme} toggleTheme={toggleTheme} />
        <div className="screen-body">
            <LeftPanel collapsed={lCol} onToggle={() => setLCol(!lCol)} width={leftW} state={state} draftNote={currentDraftNote} onContinueDraft={openCurrentDraft} onAddDraftToNotes={addCurrentDraftToNotes} />
            {!lCol && <Resizer onPosChange={x => setLeftW(Math.max(260, Math.min(800, x)))} />}

            <div className="panel-main">
                <div style={{ minHeight: 44, padding: "8px 28px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                    <span onClick={() => onNav("dashboard")} style={{ cursor: "pointer", fontSize: 13, color: "var(--c-text-mute)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>{Icon.chevLeft({ s: 12 })} Dashboard</span>
                    <span style={{ color: "var(--c-text-ghost)", margin: "0 8px" }}>/</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>James Park · Visit</span>
                </div>
                <div className="scroll" ref={ref} style={{ padding: "20px 36px", flex: 1, overflowY: "auto" }}>
                    <div className="label-xs" style={{ marginBottom: 6 }}>VISIT · APR 17 · 09:00</div>
                    <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, letterSpacing: "-0.01em" }}>Follow-up · Day 14 of Enzalutamide</div>
                    <div style={{ fontSize: 14, color: "var(--c-text-mute)", marginBottom: 24, maxWidth: 560, lineHeight: 1.6 }}>OncoAssist preloads relevant oncology notes and surfaces the highest-impact questions for this visit.</div>

                    {/* Ambient Controls */}
                    {state === "ready" && <div style={{ marginBottom: 18, border: "0.5px solid var(--c-red-300)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-surface)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-red)" }} /><span className="label-xs" style={{ color: "var(--c-red-deep)" }}>AMBIENT · READY</span></div>
                            <button onClick={start} className="btn sm" style={{ background: "var(--c-red)", color: "var(--c-surface)" }}>Start recording</button>
                        </div>
                    </div>}

                    {state === "recording" && <div style={{ marginBottom: 18, border: "0.5px solid var(--c-red-300)", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "12px 14px", background: "var(--c-red-100)", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span className="pulse-red" style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-red)" }} />
                                <span className="label-xs" style={{ color: "var(--c-red-deep)" }}>RECORDING · {fmt(elapsed)}</span>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                                    {Array.from({ length: 8 }).map((_, i) => <span key={i} className="wave-bar" style={{ width: 3, background: "var(--c-red)", height: Math.abs(Math.sin(i * 0.6 + elapsed * 0.8) * 10) + 4 + "px", animation: `wave ${0.8 + (i % 4) * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.05}s` }} />)}
                                </div>
                            </div>
                            <button onClick={() => setState("generating")} className="btn sm" style={{ background: "var(--c-red)", color: "var(--c-surface)" }}>{Icon.square({ s: 8 })} Stop</button>
                        </div>
                        <div className="scroll" style={{ maxHeight: 180, overflowY: "auto", padding: "12px 16px", background: "var(--c-surface)" }}>
                            <div className="label-xs" style={{ marginBottom: 8 }}>LIVE TRANSCRIPT</div>
                            {tr.slice(0, vis).map((l, i) => <div key={i} className="fade-in" style={{ marginBottom: 10, fontSize: 12, lineHeight: 1.55 }}>
                                <div style={{ color: "var(--c-blue-deep)", fontWeight: 600, fontSize: 11, marginBottom: 2 }}>{l.speaker}</div>
                                <div>{l.text}</div>
                            </div>)}
                        </div>
                    </div>}

                    {state === "generating" && <div style={{ marginBottom: 18, border: "0.5px solid var(--c-blue-250)", borderRadius: 10, padding: "32px 16px", textAlign: "center", color: "var(--c-text-mute)", fontSize: 13 }}>
                        <div style={{ margin: "0 auto 14px", width: 36, height: 36, borderRadius: 18, border: "2px solid var(--c-blue-200)", borderTopColor: "var(--c-blue)", animation: "spin 1s linear infinite" }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        Generating structured note…
                    </div>}

                    {state === "drafted" && <div style={{ marginBottom: 18, border: "0.5px solid var(--c-blue-250)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: "var(--c-blue-100)" }}>
                            <div className="label-xs" style={{ color: "var(--c-blue-deep)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>NOTE DRAFTED · MATCHES TEMPLATE</span>
                                <button className="btn btn-primary sm" onClick={() => onNav("review")}>Review & sign →</button>
                            </div>
                            <div style={{ background: "var(--c-surface)", border: "0.5px solid var(--c-blue-250)", borderRadius: 10, padding: "12px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Chip tone="purple" size="sm">Oncology</Chip><div style={{ fontSize: 13, fontWeight: 600 }}>Day 14 Enzalutamide</div></div>
                                <div style={{ fontSize: 12, color: "var(--c-text-strong)", lineHeight: 1.55, maxHeight: 72, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", whiteSpace: "pre-wrap" }}>
                                    {messages.find(m => m.role === "ai" && m.text.includes("**Oncology SOAP Note**"))?.text.substring(0, 160) || "Review full note structure..."}
                                </div>
                            </div>
                        </div>
                    </div>}
                    <div className="card" style={{ marginBottom: 18 }}>
                        <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", background: "var(--c-surface-alt)", fontWeight: 500, fontSize: 13, gap: 6 }}><span style={{ color: "var(--c-blue)" }}>{Icon.sparkle({ s: 12 })}</span>Smart steps · AI-suggested</div>
                        {[{ q: "Think through next steps for this patient", primary: true }, { q: "Compare today's PSA to the last 7 readings", tag: "Q1" }, { q: "Side-effect profile at Day 14 Enzalutamide", tag: "Q2" }].map((s, i) =>
                            <div key={i} className="note-row" onClick={() => send(s.q)} style={{ borderTop: "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, background: s.primary ? "var(--c-blue-50)" : "var(--c-surface)", cursor: "pointer" }}>
                                {s.primary ? <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--c-blue)" }} /> : <Chip tone="blue" size="xs">{s.tag}</Chip>}
                                <div style={{ flex: 1, fontSize: 13, color: s.primary ? "var(--c-blue-deep)" : "var(--c-text)", fontWeight: s.primary ? 500 : 400 }}>{s.q}</div>
                                <span className="micro">Ask →</span>
                            </div>)}
                    </div>

                    {/* Inline chat input when no messages (appears right after Smart Steps) */}
                    {messages.length === 0 && <ChatInput input={input} setInput={setInput} send={send} ctx={ctx} setCtx={setCtx} drop={drop} Icon={Icon} />}

                    <div style={{ width: "100%", margin: "0 auto", padding: "0 0", display: "flex", gap: 0, position: "relative" }}>

                        {/* Chat messages column */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {messages.map((m, i) => m.role === "user" ?
                                <div key={i} ref={el => msgRefs.current[i] = el} className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                                    <div style={{ maxWidth: "74%", background: "var(--c-surface-alt)", padding: "10px 14px", borderRadius: "10px 10px 0 10px", fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                                </div>
                                : editingIdx === i ?
                                    <InlineSoapEditor key={i} ref={el => msgRefs.current[i] = el} text={m.text} onClose={() => setEditingIdx(null)} onSave={newText => {
                                        setMessages(ms => ms.map((mm, j) => j === i ? { ...mm, text: newText } : mm));
                                        if (notes.some(n => n.id === "draft-note") || i === draftMessageIndex) addOrUpdateDraftNote(newText);
                                        setEditingIdx(null);
                                    }} />
                                    : <div key={i} ref={el => msgRefs.current[i] = el} className="fade-in" style={{ marginBottom: 14 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Chip tone="blue-solid" size="sm">OncoAssist</Chip><span style={{ fontSize: 11, color: "var(--c-text-ghost)" }}>Apr 17 · {m.t}</span></div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.text}</div>
                                        {m.cites && <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-blue-deep)", display: "flex", gap: 4, flexWrap: "wrap" }}>{m.cites.map((c, j) => <span key={j}>[{c}]</span>)}</div>}
                                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}><Micro icon={Icon.copy({ s: 10 })}>Copy</Micro><Micro icon={Icon.edit({ s: 10 })} onClick={() => setEditingIdx(i)}>Edit</Micro><Micro icon={Icon.plus({ s: 10 })} onClick={() => addOrUpdateDraftNote(m.text)}>Add to Note</Micro></div>
                                    </div>
                            )}
                        </div>

                        {/* Grok-style interactive timeline scrubber — sticky-centered in right gutter */}
                        {messages.length > 0 && editingIdx === null && (
                            <div style={{ width: 60, flexShrink: 0, alignSelf: "stretch", position: "relative", marginLeft: 24 }}>
                                <div style={{
                                    position: "sticky",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 0"
                                }}>

                                    {/* Up arrow — previous response */}
                                    <button
                                        onClick={navPrev}
                                        disabled={activeMsg === 0}
                                        style={{
                                            width: 26, height: 26, borderRadius: "50%",
                                            background: activeMsg === 0 ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                            border: "0.5px solid var(--c-border)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: activeMsg === 0 ? "default" : "pointer",
                                            flexShrink: 0, color: activeMsg === 0 ? "var(--c-text-ghost)" : "var(--c-text-mute)",
                                            transition: "opacity 0.15s"
                                        }}
                                        title="Previous response">
                                        <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                    </button>

                                    {/* Bars — one per message */}
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", padding: "4px 0", minHeight: 0 }}>
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                onClick={() => navTo(i)}
                                                title={m.role === "user" ? "Your message" : `OncoAssist · ${m.t || ""}`}
                                                style={{
                                                    width: i === activeMsg ? 18 : (m.role === "user" ? 10 : 14),
                                                    height: 3,
                                                    borderRadius: 2,
                                                    background: i === activeMsg
                                                        ? "var(--c-blue)"
                                                        : m.role === "user"
                                                            ? "var(--c-text-ghost)"
                                                            : "var(--c-border)",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                    transition: "width 0.15s, background 0.15s"
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Down arrow — next response */}
                                    <button
                                        onClick={navNext}
                                        disabled={activeMsg === messages.length - 1}
                                        style={{
                                            width: 26, height: 26, borderRadius: "50%",
                                            background: activeMsg === messages.length - 1 ? "var(--c-border-faint)" : "var(--c-surface-alt)",
                                            border: "0.5px solid var(--c-border)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: activeMsg === messages.length - 1 ? "default" : "pointer",
                                            flexShrink: 0, color: activeMsg === messages.length - 1 ? "var(--c-text-ghost)" : "var(--c-text-mute)",
                                            transition: "opacity 0.15s"
                                        }}
                                        title="Next response">
                                        <svg width="12" height="12" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>{/* end flex row */}
                </div>{/* end scroll container */}

                {/* Highlight tool bounds to DOM selection natively! */}
                <TextSelectionPopup onExplaining={t => send(`Explain or search details regarding: "${t}"`)} />

                {/* Bottom-pinned chat input — only when messages exist */}
                {messages.length > 0 && <ChatInput input={input} setInput={setInput} send={send} ctx={ctx} setCtx={setCtx} drop={drop} Icon={Icon} />}

            </div>
            {!rCol && <Resizer onPosChange={x => setRightW(Math.max(260, Math.min(800, window.innerWidth - x)))} />}
            {/* Adding Right Panel for Clinical Context */}
            <RightPanel tab={tab} onTab={setTab} collapsed={rCol} onToggle={() => setRCol(!rCol)} onAddToChat={obj => setCtx(c => [...c, { kind: obj.kind, label: obj.label }])} width={rightW} notes={notes} />
        </div>
    </div>;
}

function ChatInput({ input, setInput, send, ctx, setCtx, drop, Icon }) {
    return (
        <div {...drop.props} className={drop.over ? "drop-active" : ""} style={{ marginTop: 18, borderTop: "0.5px solid var(--c-border-faint)", background: "var(--c-surface)", zIndex: 10, borderRadius: 12 }}>
            <div style={{ width: "100%", margin: "0 auto", paddingTop: 6 }}>
                <div style={{ padding: "10px 28px 10px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minHeight: 44 }}>
                    <span style={{ fontSize: 13, color: "var(--c-text-soft)" }}>Context:</span>
                    {ctx.map((c, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, fontSize: 12, background: c.kind === "note" ? "var(--c-blue-100)" : "var(--c-surface-alt)", border: "0.5px solid " + (c.kind === "note" ? "var(--c-blue-250)" : "var(--c-border)"), color: "var(--c-text-mute)" }}>
                        {c.kind === "note" ? Icon.file({ s: 10 }) : Icon.lab({ s: 10 })}{c.label}
                        <span onClick={() => setCtx(a => a.filter((_, j) => j !== i))} style={{ cursor: "pointer" }}>{Icon.x({ s: 9 })}</span>
                    </span>)}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, fontSize: 12, background: "transparent", border: "0.5px dashed var(--c-border)", color: "var(--c-text-mute)", cursor: "pointer" }}>{Icon.plus({ s: 10 })} Add context</span>
                </div>
                <div style={{ margin: "0 28px 16px", borderRadius: 10, background: "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--c-text-mute)" }}>{Icon.paperclip({ s: 14 })}</span>
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Ask anything or drag a note here" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14 }} />
                        <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-mute)", cursor: "pointer" }}>{Icon.mic({ s: 16 })}</div>
                        <div onClick={() => send(input)} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-blue)", color: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{Icon.send({ s: 14 })}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Resizer({ onPosChange }) {
    const handleMouseDown = (e) => {
        e.preventDefault();
        const handleMouseMove = (moveEvent) => {
            onPosChange(moveEvent.clientX);
        };
        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "default";
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "col-resize";
    };
    return (
        <div className="resizer" onMouseDown={handleMouseDown} style={{ width: 8, margin: "0 -4px", zIndex: 50, cursor: "col-resize", position: "relative" }}>
            <div style={{ position: "absolute", left: 3, top: 0, bottom: 0, width: 2, background: "transparent", transition: "background 0.2s" }} className="resizer-bar" />
        </div>
    );
}

function ans(q) {
    const l = q.toLowerCase();
    if (l.includes("monitor") || l.includes("cadence")) return `Recommended monitoring on Enzalutamide:\n\u2022 PSA + testosterone q4-8 wk for first 6 mo, then q3 mo\n\u2022 CBC + LFTs q3 mo\n\u2022 BP at each visit\n\u2022 Fall + seizure screen at each visit\n\nFor this patient: Day 14 drop is a strong early signal. 4-week recheck (May 15) is appropriate.`;
    if (l.includes("dose") || l.includes("lh")) return `Suppressed LH/FSH reflect Leuprolide (GnRH agonist) \u2014 expected, not reason to adjust Enzalutamide.\n\nTarget is castrate T < 50 ng/dL, achieved. No dose change indicated.`;
    return `Yes \u2014 a PSA decline of 18.4 \u2192 16.2 (~12%) at Day 14 meets early PSA response criteria per PCWG3. Castrate testosterone maintained, no new symptoms, no radiographic progression. Continue regimen; recheck 4 weeks.`;
}

// Parse SOAP note text into sections
function parseNoteToSections(text) {
    const sections = { subj: "", obj: "", ass: "", plan: "" };
    const sMatch = text.match(/\*\*S \u2014 Subjective\*\*([\s\S]*?)(?=\*\*O \u2014 Objective\*\*|$)/);
    const oMatch = text.match(/\*\*O \u2014 Objective\*\*([\s\S]*?)(?=\*\*A \u2014 Assessment\*\*|$)/);
    const aMatch = text.match(/\*\*A \u2014 Assessment\*\*([\s\S]*?)(?=\*\*P \u2014 Plan\*\*|$)/);
    const pMatch = text.match(/\*\*P \u2014 Plan\*\*([\s\S]*?)(?=\*\*Notes:\*\*|$)/);
    if (sMatch) sections.subj = sMatch[1].trim();
    if (oMatch) sections.obj = oMatch[1].trim();
    if (aMatch) sections.ass = aMatch[1].trim();
    if (pMatch) sections.plan = pMatch[1].trim();
    // Fallback: if no sections found, put entire text in subj
    if (!sMatch && !oMatch && !aMatch && !pMatch) sections.subj = text;
    return sections;
}

const SOAP_SECTIONS = [
    { id: "subj", label: "S \u2014 Subjective" },
    { id: "obj", label: "O \u2014 Objective" },
    { id: "ass", label: "A \u2014 Assessment" },
    { id: "plan", label: "P \u2014 Plan" },
];

const InlineSoapEditor = React.forwardRef(function InlineSoapEditor({ text, onClose, onSave }, outerRef) {
    const [note, setNote] = React.useState(() => parseNoteToSections(text));
    const [activeSection, setActiveSection] = React.useState("subj");
    const [editMenuOpen, setEditMenuOpen] = React.useState(false);
    const [editAction, setEditAction] = React.useState(null);
    const sectionRefs = React.useRef({});
    const originalNote = React.useRef(parseNoteToSections(text));
    const changedSections = SOAP_SECTIONS.filter(s => note[s.id] !== originalNote.current[s.id]);

    const navToSection = (id) => {
        const el = sectionRefs.current[id];
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); }
    };
    const handleEditAction = (action) => { setEditAction(action); setTimeout(() => setEditAction(null), 1500); };
    const handleSave = () => {
        // Reconstruct the full text
        const out = `**Oncology SOAP Note**\n\n**S \u2014 Subjective**\n${note.subj}\n\n**O \u2014 Objective**\n${note.obj}\n\n**A \u2014 Assessment**\n${note.ass}\n\n**P \u2014 Plan**\n${note.plan}`;
        onSave(out);
    };

    return (
        <div ref={outerRef} className="fade-in" style={{ marginBottom: 14, display: "flex", gap: 18, alignItems: "flex-start" }}>
            {/* Note card */}
            <div style={{
                flex: 1, background: "var(--c-surface)", border: "1px solid var(--c-blue-250)",
                borderRadius: 12, padding: "28px 20px 28px 36px", fontSize: 14, lineHeight: 1.7
            }}>
                {/* Editable content */}
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-blue)" }} />
                            <span className="label-xs" style={{ color: "var(--c-blue)" }}>CANVAS EDIT MODE</span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-primary sm" onClick={handleSave}>Save</button>
                            <button className="btn btn-ghost sm" onClick={onClose}>Close</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20, padding: "14px 16px", borderRadius: 10, background: "var(--c-surface-alt)", border: "0.5px solid var(--c-border-faint)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: changedSections.length > 0 ? 12 : 0 }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-strong)", marginBottom: 2 }}>Edit review</div>
                                <div style={{ fontSize: 12, color: "var(--c-text-mute)", lineHeight: 1.45 }}>
                                    {changedSections.length > 0
                                        ? `You changed ${changedSections.length} section${changedSections.length > 1 ? "s" : ""} in this note.`
                                        : "No edits yet. Changes will appear here before you leave edit mode."}
                                </div>
                            </div>
                            {changedSections.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 6 }}>
                                    {changedSections.map(s => (
                                        <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, background: "var(--c-blue-50)", border: "0.5px solid var(--c-blue-250)", color: "var(--c-blue-deep)", fontSize: 11, fontWeight: 600 }}>
                                            {s.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {changedSections.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {changedSections.map(s => (
                                    <div key={s.id} style={{ borderRadius: 10, background: "var(--c-surface)", border: "0.5px solid var(--c-border)", overflow: "hidden" }}>
                                        <div style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-strong)" }}>{s.label}</div>
                                            <button className="micro" onClick={() => setNote(n => ({ ...n, [s.id]: originalNote.current[s.id] }))}>Reset section</button>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                                            <DiffBlock
                                                title="Before"
                                                tone="neutral"
                                                text={originalNote.current[s.id]}
                                                compareText={note[s.id]}
                                                mode="before"
                                            />
                                            <DiffBlock
                                                title="After"
                                                tone="blue"
                                                text={note[s.id]}
                                                compareText={originalNote.current[s.id]}
                                                mode="after"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {SOAP_SECTIONS.map(s => (
                        <div key={s.id} ref={el => sectionRefs.current[s.id] = el} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-strong)", marginBottom: 4 }}>{s.label}</div>
                            <textarea
                                value={note[s.id]}
                                onChange={e => setNote(n => ({ ...n, [s.id]: e.target.value }))}
                                onFocus={() => setActiveSection(s.id)}
                                style={{
                                    width: "100%", border: "none", outline: "none", resize: "none",
                                    background: "transparent", fontSize: 13, lineHeight: 1.65,
                                    color: "var(--c-text)", fontFamily: "inherit",
                                    minHeight: 60, overflow: "hidden"
                                }}
                                onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                                ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky edit rail */}
            <div style={{ width: 72, flexShrink: 0, alignSelf: "stretch", position: "relative", marginRight: 4 }}>
                <div style={{
                    position: "sticky",
                    top: 88,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    maxHeight: "calc(100vh - 220px)"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <button onClick={() => { const idx = SOAP_SECTIONS.findIndex(s => s.id === activeSection); if (idx > 0) navToSection(SOAP_SECTIONS[idx - 1].id); }}
                            disabled={activeSection === SOAP_SECTIONS[0].id}
                            style={{ width: 28, height: 28, borderRadius: "50%", background: activeSection === SOAP_SECTIONS[0].id ? "var(--c-border-faint)" : "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: activeSection === SOAP_SECTIONS[0].id ? "default" : "pointer", color: activeSection === SOAP_SECTIONS[0].id ? "var(--c-text-ghost)" : "var(--c-text-mute)" }}>
                            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                        <div style={{ padding: "10px 0", background: "var(--c-surface)", border: "0.5px solid var(--c-border)", borderRadius: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 36 }}>
                            {SOAP_SECTIONS.map(s => (
                                <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                    <div onClick={() => navToSection(s.id)} title={s.label}
                                        style={{ width: s.id === activeSection ? 18 : 10, height: 3, borderRadius: 2, background: s.id === activeSection ? "var(--c-blue)" : "var(--c-border)", cursor: "pointer", transition: "width 0.15s, background 0.15s" }} />
                                    {s.id === activeSection && (
                                        <div style={{ fontSize: 10, color: "var(--c-text-mute)", whiteSpace: "nowrap", lineHeight: 1 }}>
                                            {s.label.split(" — ")[0]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { const idx = SOAP_SECTIONS.findIndex(s => s.id === activeSection); if (idx < SOAP_SECTIONS.length - 1) navToSection(SOAP_SECTIONS[idx + 1].id); }}
                            disabled={activeSection === SOAP_SECTIONS[SOAP_SECTIONS.length - 1].id}
                            style={{ width: 28, height: 28, borderRadius: "50%", background: activeSection === SOAP_SECTIONS[SOAP_SECTIONS.length - 1].id ? "var(--c-border-faint)" : "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: activeSection === SOAP_SECTIONS[SOAP_SECTIONS.length - 1].id ? "default" : "pointer", color: activeSection === SOAP_SECTIONS[SOAP_SECTIONS.length - 1].id ? "var(--c-text-ghost)" : "var(--c-text-mute)" }}>
                            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                        <div onClick={() => setEditMenuOpen(!editMenuOpen)}
                            style={{ width: 44, height: 44, borderRadius: "50%", background: editMenuOpen ? "var(--c-blue)" : "var(--c-surface)", border: "0.5px solid var(--c-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: editMenuOpen ? "#fff" : "var(--c-text-mute)", transition: "all 0.2s" }}
                            title="Edit tools">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </div>
                        {editMenuOpen && (
                            <div style={{ marginTop: 6, background: "var(--c-surface)", border: "0.5px solid var(--c-border)", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                <InlineEditBtn label="Suggest edit" active={editAction === "suggest"} onClick={() => handleEditAction("suggest")}
                                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>} />
                                <InlineEditBtn label="Adjust length" active={editAction === "length"} onClick={() => handleEditAction("length")}
                                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>} />
                                <InlineEditBtn label="Reading level" active={editAction === "reading"} onClick={() => handleEditAction("reading")}
                                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>} />
                                <InlineEditBtn label="Final polish" active={editAction === "polish"} onClick={() => handleEditAction("polish")}
                                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

function InlineEditBtn({ icon, label, active, onClick }) {
    return (
        <div onClick={onClick} title={label}
            style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: active ? "var(--c-blue)" : "var(--c-text-mute)", background: active ? "var(--c-blue-50)" : "transparent", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = active ? "var(--c-blue-50)" : "transparent"}>
            {icon}
        </div>
    );
}

function tokenizeDiffText(text) {
    return (text || "").match(/\S+|\s+/g) || [];
}

function buildDiffParts(sourceText, compareText, mode) {
    const source = tokenizeDiffText(sourceText);
    const compare = tokenizeDiffText(compareText);
    const dp = Array.from({ length: source.length + 1 }, () => Array(compare.length + 1).fill(0));

    for (let i = source.length - 1; i >= 0; i -= 1) {
        for (let j = compare.length - 1; j >= 0; j -= 1) {
            dp[i][j] = source[i] === compare[j]
                ? dp[i + 1][j + 1] + 1
                : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const parts = [];
    let i = 0;
    let j = 0;

    while (i < source.length && j < compare.length) {
        if (source[i] === compare[j]) {
            parts.push({ text: source[i], changed: false });
            i += 1;
            j += 1;
            continue;
        }

        if (dp[i + 1][j] >= dp[i][j + 1]) {
            if (mode === "before") parts.push({ text: source[i], changed: !/^\s+$/.test(source[i]) });
            i += 1;
        } else {
            if (mode === "after") parts.push({ text: compare[j], changed: !/^\s+$/.test(compare[j]) });
            j += 1;
        }
    }

    while (i < source.length) {
        if (mode === "before") parts.push({ text: source[i], changed: !/^\s+$/.test(source[i]) });
        i += 1;
    }

    while (j < compare.length) {
        if (mode === "after") parts.push({ text: compare[j], changed: !/^\s+$/.test(compare[j]) });
        j += 1;
    }

    return parts;
}

function DiffBlock({ title, tone, text, compareText = "", mode = "after" }) {
    const isBlue = tone === "blue";
    const parts = buildDiffParts(mode === "before" ? text : compareText, mode === "before" ? compareText : text, mode);
    return (
        <div style={{
            padding: "12px 14px",
            background: isBlue ? "var(--c-blue-50)" : "var(--c-surface)",
            borderLeft: isBlue ? "0.5px solid var(--c-blue-250)" : "none"
        }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: isBlue ? "var(--c-blue-deep)" : "var(--c-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                {title}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--c-text-mute)", whiteSpace: "pre-wrap" }}>
                {parts.length > 0 ? parts.map((part, idx) => (
                    <span
                        key={`${title}-${idx}`}
                        style={part.changed ? {
                            background: isBlue ? "rgba(43, 120, 202, 0.18)" : "rgba(226, 75, 74, 0.14)",
                            color: isBlue ? "var(--c-blue-deep)" : "var(--c-red-deep)",
                            borderRadius: 4,
                            padding: "1px 2px",
                            fontWeight: 600
                        } : undefined}
                    >
                        {part.text}
                    </span>
                )) : (text || "No content")}
            </div>
        </div>
    );
}
