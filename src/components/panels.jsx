import React, { useState } from "react";
import { data } from "../data.js";
import { SectionHeader } from "./ui/SectionHeader.jsx";
import { Chip } from "./ui/Chip.jsx";
import { Icon } from "./ui/Icon.jsx";

// Left Panel
export function LeftPanel() {
    const d = data;
    const [c, setC] = useState({ flags: false, psa: false, labs: false, note: false });
    const tog = k => setC(x => ({ ...x, [k]: !x[k] }));
    return (
        <div className="panel-left">
            <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", gap: 10 }}>
                <div className="avatar lg" style={{ background: "#C7D9EB", color: "var(--c-blue-deep)" }}>JP</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>James Park</div>
                    <div style={{ fontSize: 11, color: "var(--c-text-mute)", marginTop: 2 }}>67M · MRN-003291</div>
                </div>
            </div>
            <div className="scroll" style={{ flex: 1, overflowY: "auto" }}>
                <SectionHeader label="KEY FLAGS" collapsed={c.flags} onToggle={() => tog("flags")} />
                {!c.flags && <div style={{ padding: "4px 0" }}>{d.flags.map((f, i) => {
                    const t = { red: { d: "var(--c-red)", c: "var(--c-red-deep)" }, green: { d: "var(--c-green)", c: "var(--c-green-deep)" }, blue: { d: "var(--c-blue)", c: "var(--c-blue-deep)" }, amber: { d: "var(--c-amber)", c: "var(--c-amber-deep)" } }[f.tone];
                    return <div key={i} style={{ padding: "6px 16px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: t.d, marginTop: 5, flexShrink: 0 }} />
                        <div style={{ fontSize: 11, color: t.c, lineHeight: 1.4 }}>{f.text}</div>
                    </div>;
                })}</div>}

                <SectionHeader label="PSA HISTORY" right={<span style={{ fontSize: 10, color: "var(--c-text-mute)" }}>ng/mL</span>} collapsed={c.psa} onToggle={() => tog("psa")} />
                {!c.psa && <PSAChart />}

                <SectionHeader label="KEY LABS · APR 17" collapsed={c.labs} onToggle={() => tog("labs")} />
                {!c.labs && <div style={{ padding: "10px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 10, columnGap: 16 }}>
                    <Stat n="PSA" v="16.2 ng/mL" tone="red" icon="↓" />
                    <Stat n="Testosterone" v="< 50 ng/dL" tone="green" />
                    <Stat n="Hgb" v="12.8 g/dL" />
                    <Stat n="Creatinine" v="1.1 mg/dL" />
                </div>}

                <SectionHeader label="MOST RECENT NOTE" collapsed={c.note} onToggle={() => tog("note")} />
                {!c.note && <div style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Chip tone="blue" size="sm">Lab</Chip>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>PSA + T panel</div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--c-text-faint)", marginBottom: 8 }}>Lab · Apr 17 · 07:45</div>
                    <div style={{ fontSize: 11, color: "var(--c-text-mute)", lineHeight: 1.5, marginBottom: 10 }}>PSA 16.2 ng/mL (H). Testosterone {"<"} 50 ng/dL. LH 0.8, FSH 1.4.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span className="btn btn-soft sm" style={{ flex: 1 }}>+ Add to chat</span>
                        <span className="btn btn-ghost sm" style={{ flex: 1 }}>View full</span>
                    </div>
                </div>}
            </div>
            <div style={{ borderTop: "0.5px solid #C4D9F0", background: "#D4E8F9" }}>
                <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="pulse-blue" style={{ width: 8, height: 8, borderRadius: 4, background: "var(--c-blue)" }} />
                        <span className="label-xs" style={{ color: "var(--c-text)" }}>CURRENTLY EDITING</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, color: "var(--c-blue)" }}>Draft</span>
                </div>
                <div style={{ padding: "10px 16px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                        <Chip tone="purple" size="sm">Oncology</Chip>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>Follow-up · Day 14 Enzalutamide</div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--c-blue)", marginBottom: 6 }}>Dr. I. Riaz · Today · Draft</div>
                    <div style={{ fontSize: 11, color: "var(--c-blue-deep)", lineHeight: 1.5, marginBottom: 10 }}>Early response to Enzalutamide confirmed — PSA 18.4 → 16.2…</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span className="btn btn-primary sm" style={{ flex: 1 }}>Continue</span>
                        <span className="btn btn-outline sm" style={{ flex: 1 }}>+ Add to Notes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ n, v, tone, icon }) {
    const c = tone === "red" ? "var(--c-red-deep)" : tone === "green" ? "var(--c-green-deep)" : "var(--c-text)";
    return <div>
        <div style={{ fontSize: 10, color: "var(--c-text-faint)", marginBottom: 3 }}>{n}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: c, display: "flex", gap: 4 }}>{v} {icon && <span>{icon}</span>}</div>
    </div>;
}

function PSAChart() {
    const d = data.psa, W = 288, H = 108, max = 20, pL = 20, pR = 6, pT = 8, pB = 22;
    const iw = W - pL - pR, ih = H - pT - pB;
    const x = i => pL + (i * iw) / (d.length - 1), y = v => pT + ih - (v / max) * ih;
    const path = d.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.v)}`).join(" ");
    return <div style={{ padding: "8px 16px 10px" }}>
        <svg width={W} height={H} style={{ display: "block" }}>
            {[5, 10, 15, 20].map(g => <line key={g} x1={pL} y1={y(g)} x2={W - pR} y2={y(g)} stroke="#EEEDE8" strokeWidth="0.5" />)}
            {[5, 10, 15, 20].map(g => <text key={g} x={pL - 4} y={y(g) + 3} textAnchor="end" fontSize="8" fill="#B4B2A9">{g}</text>)}
            <path d={path} fill="none" stroke="#378ADD" strokeWidth="1.5" />
            {d.map((p, i) => <g key={i}>
                <circle cx={x(i)} cy={y(p.v)} r={p.drop ? 4 : 2.5} fill={p.drop ? "#1D9E75" : (i === d.length - 2 ? "#E24B4A" : "#378ADD")} stroke="#fff" strokeWidth="1" />
                <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#888780">{p.m}</text>
                {(p.drop || i === d.length - 2) && <text x={x(i)} y={y(p.v) - 8} textAnchor="middle" fontSize="9" fontWeight="500" fill={p.drop ? "#085041" : "#A32D2D"}>{p.v}</text>}
            </g>)}
        </svg>
        <div style={{ marginTop: 6, borderRadius: 4, background: "#E1F5EE", border: "0.5px solid #A8D9C5", padding: "4px 8px", fontSize: 10, fontWeight: 500, color: "var(--c-green-deep)" }}>↓ First decrease in 7 months · early response</div>
    </div>;
}

// Right panel
export function RightPanel({ tab, onTab, onDragNote, collapsed, onToggle }) {
    const [tabs, setTabs] = useState(["Notes", "Labs", "Imaging"]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [addQuery, setAddQuery] = useState("");
    const availableModules = ["Pathology", "Genomics", "Vitals", "Flowsheets", "Timeline", "Care Guidelines", "WBC Count"].filter(m => m.toLowerCase().includes(addQuery.toLowerCase()) && !tabs.includes(m));
    const [draggedIdx, setDraggedIdx] = useState(null);
    const holdTimer = useRef(null);

    // Make sure the active tab is actually selected if a new one is pinned
    useEffect(() => {
        if (tab && !tabs.includes(tab)) setTabs([...tabs, tab]);
    }, [tab]);

    const handleHold = (t) => {
        holdTimer.current = setTimeout(() => {
            if (window.confirm(`Are you sure you want to remove the '${t}' module?`)) {
                const updated = tabs.filter(x => x !== t);
                setTabs(updated);
                if (tab === t) onTab(updated[0] || "");
            }
        }, 1500); // 1.5s hold (feels better than 3s in modern UX, but serves the same purpose)
    };
    const cancelHold = () => clearTimeout(holdTimer.current);

    const onDropTab = (idx) => {
        if (draggedIdx === null) return;
        const newTabs = [...tabs];
        const [moved] = newTabs.splice(draggedIdx, 1);
        newTabs.splice(idx, 0, moved);
        setTabs(newTabs);
        setDraggedIdx(null);
    };

    return <div className={`panel-side ${collapsed ? "collapsed" : ""}`}>
        {collapsed ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 24 }}>
                <div onClick={onToggle} style={{ cursor: "pointer", color: "var(--c-text-mute)", padding: 4 }}>{Icon.chevLeft({ s: 16 })}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--c-text-mute)" }}>
                    {tabs.map((t, i) => (
                        <div key={t} onClick={() => { onToggle && onToggle(); onTab(t); }} onPointerDown={() => handleHold(t)} onPointerUp={cancelHold} onPointerLeave={cancelHold} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            {t === "Notes" ? Icon.file({ s: 16 }) : t === "Labs" ? Icon.lab({ s: 16 }) : t === "Imaging" ? Icon.scan({ s: 16 }) : Icon.sparkle({ s: 16 })}
                            <span style={{ fontSize: 9, textAlign: "center", maxWidth: 50, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.substring(0, 4)}</span>
                        </div>
                    ))}
                    <div onClick={() => setShowAddPopup(true)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 8, position: "relative" }}>
                        {Icon.plus({ s: 16 })} <span style={{ fontSize: 9 }}>Add</span>
                        {showAddPopup && (
                            <div style={{ position: "absolute", top: 0, left: 32, width: 220, background: "#fff", border: "0.5px solid var(--c-border)", borderRadius: 10, boxShadow: "0 10px 20px rgba(0,0,0,0.15)", padding: 10, zIndex: 100, cursor: "default" }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--c-surface-alt)", padding: "4px 8px", borderRadius: 6, marginBottom: 8 }}>
                                    {Icon.search({ s: 12 })}
                                    <input autoFocus value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Search modules…" style={{ flex: 1, border: "none", background: "transparent", fontSize: 12, outline: "none", color: "var(--c-text)" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {availableModules.map(m =>
                                        <div key={m} onClick={() => { onToggle && onToggle(); onTab(m); setShowAddPopup(false); setAddQuery(""); }} style={{ padding: "8px 10px", fontSize: 12, cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, color: "var(--c-text)", background: "transparent" }}>
                                            <span style={{ color: "var(--c-blue)" }}>{Icon.plus({ s: 12 })}</span> {m}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 360, overflow: "hidden" }}>
                <div style={{ minHeight: 44, background: "var(--c-surface-warm)", borderBottom: "0.5px solid var(--c-border)", display: "flex", alignItems: "center", position: "relative" }}>
                    <div onClick={onToggle} style={{ position: "absolute", left: 8, zIndex: 10, cursor: "pointer", color: "var(--c-text-mute)", padding: 4 }}>{Icon.chevRight({ s: 16 })}</div>
                    <div style={{ flex: 1, display: "flex", marginLeft: 32, overflowX: "auto", scrollbarWidth: "none" }} className="hide-scroll">
                        {tabs.map((t, idx) =>
                            <div key={t}
                                draggable
                                onDragStart={(e) => { setDraggedIdx(idx); e.dataTransfer.setData("text/plain", ""); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onDropTab(idx)}
                                onPointerDown={() => handleHold(t)}
                                onPointerUp={cancelHold}
                                onPointerLeave={cancelHold}
                                onClick={() => onTab(t)}
                                style={{ flex: "0 0 auto", minWidth: 80, padding: "0 12px", height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: "grab", color: tab === t ? "var(--c-text)" : "var(--c-text-mute)", background: tab === t ? "#fff" : "transparent", borderBottom: tab === t ? "2px solid var(--c-blue)" : "none", opacity: draggedIdx === idx ? 0.5 : 1 }}>
                                {t === "Notes" ? Icon.file({ s: 12 }) : t === "Labs" ? Icon.lab({ s: 12 }) : t === "Imaging" ? Icon.scan({ s: 12 }) : Icon.sparkle({ s: 12 })}
                                {t}
                            </div>
                        )}
                        <div onClick={() => setShowAddPopup(!showAddPopup)} style={{ width: 44, flexShrink: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--c-text-mute)", borderBottom: "none", position: "relative" }}>
                            {Icon.plus({ s: 16 })}
                            {showAddPopup && (
                                <div style={{ position: "absolute", top: 48, right: 8, width: 220, background: "#fff", border: "0.5px solid var(--c-border)", borderRadius: 10, boxShadow: "0 10px 20px rgba(0,0,0,0.15)", padding: 10, zIndex: 100, cursor: "default" }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--c-surface-alt)", padding: "4px 8px", borderRadius: 6, marginBottom: 8 }}>
                                        {Icon.search({ s: 12 })}
                                        <input autoFocus value={addQuery} onChange={e => setAddQuery(e.target.value)} placeholder="Search modules…" style={{ flex: 1, border: "none", background: "transparent", fontSize: 12, outline: "none", color: "var(--c-text)" }} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {availableModules.map(m =>
                                            <div key={m} onClick={() => { onTab(m); setShowAddPopup(false); setAddQuery(""); }} style={{ padding: "8px 10px", fontSize: 12, cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, color: "var(--c-text)", background: "transparent" }}>
                                                <span style={{ color: "var(--c-blue)" }}>{Icon.plus({ s: 12 })}</span> {m}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="scroll" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                    {showAddPopup && <div style={{ position: "absolute", inset: 0, zIndex: 90 }} onClick={() => setShowAddPopup(false)} />}
                    {tab === "Notes" && <NotesTab onDragNote={onDragNote} />}
                    {tab === "Labs" && <LabsTab />}
                    {tab === "Imaging" && <ImagingTab />}
                    {!defaultTabs.includes(tab) && (
                        <div style={{ padding: 40, textAlign: "center", color: "var(--c-text-mute)", fontSize: 13 }}>
                            <div style={{ marginBottom: 10, opacity: 0.5 }}>{Icon.sparkle({ s: 24 })}</div>
                            <b>{tab}</b> module successfully pinned.<br />Patient history is synchronizing...
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>;
}

function NotesTab({ onDragNote }) {
    const [f, setF] = useState("All");
    const [q, setQ] = useState("");
    const chips = ["All", "PSA", "Recent", "Oncology", "Urology", "Radiology", "ER", "Lab"];
    const notes = data.notes.filter(n => {
        if (f === "All") return true; if (f === "Recent") return /Apr/i.test(n.date);
        if (f === "PSA") return /PSA|CRPC/.test(n.preview + n.type);
        return n.dept === f;
    }).filter(n => !q || (n.type + n.preview + n.author).toLowerCase().includes(q.toLowerCase()));

    return <div>
        <div style={{ padding: "8px 10px", display: "flex", gap: 4, alignItems: "center", borderBottom: "0.5px solid var(--c-border-faint)" }}>
            <div style={{ flex: 1, height: 28, borderRadius: 7, background: "var(--c-surface-alt)", display: "flex", alignItems: "center", gap: 6, padding: "0 10px", fontSize: 12 }}>
                {Icon.search({ s: 12 })}
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes…" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 12 }} />
            </div>
            <div style={{ width: 30, height: 28, borderRadius: 7, background: "var(--c-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-mute)" }}>{Icon.filter({ s: 14 })}</div>
        </div>
        <div style={{ padding: "6px 10px", background: "var(--c-surface-alt)", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {chips.map(c => <span key={c} onClick={() => setF(c)} style={{ padding: "3px 7px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", border: "0.5px solid " + (f === c ? "var(--c-blue)" : "var(--c-border)"), background: f === c ? "var(--c-blue-150)" : "#fff", color: f === c ? "var(--c-blue-deep)" : "var(--c-text-mute)" }}>{c}</span>)}
        </div>
        {notes.map(n => <NoteRow key={n.id} n={n} onDragNote={onDragNote} />)}
        <div style={{ padding: "10px 12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary lg" style={{ width: "100%" }}>Edit Note</button>
            <button className="btn btn-ghost lg" style={{ width: "100%" }}>+ Add Note</button>
        </div>
    </div>;
}

function NoteRow({ n, onDragNote }) {
    const dt = { Oncology: "purple", Radiology: "blue", Urology: "blue", Lab: "green", ER: "red", Pharmacy: "amber", "Primary Care": "neutral" }[n.dept] || "neutral";
    return <div draggable
        onDragStart={e => { e.dataTransfer.setData("application/json", JSON.stringify({ kind: "note", id: n.id, label: n.type })); e.currentTarget.classList.add("dragging"); }}
        onDragEnd={e => e.currentTarget.classList.remove("dragging")}
        style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", gap: 8, cursor: "grab", background: n.pinned ? "#FBFCFE" : "#fff" }}>
        <span style={{ color: "var(--c-text-ghost)", marginTop: 3 }}>{Icon.drag({ s: 12 })}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <Chip tone={dt} size="sm">{n.dept}</Chip>
                <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.type}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--c-text-faint)", marginBottom: 4 }}>{n.author}{n.cosign ? ` · ${n.cosign}` : ""} · {n.date}</div>
            <div style={{ fontSize: 11, color: "var(--c-text-mute)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.preview}</div>
            <div style={{ marginTop: 8 }}><span className="micro" onClick={() => onDragNote && onDragNote({ kind: "note", id: n.id, label: n.type })}>+ Add to chat</span></div>
        </div>
    </div>;
}

function LabsTab() {
    const { labsCBC, labsPSA } = data;
    return <div>
        <div style={{ padding: "10px 12px" }}>
            <div className="label-xs" style={{ marginBottom: 6 }}>CBC · {labsCBC.date}</div>
            <LabTable rows={labsCBC.rows} />
            <div className="label-xs" style={{ marginTop: 16, marginBottom: 6 }}>PSA + HORMONAL · {labsPSA.date}</div>
            <LabTable rows={labsPSA.rows} />
            <div style={{ marginTop: 10, borderRadius: 6, background: "#E1F5EE", border: "0.5px solid #A8D9C5", padding: "8px 10px", fontSize: 11, color: "var(--c-green-deep)" }}><b>↓ Trend:</b> PSA 18.4 → 16.2. First response since Enzalutamide start.</div>
        </div>
        <div style={{ padding: "10px 12px 14px" }}><button className="btn btn-ghost lg" style={{ width: "100%" }}>+ Add to chat</button></div>
    </div>;
}

function LabTable({ rows }) {
    return <div style={{ border: "0.5px solid var(--c-border-faint)", borderRadius: 7, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 18px", padding: "6px 10px", background: "var(--c-surface-alt)", fontSize: 10, color: "var(--c-text-mute)", fontWeight: 500 }}>
            <div>TEST</div><div>RESULT</div><div>REFERENCE</div><div />
        </div>
        {rows.map((r, i) => {
            const c = r.tone === "high" ? "var(--c-red-deep)" : r.tone === "low" ? "var(--c-amber-deep)" : "var(--c-text)";
            return <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 18px", padding: "7px 10px", fontSize: 11, borderTop: "0.5px solid var(--c-border-faint)", alignItems: "center" }}>
                <div><div style={{ fontWeight: 500 }}>{r.name}</div>{r.note && <div style={{ fontSize: 10, color: "var(--c-green-deep)", marginTop: 2 }}>{r.note}</div>}</div>
                <div style={{ color: c, fontWeight: 500 }}>{r.v} <span style={{ color: "var(--c-text-faint)", fontWeight: 400, fontSize: 10 }}>{r.unit}</span></div>
                <div style={{ color: "var(--c-text-mute)", fontSize: 10 }}>{r.ref}</div>
                <div>{r.flag && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 4, background: r.tone === "high" ? "#FCEBEB" : "#FDF4E5", fontSize: 9, fontWeight: 500, color: c }}>{r.flag}</span>}</div>
            </div>;
        })}
    </div>;
}

function ImagingTab() {
    return <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {data.imaging.map(im => <div key={im.id} style={{ border: "0.5px solid var(--c-border-faint)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: 88, background: "linear-gradient(135deg,#E8EFF7,#D4E1F0)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="22" stroke="#0C447C" strokeOpacity=".4" strokeWidth="1.5" fill="#0C447C" fillOpacity=".08" /></svg>
                <div style={{ position: "absolute", top: 6, left: 8 }}><Chip tone="blue" size="sm">{im.dept}</Chip></div>
            </div>
            <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{im.type}</div>
                <div style={{ fontSize: 10, color: "var(--c-text-faint)", marginBottom: 8 }}>{im.date} · {im.author}</div>
                <div className="label-xs" style={{ marginBottom: 2 }}>FINDINGS</div>
                <div style={{ fontSize: 11, lineHeight: 1.45, marginBottom: 8 }}>{im.findings}</div>
                <div className="label-xs" style={{ marginBottom: 2 }}>IMPRESSION</div>
                <div style={{ fontSize: 11, lineHeight: 1.45, marginBottom: 8 }}>{im.impression}</div>
                <div style={{ background: "#EDF3FB", border: "0.5px solid #C4D9F0", borderRadius: 6, padding: "6px 8px", fontSize: 11, color: "var(--c-blue-deep)" }}><b>Note:</b> {im.note}</div>
            </div>
        </div>)}
    </div>;
}
