import React, { useState } from "react";
import { Icon } from "./Icon";

export function TopBar({ active = "My Patients", onNav, variant = "compact", theme, toggleTheme }) {
    const [showMenu, setShowMenu] = useState(false);
    const h = variant === "dashboard" ? 52 : 48;
    return (
        <div className={"topbar " + (variant === "dashboard" ? "dashboard" : "")} style={{ height: h }}>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <div className="logo">
                    <div className="logo-mark">O</div>
                    OncoAssist
                </div>
                {variant === "dashboard" && (
                    <div className="search" style={{ marginLeft: 80 }}>
                        {Icon.search({ s: 14 })}
                        <span>Search patients by name, MRN, or ID…</span>
                    </div>
                )}
            </div>
            {variant === "dashboard" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 28, marginRight: 12 }}>
                    {["Dashboard", "My Patients", "Schedule", "Team"].map(n => (
                        <div key={n} className={"nav-link " + (n === active ? "active" : "")} onClick={() => onNav && onNav(n)}>{n}</div>
                    ))}
                    <div style={{ width: 1, height: 18, background: "var(--c-border-soft)" }} />
                    <div style={{ color: "var(--c-text-mute)" }}>{Icon.bell({ s: 14 })}</div>
                    {toggleTheme && (
                        <div style={{ color: "var(--c-text-mute)", cursor: "pointer" }} onClick={toggleTheme}>
                            {theme === "dark" ? Icon.sun({ s: 14 }) : Icon.moon({ s: 14 })}
                        </div>
                    )}
                    <div className="avatar" style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowMenu(!showMenu)}>
                        IR
                        {showMenu && (
                            <div style={{ position: "absolute", top: 32, right: 0, width: 140, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "6px 0", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", zIndex: 100 }}>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Settings</div>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Notifications</div>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Preferences</div>
                                <div style={{ height: 1, background: "var(--c-border-faint)", margin: "4px 0" }} />
                                <div style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--c-red-deep)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); localStorage.clear(); window.location.reload(); }}>Sign Out</div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {toggleTheme && (
                        <div style={{ color: "var(--c-text-mute)", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={toggleTheme}>
                            {theme === "dark" ? Icon.sun({ s: 14 }) : Icon.moon({ s: 14 })}
                        </div>
                    )}
                    <span style={{ fontSize: 11, color: "var(--c-text-strong)" }}>Dr. I. Riaz</span>
                    <div className="avatar" style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowMenu(!showMenu)}>
                        IR
                        {showMenu && (
                            <div style={{ position: "absolute", top: 32, right: 0, width: 140, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "6px 0", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", zIndex: 100 }}>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Settings</div>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Notifications</div>
                                <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}>Preferences</div>
                                <div style={{ height: 1, background: "var(--c-border-faint)", margin: "4px 0" }} />
                                <div style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--c-red-deep)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); localStorage.clear(); window.location.reload(); }}>Sign Out</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
