import React, { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function TopBar({ active = "My Patients", onNav, variant = "compact", theme, toggleTheme }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showAccessibility, setShowAccessibility] = useState(false);
    const [a11y, setA11y] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("oa_accessibility") || "{}");
            return {
                fontScale: saved.fontScale || (saved.largeText ? "lg" : "md"),
                highContrast: Boolean(saved.highContrast),
                colorBlindMode: saved.colorBlindMode || "none",
                reduceMotion: Boolean(saved.reduceMotion),
                dyslexiaFont: Boolean(saved.dyslexiaFont)
            };
        } catch {
            return {
                fontScale: "md",
                highContrast: false,
                colorBlindMode: "none",
                reduceMotion: false,
                dyslexiaFont: false
            };
        }
    });
    const h = variant === "dashboard" ? 52 : 48;
    const themeTooltip = theme === "dark" ? "Light mode" : "Dark mode";

    useEffect(() => {
        localStorage.setItem("oa_accessibility", JSON.stringify(a11y));
        document.documentElement.classList.toggle("oa-a11y-high-contrast", a11y.highContrast);
        document.documentElement.classList.toggle("oa-a11y-reduce-motion", a11y.reduceMotion);
        document.documentElement.classList.toggle("oa-a11y-dyslexia-font", a11y.dyslexiaFont);
        document.documentElement.classList.toggle("oa-a11y-font-md", a11y.fontScale === "md");
        document.documentElement.classList.toggle("oa-a11y-font-lg", a11y.fontScale === "lg");
        document.documentElement.classList.toggle("oa-a11y-font-xl", a11y.fontScale === "xl");
        document.documentElement.classList.toggle("oa-a11y-colorblind-deuteranopia", a11y.colorBlindMode === "deuteranopia");
        document.documentElement.classList.toggle("oa-a11y-colorblind-protanopia", a11y.colorBlindMode === "protanopia");
        document.documentElement.classList.toggle("oa-a11y-colorblind-tritanopia", a11y.colorBlindMode === "tritanopia");
    }, [a11y]);

    const toggleSetting = (key) => setA11y((current) => ({ ...current, [key]: !current[key] }));
    const setFontScale = (fontScale) => setA11y((current) => ({ ...current, fontScale }));
    const setColorBlindMode = (colorBlindMode) => setA11y((current) => ({ ...current, colorBlindMode }));
    const menuWidth = 190;

    const profileMenu = (
        <div style={{ position: "absolute", top: 32, right: 0, width: menuWidth, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "6px 0", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", zIndex: 100 }}>
            <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>Settings</div>
            <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>Notifications</div>
            <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>Preferences</div>
            <div style={{ padding: "8px 14px", fontSize: 13, color: "var(--c-text-strong)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }} onClick={(e) => { e.stopPropagation(); setShowAccessibility(true); setShowMenu(false); }}>
                <span>Accessibility</span>
                <span style={{ color: "var(--c-text-ghost)" }}>›</span>
            </div>
            <div style={{ height: 1, background: "var(--c-border-faint)", margin: "4px 0" }} />
            <div style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "var(--c-red-deep)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); localStorage.clear(); window.location.reload(); }}>Sign Out</div>
        </div>
    );

    const accessibilityModal = showAccessibility ? (
        <>
            <div
                style={{ position: "fixed", inset: 0, background: "rgba(19, 25, 33, 0.18)", zIndex: 180 }}
                onClick={() => setShowAccessibility(false)}
            />
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 700,
                maxWidth: "calc(100vw - 32px)",
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: 14,
                boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
                zIndex: 181,
                overflow: "hidden"
            }}>
                <div style={{ padding: "16px 18px", borderBottom: "0.5px solid var(--c-border-faint)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--c-text-strong)" }}>Accessibility settings</div>
                        <div style={{ fontSize: 13, color: "var(--c-text-mute)", marginTop: 4 }}>Adjust readability and motion across the workspace.</div>
                    </div>
                    <button className="btn btn-ghost sm" onClick={() => setShowAccessibility(false)}>Close</button>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 22 }}>
                    <A11ySettingRow
                        label="High Contrast"
                        control={
                            <A11yPillToggle
                                checked={a11y.highContrast}
                                onChange={() => toggleSetting("highContrast")}
                            />
                        }
                    />
                    <A11ySettingRow
                        label="Font Size"
                        control={
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
                                <A11yChoiceButton active={a11y.fontScale === "md"} onClick={() => setFontScale("md")}>A</A11yChoiceButton>
                                <A11yChoiceButton active={a11y.fontScale === "lg"} onClick={() => setFontScale("lg")}>A+</A11yChoiceButton>
                                <A11yChoiceButton active={a11y.fontScale === "xl"} onClick={() => setFontScale("xl")}>A++</A11yChoiceButton>
                            </div>
                        }
                    />
                    <A11ySettingRow
                        label="Color Blind Mode"
                        control={
                            <select
                                value={a11y.colorBlindMode}
                                onChange={(e) => setColorBlindMode(e.target.value)}
                                style={{
                                    width: "100%",
                                    border: "1.5px solid var(--c-blue)",
                                    borderRadius: 16,
                                    background: "var(--c-surface)",
                                    color: "var(--c-text-strong)",
                                    padding: "16px 18px",
                                    fontSize: 16,
                                    lineHeight: 1.2,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    appearance: "auto"
                                }}
                            >
                                <option value="none">None</option>
                                <option value="deuteranopia">Deuteranopia assist</option>
                                <option value="protanopia">Protanopia assist</option>
                                <option value="tritanopia">Tritanopia assist</option>
                            </select>
                        }
                    />
                    <A11ySettingRow
                        label="Reduced Motion"
                        control={
                            <A11yPillToggle
                                checked={a11y.reduceMotion}
                                onChange={() => toggleSetting("reduceMotion")}
                            />
                        }
                    />
                    <A11ySettingRow
                        label="Dyslexia-Friendly Font"
                        control={
                            <A11yPillToggle
                                checked={a11y.dyslexiaFont}
                                onChange={() => toggleSetting("dyslexiaFont")}
                            />
                        }
                    />
                </div>
            </div>
        </>
    ) : null;

    return (
        <>
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
                        <div className="has-tooltip" data-tooltip={themeTooltip} style={{ color: "var(--c-text-mute)", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={toggleTheme}>
                            {theme === "dark" ? Icon.sun({ s: 14 }) : Icon.moon({ s: 14 })}
                        </div>
                    )}
                    <div className="avatar" style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowMenu(!showMenu)}>
                        XY
                        {showMenu && profileMenu}
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {toggleTheme && (
                        <div className="has-tooltip" data-tooltip={themeTooltip} style={{ color: "var(--c-text-mute)", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={toggleTheme}>
                            {theme === "dark" ? Icon.sun({ s: 14 }) : Icon.moon({ s: 14 })}
                        </div>
                    )}
                    <span style={{ fontSize: 11, color: "var(--c-text-strong)" }}>Dr. XYZ</span>
                    <div className="avatar" style={{ cursor: "pointer", position: "relative" }} onClick={() => setShowMenu(!showMenu)}>
                        XY
                        {showMenu && profileMenu}
                    </div>
                </div>
            )}
        </div>
        {accessibilityModal}
        </>
    );
}

function A11ySettingRow({ label, control }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 24, alignItems: "center" }}>
            <div style={{ fontSize: 16, lineHeight: 1.3, fontWeight: 600, color: "var(--c-text-strong)" }}>{label}</div>
            <div>{control}</div>
        </div>
    );
}

function A11yPillToggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={onChange}
            style={{
                width: 132,
                padding: "12px 20px",
                borderRadius: 14,
                border: "1px solid var(--c-border)",
                background: checked ? "var(--c-blue)" : "var(--c-surface)",
                color: checked ? "#fff" : "var(--c-text-strong)",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
        >
            {checked ? "On" : "Off"}
        </button>
    );
}

function A11yChoiceButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                border: `1px solid ${active ? "var(--c-blue)" : "var(--c-border)"}`,
                background: active ? "var(--c-blue)" : "var(--c-surface)",
                color: active ? "#fff" : "var(--c-text-strong)",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
        >
            {children}
        </button>
    );
}
