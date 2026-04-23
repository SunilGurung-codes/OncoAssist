import React, { useState } from "react";
import { data } from "../data.js";
import { Icon } from "../components/ui/Icon.jsx";
import { TopBar } from "../components/ui/TopBar.jsx";

export function DashboardScreen({ onOpen, theme, toggleTheme }) {
    const [filter, setFilter] = useState("All");

    const filters = [
        { k: "All", count: data.patients.length, tone: "neutral" },
        { k: "Urgent", count: data.patients.filter(p => p.statusColor === "red").length, tone: "red" },
        { k: "Review", count: data.patients.filter(p => p.statusColor === "amber").length, tone: "amber" },
        { k: "Stable", count: data.patients.filter(p => p.statusColor === "green").length, tone: "green" },
        { k: "New", count: data.patients.filter(p => p.statusColor === "blue").length, tone: "blue" }
    ];

    const filtered = filter === "All" ? data.patients : data.patients.filter(p => {
        if (filter === "Urgent") return p.statusColor === "red";
        if (filter === "Review") return p.statusColor === "amber";
        if (filter === "Stable") return p.statusColor === "green";
        if (filter === "New") return p.statusColor === "blue";
        return true;
    });

    return (
        <div className="stage" data-screen-label="01 Dashboard">
            <TopBar active="Dashboard" variant="dashboard" theme={theme} toggleTheme={toggleTheme} />

            {/* Greeting strip */}
            <div className="greeting-strip" style={{ padding: "24px 40px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                <div>
                    <div style={{ fontSize: 12, color: "var(--c-text-mute)", letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>FRIDAY · APR 17, 2026 · 08:42</div>
                    <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--c-text)" }}>Good morning, Dr. Riaz</div>
                    <div style={{ fontSize: 14, color: "var(--c-text-mute)", marginTop: 4, lineHeight: 1.45 }}>8 patients scheduled · 3 notes awaiting your co-sign · morning clinic starts at 09:00</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn lg btn-ghost">{Icon.filter({ s: 14 })} Filter</button>
                    <button className="btn lg btn-primary">+ Add Patient</button>
                </div>
            </div>

            <div className="screen-body">
                {/* Main */}
                <div className="panel-main" style={{ padding: "20px 40px 24px", gap: 20 }}>

                    {/* Stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                        <StatCard tone="red" label="Urgent attention" value="1" sub="James Park · CRPC f/u" />
                        <StatCard tone="amber" label="Pending labs" value="3" sub="Results expected today" />
                        <StatCard tone="blue" label="New referrals" value="1" sub="D. Nakamura · biopsy review" />
                        <StatCard tone="neutral" label="To co-sign" value="3" sub="Notes from Dr. Barker" />
                    </div>

                    {/* Patient list */}
                    <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
                        <div style={{ minHeight: 40, padding: "8px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, background: "var(--c-surface-alt)", borderBottom: "0.5px solid var(--c-border-faint)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                                {filters.map(f => (
                                    <span key={f.k} onClick={() => setFilter(f.k)} style={{
                                        padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                        color: filter === f.k ? "var(--c-text)" : "var(--c-text-mute)",
                                        background: filter === f.k ? "var(--c-surface)" : "transparent",
                                        border: "0.5px solid " + (filter === f.k ? "var(--c-border)" : "transparent")
                                    }}>{f.k} · {f.count}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--c-text-mute)" }}>Today · April 17</div>
                        </div>

                        <div className="scroll" style={{ overflowX: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ minWidth: 680, display: "flex", flexDirection: "column", flex: 1 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.5fr 0.9fr 0.7fr 120px", padding: "10px 16px", fontSize: 11, color: "var(--c-text-soft)", letterSpacing: "0.05em", fontWeight: 600, textTransform: "uppercase", borderBottom: "0.5px solid var(--c-border-faint)", background: "var(--c-surface-warm)" }}>
                                    <div>Patient</div><div>Diagnosis</div><div>Status</div><div>Time</div><div />
                                </div>

                                <div style={{ overflowY: "auto", flex: 1 }} className="scroll">
                                    {filtered.map((p, i) => (
                                        <PatientRow key={p.mrn} p={p} first={i === 0} onOpen={() => onOpen(p)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side */}
                <div className="panel-side scroll" style={{ padding: "20px 24px" }}>
                    <div className="label-xs" style={{ marginBottom: 10 }}>APRIL 2026</div>
                    <Calendar />

                    <div className="label-xs" style={{ marginTop: 24, marginBottom: 10 }}>ATTENTION</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ padding: "12px 12px", borderRadius: 8, background: "var(--c-red-100)", border: "0.5px solid var(--c-red-300)", fontSize: 12, color: "var(--c-red-deep)", lineHeight: 1.55, display: "flex", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--c-red)", marginTop: 5, flexShrink: 0 }} />
                            <div>James Park's PSA came in at 16.2 ng/mL — <b>first decrease in 7 months</b>. Review trajectory in today's 09:00 visit.</div>
                        </div>
                        <div style={{ padding: "12px 12px", borderRadius: 8, background: "var(--c-amber-100)", border: "0.5px solid var(--c-amber-300)", fontSize: 12, color: "var(--c-amber-text)", lineHeight: 1.55, display: "flex", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--c-amber)", marginTop: 5, flexShrink: 0 }} />
                            <div>3 notes from Dr. Barker awaiting your co-sign from yesterday's clinic.</div>
                        </div>
                    </div>

                    <div className="label-xs" style={{ marginTop: 24, marginBottom: 10 }}>TEAM TODAY</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[
                            { n: "Dr. S. Barker", r: "Fellow · Clinic", initials: "SB" },
                            { n: "Dr. M. Choi", r: "Urology · Consult", initials: "MC" },
                            { n: "Pharm. J. Alvarez", r: "Pharmacy on call", initials: "JA" }
                        ].map(m => (
                            <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="avatar">{m.initials}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.n}</div>
                                    <div style={{ fontSize: 12, color: "var(--c-text-mute)" }}>{m.r}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ tone, label, value, sub }) {
    const t = {
        red: { bg: "var(--c-red-100)", border: "var(--c-red-300)", val: "var(--c-red-deep)" },
        amber: { bg: "var(--c-amber-100)", border: "var(--c-amber-300)", val: "var(--c-amber-deep)" },
        blue: { bg: "var(--c-blue-100)", border: "var(--c-blue-250)", val: "var(--c-blue-deep)" },
        neutral: { bg: "var(--c-surface)", border: "var(--c-border)", val: "var(--c-text)" }
    }[tone];
    return (
        <div style={{ padding: "14px 16px", borderRadius: 10, background: t.bg, border: "0.5px solid " + t.border }}>
            <div className="label-xs" style={{ color: "var(--c-text-soft)", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: t.val, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: "var(--c-text-mute)", marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
        </div>
    );
}

function PatientRow({ p, first, onOpen }) {
    const statusColor = {
        red: { bg: "var(--c-red-100)", fg: "var(--c-red-deep)", border: "var(--c-red-300)" },
        amber: { bg: "var(--c-amber-100)", fg: "var(--c-amber-deep)", border: "var(--c-amber-300)" },
        green: { bg: "var(--c-green-100)", fg: "var(--c-green-deep)", border: "var(--c-green-300)" },
        blue: { bg: "var(--c-blue-100)", fg: "var(--c-blue-deep)", border: "var(--c-blue-250)" },
        neutral: { bg: "var(--c-surface-alt)", fg: "var(--c-text-strong)", border: "var(--c-border)" }
    }[p.statusColor];
    return (
        <div
            className={`patient-row ${p.primary ? "primary" : ""}`}
            onClick={onOpen}
            style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.5fr 0.9fr 0.7fr 120px",
                padding: "12px 16px",
                alignItems: "center",
                borderBottom: "0.5px solid var(--c-border-faint)",
                background: p.primary ? "var(--c-surface-alt)" : "var(--c-surface)",
                cursor: "pointer"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--c-avatar-ink)", border: "0.5px solid var(--c-avatar-border)" }}>{p.initials}</div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--c-text-mute)", lineHeight: 1.45 }}>{p.demo} · {p.mrn} · {p.type}</div>
                </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--c-text-strong)", lineHeight: 1.45, paddingRight: 12 }}>{p.dx}</div>
            <div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: statusColor.bg, color: statusColor.fg, border: "0.5px solid " + statusColor.border }}>
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: statusColor.fg }} /> {p.status}
                </span>
            </div>
            <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{p.time}</div>
            <div>
                <span className="btn btn-outline sm" onClick={(e) => { e.stopPropagation(); onOpen(); }}>Start session →</span>
            </div>
        </div>
    );
}

function Calendar() {
    const month = "April 2026";
    const today = 17;
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const visits = { 17: 5, 18: 0, 21: 4, 22: 3, 24: 2, 29: 1 };
    const pad = [2, 3, 4, 5, 6];
    const leading = 3;
    return (
        <div style={{ border: "0.5px solid var(--c-border-faint)", borderRadius: 10, padding: "14px 12px", background: "var(--c-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{month}</span>
                <div style={{ display: "flex", gap: 4, color: "var(--c-text-mute)" }}>
                    {Icon.chevLeft({ s: 12 })}{Icon.chevRight({ s: 12 })}
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, color: "var(--c-text-soft)", padding: "2px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {Array.from({ length: leading }).map((_, i) => <div key={"pad" + i} />)}
                {days.map(d => {
                    const isToday = d === today;
                    const v = visits[d];
                    return (
                        <div key={d} style={{
                            aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: isToday ? 600 : 500,
                            color: isToday ? "var(--c-surface)" : "var(--c-text)",
                            background: isToday ? "var(--c-blue)" : "transparent",
                            borderRadius: 6, position: "relative"
                        }}>
                            {d}
                            {v > 0 && !isToday && <span style={{ width: 3, height: 3, borderRadius: 2, background: "var(--c-blue)", marginTop: 1 }} />}
                            {v > 0 && isToday && <span style={{ fontSize: 9, opacity: .85 }}>{v}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
