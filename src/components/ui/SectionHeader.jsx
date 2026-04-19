import React from "react";
import { Icon } from "./Icon";

export function SectionHeader({ label, right, collapsed, onToggle, tone }) {
    return (
        <div style={{
            height: 32, padding: "0 16px",
            background: tone === "blue" ? "#D4E8F9" : "var(--c-surface-alt)",
            borderBottom: "0.5px solid " + (tone === "blue" ? "#C4D9F0" : "var(--c-border-soft)"),
            display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
            <span className="label-xs" style={{ color: tone === "blue" ? "var(--c-text)" : "var(--c-text-mute)" }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {right}
                {onToggle && (
                    <span onClick={onToggle} style={{ cursor: "pointer", color: "var(--c-text-faint)", display: "flex" }}>
                        {collapsed ? Icon.plus({ s: 12 }) : Icon.minus({ s: 12 })}
                    </span>
                )}
            </div>
        </div>
    );
}
