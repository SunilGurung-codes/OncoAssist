import React, { useState, useEffect, useRef } from "react";
import { data } from "../data.js";
import { TopBar } from "../components/ui/TopBar.jsx";
import { Icon } from "../components/ui/Icon.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { TextSelectionPopup } from "../components/ui/TextSelectionPopup.jsx";
import { LeftPanel, RightPanel } from "../components/panels.jsx";
import { useDrop } from "../components/ui/useDrop.js";
import { Micro } from "../components/ui/Micro.jsx";

function sanitizeChatText(text = "") {
    return String(text)
        .replace(/^#{1,6}\s*/gm, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/^\s*[-*•]\s+/gm, "")
        .replace(/\u2014/g, "-");
}

function renderAssistantText(text = "") {
    const lines = sanitizeChatText(text).split("\n");
    return lines.map((line, lineIdx) => {
        const parts = [];
        const pattern = /(\[\[(.*?)\]\]|\*\*(.*?)\*\*)/g;
        let lastIndex = 0;
        let match;

        while ((match = pattern.exec(line)) !== null) {
            const [full, bracketed, highlightedBracket, highlightedBold] = match;
            const highlighted = highlightedBracket || highlightedBold || "";
            const start = match.index;
            if (start > lastIndex) {
                parts.push(
                    <React.Fragment key={`t-${lineIdx}-${start}`}>
                        {line.slice(lastIndex, start).replace(/\*/g, "").replace(/\[\[|\]\]/g, "")}
                    </React.Fragment>
                );
            }
            parts.push(
                <span
                    key={`h-${lineIdx}-${start}`}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "1px 6px",
                        borderRadius: 6,
                        background: "var(--c-blue-50)",
                        color: "var(--c-blue-deep)",
                        border: "0.5px solid var(--c-blue-250)",
                        fontWeight: 600
                    }}
                >
                    {highlighted}
                </span>
            );
            lastIndex = start + full.length;
        }

        const tail = line.slice(lastIndex).replace(/\*/g, "").replace(/\[\[|\]\]/g, "");
        if (tail) {
            parts.push(<React.Fragment key={`tail-${lineIdx}`}>{tail}</React.Fragment>);
        }

        return (
            <React.Fragment key={`line-${lineIdx}`}>
                {parts.length > 0 ? parts : line.replace(/\*/g, "").replace(/\[\[|\]\]/g, "")}
                {lineIdx < lines.length - 1 ? <br /> : null}
            </React.Fragment>
        );
    });
}

export function InitialScreen({ patient = data.patientProfile, onNav, onEnterNotes, theme, toggleTheme }) {
    const savedSession = loadVisitSession(patient);
    const [state, setState] = useState(savedSession.state);
    const [tab, setTab] = useState(savedSession.tab);
    const [lCol, setLCol] = useState(savedSession.lCol);
    const [leftW, setLeftW] = useState(savedSession.leftW);
    const [rCol, setRCol] = useState(savedSession.rCol);
    const [rightW, setRightW] = useState(savedSession.rightW);

    // Chat state
    const [messages, setMessages] = useState(savedSession.messages);
    const [input, setInput] = useState(savedSession.input);
    const [ctx, setCtx] = useState(savedSession.ctx);
    const drop = useDrop(d => setCtx(c => [...c, { kind: d.kind, label: d.label }]));
    const ref = useRef(null);
    const msgRefs = useRef([]);
    const [activeMsg, setActiveMsg] = useState(savedSession.activeMsg);
    const [editingIdx, setEditingIdx] = useState(savedSession.editingIdx); // which message index is in canvas edit mode
    const [notes, setNotes] = useState(savedSession.notes);
    const [autoFetchContext, setAutoFetchContext] = useState(savedSession.autoFetchContext);
    const [aiThinking, setAiThinking] = useState(false);
    useEffect(() => {
        const next = loadVisitSession(patient);
        setState(next.state);
        setTab(next.tab);
        setLCol(next.lCol);
        setLeftW(next.leftW);
        setRCol(next.rCol);
        setRightW(next.rightW);
        setMessages(next.messages);
        setInput(next.input);
        setCtx(next.ctx);
        setActiveMsg(next.activeMsg);
        setEditingIdx(next.editingIdx);
        setNotes(next.notes);
        setAutoFetchContext(next.autoFetchContext);
        setAiThinking(false);
    }, [patient]);
    useEffect(() => {
        saveVisitSession(patient.id, { state, tab, lCol, leftW, rCol, rightW, messages, input, ctx, activeMsg, editingIdx, notes, autoFetchContext });
    }, [patient.id, state, tab, lCol, leftW, rCol, rightW, messages, input, ctx, activeMsg, editingIdx, notes, autoFetchContext]);
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
    const send = async (t, options = {}) => {
        const question = t.trim();
        if (!question || aiThinking) return;

        const conversation = messages.map((m) => ({ role: m.role, text: m.text }));
        const {
            selectedText = "",
            collapseLeft = false,
            displayText = question,
            displaySelection = "",
        } = options;
        const effectiveContext = autoFetchContext ? dedupeContext([...buildAutoContext(patient), ...ctx]) : ctx;

        if (collapseLeft) setLCol(true);

        setMessages((m) => [...m, {
            role: "user",
            text: displayText,
            selectedText: displaySelection || selectedText,
            t: "now",
        }]);
        setInput("");
        setAiThinking(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: patient.id,
                    question,
                    selectedText,
                    conversation,
                    context: effectiveContext,
                }),
            });

            const payload = await res.json();
            const reply = res.ok
                ? payload.answer
                : (payload.error || "The local AI server could not answer this request.");

            setMessages((m) => [...m, {
                role: "ai",
                text: reply,
                t: "now",
                cites: selectedText ? [`Selection: ${selectedText}`] : [],
            }]);
        } catch (error) {
            setMessages((m) => [...m, {
                role: "ai",
                text: "I could not reach the local AI server. Start the backend on your PC and add your OpenRouter API key before trying again.",
                t: "now",
                cites: [],
            }]);
        } finally {
            setAiThinking(false);
        }
    };
    const [elapsed, setElapsed] = useState(0);
    const [vis, setVis] = useState(0);
    const tr = patient.transcript;
    useEffect(() => { let id; if (state === "recording") id = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(id); }, [state]);
    useEffect(() => { if (state !== "recording") return; const t = setInterval(() => setVis(v => Math.min(v + 1, tr.length)), 1500); return () => clearInterval(t); }, [state, tr]);
    useEffect(() => {
        if (state === "generating") {
            const t = setTimeout(() => {
                setState("drafted");
                const draftText = buildDraftText(patient);
                setMessages(m => [...m, { role: "ai", text: draftText, t: "now", cites: [] }]);
            }, 2200);
            return () => clearTimeout(t);
        }
    }, [patient, state]);
    const fmt = s => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const start = () => { setElapsed(0); setVis(0); setState("recording"); };
    const getDraftMessageIndex = React.useCallback(() => messages.map((m, i) => ({ m, i })).filter(({ m }) => m.role === "ai" && m.text.includes("Oncology SOAP Note")).at(-1)?.i ?? null, [messages]);
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
        type: `${patient.reason || patient.dx}`,
        author: patient.provider,
        date: "Today · Draft",
        status: "Draft",
        pinned: true,
        preview: toDraftPreview(text),
    }), [patient]);
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
        saveVisitSession(patient.id, { pendingReviewAdd: true, pendingReviewText: messages[idx].text });
        onNav("review");
    }, [getDraftMessageIndex, messages, onNav, patient.id]);
    const createTemplateNote = React.useCallback((template) => {
        const draftText = buildTemplateDraftText(patient, template);
        const nextIndex = messages.length;
        setState("drafted");
        setMessages((existing) => [...existing, { role: "ai", text: draftText, t: "now", cites: [`Template: ${template.shortTitle || template.title}`] }]);
        setEditingIdx(nextIndex);
        requestAnimationFrame(() => requestAnimationFrame(() => navTo(nextIndex)));
    }, [messages.length, patient]);

    return <div className="stage" data-screen-label="02 Initial · Ambience">
        <TopBar theme={theme} toggleTheme={toggleTheme} />
        <div className="screen-body">
            <LeftPanel patient={patient} collapsed={lCol} onToggle={() => setLCol(!lCol)} width={leftW} state={state} draftNote={currentDraftNote} onContinueDraft={openCurrentDraft} onAddDraftToNotes={addCurrentDraftToNotes} />
            {!lCol && <Resizer onPosChange={x => setLeftW(Math.max(260, Math.min(800, x)))} />}

            <div className="panel-main">
                <div style={{ minHeight: 44, padding: "8px 28px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                    <span onClick={() => onNav("dashboard")} style={{ cursor: "pointer", fontSize: 13, color: "var(--c-text-mute)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>{Icon.chevLeft({ s: 12 })} Dashboard</span>
                    <span style={{ color: "var(--c-text-ghost)", margin: "0 8px" }}>/</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{patient.name} · Visit</span>
                </div>
                <div className="scroll" ref={ref} style={{ padding: "20px 36px", flex: 1, overflowY: "auto" }}>
                    <div className="label-xs" style={{ marginBottom: 6 }}>VISIT · {patient.visitDate.toUpperCase()} · {patient.visitTime}</div>
                    <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, letterSpacing: "-0.01em" }}>{patient.reason}</div>
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
                                <button className="btn btn-primary sm" onClick={() => onNav("review")}>Review and Approve →</button>
                            </div>
                            <div style={{ background: "var(--c-surface)", border: "0.5px solid var(--c-blue-250)", borderRadius: 10, padding: "12px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Chip tone="purple" size="sm">Oncology</Chip><div style={{ fontSize: 13, fontWeight: 600 }}>{patient.reason}</div></div>
                                <div style={{ fontSize: 12, color: "var(--c-text-strong)", lineHeight: 1.55, maxHeight: 72, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", whiteSpace: "pre-wrap" }}>
                                    {sanitizeChatText(messages.find(m => m.role === "ai" && m.text.includes("Oncology SOAP Note"))?.text.substring(0, 160) || "Review full note structure...")}
                                </div>
                            </div>
                        </div>
                    </div>}
                    <div className="card" style={{ marginBottom: 18 }}>
                        <div style={{ height: 38, padding: "0 14px", display: "flex", alignItems: "center", background: "var(--c-surface-alt)", fontWeight: 500, fontSize: 13, gap: 6 }}><span style={{ color: "var(--c-blue)" }}>{Icon.sparkle({ s: 12 })}</span>Smart steps · AI-suggested</div>
                        {buildSmartSteps(patient).map((s, i) =>
                            <div key={i} className="note-row" onClick={() => send(s.q)} style={{ borderTop: "0.5px solid var(--c-border-faint)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, background: s.primary ? "var(--c-blue-50)" : "var(--c-surface)", cursor: "pointer" }}>
                                {s.primary ? <span style={{ width: 7, height: 7, borderRadius: 4, background: "var(--c-blue)" }} /> : <Chip tone="blue" size="xs">{s.tag}</Chip>}
                                <div style={{ flex: 1, fontSize: 13, color: s.primary ? "var(--c-blue-deep)" : "var(--c-text)", fontWeight: s.primary ? 500 : 400 }}>{s.q}</div>
                                <span className="micro">Ask →</span>
                            </div>)}
                    </div>

                    {/* Inline chat input when no messages (appears right after Smart Steps) */}
                    {messages.length === 0 && <ChatInput input={input} setInput={setInput} send={send} ctx={ctx} setCtx={setCtx} drop={drop} Icon={Icon} disabled={aiThinking} autoFetchContext={autoFetchContext} setAutoFetchContext={setAutoFetchContext} patient={patient} />}

                    <div style={{ width: "100%", margin: "0 auto", padding: "0 80px 0 0", display: "block", position: "relative" }}>

                        {/* Chat messages column */}
                        <div style={{ minWidth: 0 }}>
                            {messages.map((m, i) => m.role === "user" ?
                                <div key={i} ref={el => msgRefs.current[i] = el} className="fade-in" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                                    <div style={{ maxWidth: "74%" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, color: "var(--c-text-ghost)" }}>Apr 17 · {m.t}</span>
                                        </div>
                                        <div style={{ background: "var(--c-surface-alt)", padding: "10px 14px", borderRadius: "10px 10px 0 10px", fontSize: 13, lineHeight: 1.5 }}>
                                        {m.selectedText ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                <span style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    padding: "2px 8px",
                                                    borderRadius: 999,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: "var(--c-blue)",
                                                    background: "var(--c-blue-50)",
                                                    border: "0.5px solid var(--c-blue-250)"
                                                }}>
                                                    {m.selectedText}
                                                </span>
                                                <span>{m.text}</span>
                                            </div>
                                        ) : m.text}
                                        </div>
                                    </div>
                                </div>
                                : editingIdx === i ?
                                    <InlineSoapEditor key={i} ref={el => msgRefs.current[i] = el} text={m.text} onClose={() => setEditingIdx(null)} onSave={newText => {
                                        setMessages(ms => ms.map((mm, j) => j === i ? { ...mm, text: newText } : mm));
                                        if (notes.some(n => n.id === "draft-note") || i === draftMessageIndex) addOrUpdateDraftNote(newText);
                                        setEditingIdx(null);
                                    }} />
                                    : <div key={i} ref={el => msgRefs.current[i] = el} className="fade-in" style={{ marginBottom: 14 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Chip tone="blue-solid" size="sm">OncoAssist</Chip><span style={{ fontSize: 11, color: "var(--c-text-ghost)" }}>Apr 17 · {m.t}</span></div>
                                        <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{renderAssistantText(m.text)}</div>
                                        {m.cites && <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-blue-deep)", display: "flex", gap: 4, flexWrap: "wrap" }}>{m.cites.map((c, j) => <span key={j}>[{c}]</span>)}</div>}
                                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}><Micro icon={Icon.copy({ s: 10 })}>Copy</Micro><Micro icon={Icon.edit({ s: 10 })} onClick={() => setEditingIdx(i)}>Edit</Micro><Micro icon={Icon.plus({ s: 10 })} onClick={() => addOrUpdateDraftNote(m.text)}>Add to Note</Micro></div>
                                    </div>
                            )}
                            {aiThinking && (
                                <div className="fade-in" style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                        <Chip tone="blue-solid" size="sm">OncoAssist</Chip>
                                        <span style={{ fontSize: 11, color: "var(--c-text-ghost)" }}>thinking…</span>
                                    </div>
                                    <div style={{ maxWidth: "78%", background: "var(--c-surface-alt)", padding: "10px 14px", borderRadius: "10px 10px 10px 0", fontSize: 13, lineHeight: 1.5, color: "var(--c-text-mute)" }}>
                                        Looking through the patient chart…
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Grok-style interactive timeline scrubber — sticky-centered in right gutter */}
                        {messages.length > 0 && editingIdx === null && (
                            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 56, pointerEvents: "none" }}>
                                <div style={{
                                    position: "sticky",
                                    top: "calc(50vh - 86px)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 0",
                                    pointerEvents: "auto"
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
                <TextSelectionPopup onAsk={(selectedText, query) => send(
                    query || `Explain "${selectedText}" in the context of this patient.`,
                    {
                        selectedText,
                        collapseLeft: true,
                        displayText: query || "Explain this in the context of this patient.",
                        displaySelection: selectedText,
                    }
                )} />

                {/* Bottom-pinned chat input — only when messages exist */}
                {messages.length > 0 && <ChatInput input={input} setInput={setInput} send={send} ctx={ctx} setCtx={setCtx} drop={drop} Icon={Icon} disabled={aiThinking} autoFetchContext={autoFetchContext} setAutoFetchContext={setAutoFetchContext} patient={patient} />}

            </div>
            {!rCol && <Resizer onPosChange={x => setRightW(Math.max(260, Math.min(800, window.innerWidth - x)))} />}
            {/* Adding Right Panel for Clinical Context */}
            <RightPanel patient={patient} tab={tab} onTab={setTab} collapsed={rCol} onToggle={() => setRCol(!rCol)} onAddToChat={obj => setCtx(c => [...c, { kind: obj.kind, label: obj.label }])} onCreateNoteTemplate={createTemplateNote} width={rightW} notes={notes} />
        </div>
    </div>;
}

function getVisitSessionKey(patientId) {
    return `oa_visit_session_${patientId}`;
}

function loadVisitSession(patient) {
    const fallback = {
        state: "ready",
        tab: "Notes",
        lCol: false,
        leftW: 359,
        rCol: false,
        rightW: 610,
        messages: [],
        input: "",
        ctx: [],
        activeMsg: 0,
        editingIdx: null,
        notes: patient.notes,
        autoFetchContext: true,
        pendingReviewAdd: false,
        pendingReviewText: "",
    };
    try {
        const raw = localStorage.getItem(getVisitSessionKey(patient.id));
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
            ...fallback,
            ...parsed,
            notes: parsed.notes || patient.notes,
            messages: parsed.messages || [],
            ctx: parsed.ctx || [],
        };
    } catch {
        return fallback;
    }
}

function saveVisitSession(patientId, patch) {
    try {
        const key = getVisitSessionKey(patientId);
        const current = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({ ...current, ...patch }));
    } catch {
        // no-op for local persistence failures
    }
}

function buildSmartSteps(patient) {
    const psaReadings = patient.psa?.length || 0;
    const therapy = patient.medications?.[0] || "current therapy";
    return [
        { q: `Think through next steps for ${patient.name}`, primary: true },
        { q: `Compare today's PSA to the last ${Math.min(psaReadings, 7)} readings`, tag: "Q1" },
        { q: `Review side effects and monitoring on ${therapy}`, tag: "Q2" },
    ];
}

function buildDraftText(patient) {
    const diagnosis = patient.diagnosis || {};
    const meds = patient.medications || [];
    const psaRow = patient.labsPSA?.rows?.find((row) => row.name === "PSA");
    const hgbRow = patient.labsCBC?.rows?.find((row) => row.name === "Hgb");
    const imaging = patient.imaging?.[0];
    const subjectiveLine = patient.transcript?.find((entry) => /Patient/i.test(entry.speaker))?.text || `Patient presents for ${patient.reason.toLowerCase()}.`;
    const symptoms = patient.flags?.[0]?.text || patient.reason;
    return `Oncology SOAP Note\n\n` +
        `Patient Information\nName: ${patient.name}\nMRN: ${patient.mrn}\nDOB / Age: ${formatLongDate(patient.dob)} / ${patient.age}\nSex: ${patient.sex}\nDate of Visit: ${patient.visitDate}\nProvider: ${patient.provider}\n\n` +
        `S - Subjective\nChief Complaint (CC): ${patient.reason}.\nHistory of Present Illness (HPI): ${subjectiveLine}\nDiagnosis (type, stage): ${diagnosis.primaryCancer || patient.dx}, ${diagnosis.stage || patient.status}.\nDate of diagnosis: ${formatShortDate(diagnosis.diagnosisDate)}\nCurrent treatment regimen: ${meds.slice(0, 2).join(", ") || "See medication list"}\nCycle/day: Current follow-up visit\nSymptoms (onset, duration, severity): ${symptoms}\nFunctional status (e.g., ECOG): ECOG ${diagnosis.ecog || "0"}\n\nReview of Systems (ROS):\nConstitutional: Reviewed during visit.\nHEENT: No major concerns raised.\nCardiovascular: Negative for acute symptoms.\nRespiratory: No shortness of breath reported.\nGastrointestinal: No new concerns reported.\nGenitourinary: Reviewed in clinic.\nMusculoskeletal: Reviewed in clinic.\nNeurologic: No acute deficits reported.\nPsychiatric: Coping discussed.\nMedications: ${meds.join(", ")}.\nAllergies: ${(patient.allergies || []).join(", ") || "None documented"}\n\n` +
        `O - Objective\nVitals:\nBP: 122/78\nHR: 76\nTemp: 37.1 C\nRR: 16\nSpO2: 98%\nWeight: 84 kg\n\nPhysical Examination:\nGeneral: Well-appearing, NAD.\nHEENT: WNL\nCardiovascular: RRR.\nRespiratory: CTAB.\nAbdomen: Soft, non-tender.\nExtremities: No edema.\nSkin: Warm, dry.\nNeurologic: Alert and oriented.\n\nLabs:\nCBC: ${hgbRow ? `${hgbRow.name} ${hgbRow.v} ${hgbRow.unit}${hgbRow.flag ? ` (${hgbRow.flag})` : ""}` : "Reviewed"}\nTumor markers: ${psaRow ? `${psaRow.name} ${psaRow.v} ${psaRow.unit}${psaRow.note ? ` (${psaRow.note})` : ""}` : "Reviewed"}\n\nImaging/Diagnostics:\n${imaging ? `${imaging.type}: ${imaging.impression}` : "No new imaging available."}\nPathology: ${diagnosis.pathology || "See chart"}\n\n` +
        `A - Assessment\nPrimary cancer diagnosis: ${diagnosis.primaryCancer || patient.dx}.\nStage: ${diagnosis.stage || patient.status}.\nTreatment response: ${patient.status} clinical status with ongoing review of PSA, labs, imaging, and symptoms.\nToxicities / adverse effects: ${(patient.flags || []).join ? "" : ""}${(patient.flags || []).map((flag) => flag.text).slice(0, 2).join(" ")}\nComorbidities: ${(patient.comorbidities || []).join(", ") || "None active"}.\n\n` +
        `P - Plan\nTreatment Plan:\nContinue / modify / hold therapy: Continue current management pending clinician review.\nNext cycle: Follow existing care cadence.\nMedications: Reconcile and refill as indicated.\n\nMonitoring:\nLabs: Repeat PSA and CBC per follow-up schedule.\nImaging: Reassess if symptoms or PSA trend warrant.\n\nSupportive Care:\nPain management: Review symptom burden each visit.\nNutrition: Continue supportive counseling.\nPsychosocial support: Coping reviewed in clinic.\n\nFollow-Up:\nNext visit: Schedule per oncology workflow.\nReferrals: As clinically indicated.\n\nNotes:\nECOG Performance Status: ${diagnosis.ecog || "0"}\nAdvance directives discussed: No major changes documented.`;
}

function buildTemplateDraftText(patient, template) {
    const diagnosis = patient.diagnosis || {};
    const meds = patient.medications || [];
    const psaRow = patient.labsPSA?.rows?.find((row) => row.name === "PSA");
    const hgbRow = patient.labsCBC?.rows?.find((row) => row.name === "Hgb");
    const imaging = patient.imaging?.[0];
    const leadSymptom = patient.flags?.[0]?.text || patient.reason;

    if (template?.id === "new-consult") {
        return `Oncology New Patient Consultation Note

Patient Information
Name: ${patient.name}
MRN: ${patient.mrn}
DOB / Age: ${formatLongDate(patient.dob)} / ${patient.age}
Sex: ${patient.sex}
Referral Reason: ${patient.reason}
Provider: ${patient.provider}

History of Present Illness
Referral / presentation: New consultation for ${diagnosis.primaryCancer || patient.dx}.
Symptoms at presentation: ${leadSymptom}
PSA history: ${patient.psa?.map((point) => `${point.m} ${point.v}`).join(", ") || "See chart"}.
Prior workup: ${imaging ? `${imaging.type} reviewed.` : "Imaging pending."}

Oncologic Review
Primary diagnosis: ${diagnosis.primaryCancer || patient.dx}
Stage: ${diagnosis.stage || patient.status}
Gleason / pathology: ${diagnosis.gleason || diagnosis.pathology || "See pathology report"}
Performance status: ECOG ${diagnosis.ecog || "0"}
Comorbidities: ${(patient.comorbidities || []).join(", ") || "None active"}

Initial Assessment
Clinical impression: Patient is presenting for initial oncology evaluation with available labs, imaging, and symptom review integrated above.
Key risks / concerns: ${(patient.flags || []).map((flag) => flag.text).slice(0, 2).join(" ")}

Initial Plan
Recommended next steps: Review pathology and staging with patient.
Orders / workup: Confirm baseline labs and imaging needs.
Treatment discussion: Outline systemic, radiation, and surveillance options as clinically appropriate.
Follow-up: Return after staging review and treatment decision discussion.`;
    }

    if (template?.id === "treatment-plan") {
        return `Treatment Planning / Adjuvant Therapy Note

Patient Information
Name: ${patient.name}
MRN: ${patient.mrn}
Diagnosis: ${diagnosis.primaryCancer || patient.dx}
Stage: ${diagnosis.stage || patient.status}
Provider: ${patient.provider}

Treatment Intent
Intent of therapy: Define curative, disease-control, or palliative approach based on current clinical picture.
Current regimen: ${meds.slice(0, 3).join(", ") || "To be determined"}
Response markers: ${psaRow ? `${psaRow.name} ${psaRow.v} ${psaRow.unit}` : "Labs under review"}

Planning Considerations
Imaging review: ${imaging ? `${imaging.type} - ${imaging.impression}` : "No imaging loaded"}
Laboratory review: ${hgbRow ? `${hgbRow.name} ${hgbRow.v} ${hgbRow.unit}` : "CBC reviewed"}${psaRow ? `; ${psaRow.name} ${psaRow.v} ${psaRow.unit}` : ""}
Toxicity monitoring: ${(patient.flags || []).map((flag) => flag.text).slice(0, 2).join(" ") || "Discuss anticipated treatment toxicities"}

Plan
Systemic therapy plan: Document regimen, start timing, and dose strategy.
Radiation / procedure planning: Add site, timing, and coordination needs if indicated.
Monitoring plan: Repeat CBC, CMP, PSA, and imaging as clinically appropriate.
Patient counseling: Review expected side effects, adherence, and escalation precautions.`;
    }

    if (template?.id === "survivorship") {
        return `Survivorship / Post-Treatment Summary Note

Patient Information
Name: ${patient.name}
MRN: ${patient.mrn}
Primary diagnosis: ${diagnosis.primaryCancer || patient.dx}
Provider: ${patient.provider}

Treatment Summary
Therapies received: ${meds.slice(0, 3).join(", ") || "Document completed treatment course"}
Most recent disease markers: ${psaRow ? `${psaRow.name} ${psaRow.v} ${psaRow.unit}` : "Review follow-up labs"}
Most recent imaging: ${imaging ? `${imaging.type} - ${imaging.impression}` : "No imaging loaded"}

Survivorship Assessment
Long-term effects / symptoms: ${(patient.flags || []).map((flag) => flag.text).slice(0, 2).join(" ") || "Review urinary, sexual, bowel, bone, and fatigue concerns"}
Functional status: ECOG ${diagnosis.ecog || "0"}
Ongoing comorbidities: ${(patient.comorbidities || []).join(", ") || "None active"}

Survivorship Plan
Recurrence monitoring: Continue PSA surveillance and symptom-directed evaluation.
Supportive care: Address bone health, cardiovascular risk, and quality-of-life concerns.
Coordination: Communicate plan with PCP and specialty teams.
Follow-up schedule: Define interval for labs, imaging, and oncology follow-up.`;
    }

    if (template?.id === "custom") {
        return `Custom Note

Patient Information
Name: ${patient.name}
MRN: ${patient.mrn}
Provider: ${patient.provider}
Visit Date: ${patient.visitDate}

Clinical Context
Reason for note: ${patient.reason}
Diagnosis summary: ${diagnosis.primaryCancer || patient.dx}
Relevant labs: ${psaRow ? `${psaRow.name} ${psaRow.v} ${psaRow.unit}` : "Add labs"}
Relevant imaging: ${imaging ? `${imaging.type} - ${imaging.impression}` : "Add imaging"}

Assessment
Use this custom note to combine sections from consultation, follow-up, planning, and survivorship workflows as needed.

Plan
Complete the note sections based on the clinical goal for this encounter.`;
    }

    return `Follow-Up (Treatment / Surveillance) Note

Patient Information
Name: ${patient.name}
MRN: ${patient.mrn}
DOB / Age: ${formatLongDate(patient.dob)} / ${patient.age}
Sex: ${patient.sex}
Date of Visit: ${patient.visitDate}
Provider: ${patient.provider}

Interval History
Reason for follow-up: ${patient.reason}
Patient-reported update: ${patient.transcript?.find((entry) => /Patient/i.test(entry.speaker))?.text || "Interval history reviewed during visit."}
Treatment tolerance: ${(patient.flags || []).map((flag) => flag.text).slice(0, 2).join(" ") || "Tolerance reviewed"}

Objective Review
Current treatment regimen: ${meds.slice(0, 3).join(", ") || "See medication list"}
PSA / disease markers: ${psaRow ? `${psaRow.name} ${psaRow.v} ${psaRow.unit}${psaRow.note ? ` (${psaRow.note})` : ""}` : "Reviewed"}
Additional labs: ${hgbRow ? `${hgbRow.name} ${hgbRow.v} ${hgbRow.unit}${hgbRow.flag ? ` (${hgbRow.flag})` : ""}` : "Reviewed"}
Imaging: ${imaging ? `${imaging.type} - ${imaging.impression}` : "No new imaging available"}

Assessment
Disease status: ${patient.status}
Stage: ${diagnosis.stage || patient.status}
Functional status: ECOG ${diagnosis.ecog || "0"}
Key concerns: ${leadSymptom}

Plan
Continue current management pending clinician review.
Repeat PSA, CBC, and surveillance studies as appropriate.
Adjust therapy or supportive care based on symptoms, labs, and imaging trend.`;
}

function formatLongDate(value) {
    if (!value) return "Unknown";
    const [year, month, day] = value.split("-");
    const dt = new Date(Number(year), Number(month) - 1, Number(day));
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(value) {
    return value ? value.slice(0, 4) : "Unknown";
}

function buildAutoContext(patient) {
    return [
        { kind: "auto", label: `Latest note · ${patient.notes?.[0]?.type || "Clinical note"}` },
        { kind: "auto", label: `Labs · ${patient.labsPSA?.date || patient.visitDate}` },
        { kind: "auto", label: `Imaging · ${patient.imaging?.[0]?.type || "No imaging loaded"}` },
    ];
}

function dedupeContext(items) {
    const seen = new Set();
    return items.filter((item) => {
        const key = `${item.kind}:${item.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function ChatInput({ input, setInput, send, ctx, setCtx, drop, Icon, disabled = false, autoFetchContext = true, setAutoFetchContext = () => {}, patient = data.patientProfile }) {
    const autoItems = autoFetchContext ? buildAutoContext(patient) : [];
    return (
        <div {...drop.props} className={drop.over ? "drop-active" : ""} style={{ marginTop: 18, borderTop: "0.5px solid var(--c-border-faint)", background: "var(--c-surface)", zIndex: 10, borderRadius: 12 }}>
            <div style={{ width: "100%", margin: "0 auto", paddingTop: 6 }}>
                <div style={{ padding: "10px 28px 10px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minHeight: 44 }}>
                    <span style={{ fontSize: 13, color: "var(--c-text-soft)" }}>Context:</span>
                    <button className={autoFetchContext ? "btn btn-primary sm" : "btn btn-outline sm"} onClick={() => setAutoFetchContext((value) => !value)} type="button">
                        Auto fetch context mode {autoFetchContext ? "On" : "Off"}
                    </button>
                    {autoItems.map((c, i) => <span key={`auto-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 6, fontSize: 12, background: "var(--c-blue-50)", border: "0.5px solid var(--c-blue-250)", color: "var(--c-blue-deep)" }}>
                        {Icon.sparkle({ s: 10 })}{c.label}
                    </span>)}
                    {ctx.map((c, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, fontSize: 12, background: c.kind === "note" ? "var(--c-blue-100)" : "var(--c-surface-alt)", border: "0.5px solid " + (c.kind === "note" ? "var(--c-blue-250)" : "var(--c-border)"), color: "var(--c-text-mute)" }}>
                        {c.kind === "note" ? Icon.file({ s: 10 }) : Icon.lab({ s: 10 })}{c.label}
                        <span onClick={() => setCtx(a => a.filter((_, j) => j !== i))} style={{ cursor: "pointer" }}>{Icon.x({ s: 9 })}</span>
                    </span>)}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, fontSize: 12, background: "transparent", border: "0.5px dashed var(--c-border)", color: "var(--c-text-mute)", cursor: "pointer" }}>{Icon.plus({ s: 10 })} Add context</span>
                </div>
                <div className="chat-input-shell" style={{ margin: "0 28px 16px", borderRadius: 10, background: "var(--c-surface-alt)", border: "0.5px solid var(--c-border)", padding: "10px 12px", transition: "background 0.15s ease, border-color 0.15s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--c-text-mute)" }}>{Icon.paperclip({ s: 14 })}</span>
                        <input value={input} disabled={disabled} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !disabled && send(input)} placeholder={disabled ? "OncoAssist is answering…" : "Ask anything or drag a note here"} style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14 }} />
                        <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-mute)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}>{Icon.mic({ s: 16 })}</div>
                        <div onClick={() => !disabled && send(input)} style={{ width: 32, height: 32, borderRadius: 8, background: disabled ? "var(--c-border)" : "var(--c-blue)", color: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "default" : "pointer" }}>{Icon.send({ s: 14 })}</div>
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
    const sMatch = text.match(/(?:\*\*)?S\s*[-\u2014]\s*Subjective(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?O\s*[-\u2014]\s*Objective(?:\*\*)?|$)/);
    const oMatch = text.match(/(?:\*\*)?O\s*[-\u2014]\s*Objective(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?A\s*[-\u2014]\s*Assessment(?:\*\*)?|$)/);
    const aMatch = text.match(/(?:\*\*)?A\s*[-\u2014]\s*Assessment(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?P\s*[-\u2014]\s*Plan(?:\*\*)?|$)/);
    const pMatch = text.match(/(?:\*\*)?P\s*[-\u2014]\s*Plan(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?Notes:(?:\*\*)?|$)/);
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
        const out = `Oncology SOAP Note\n\nS - Subjective\n${note.subj}\n\nO - Objective\n${note.obj}\n\nA - Assessment\n${note.ass}\n\nP - Plan\n${note.plan}`;
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
        <div onClick={onClick} className="has-tooltip" data-tooltip={label}
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
