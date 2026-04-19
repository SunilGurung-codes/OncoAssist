import React from "react";

export function Chip({ tone = "neutral", size, children, onClick, style }) {
    const cls = `chip ${size === "sm" ? "sm" : ""} ${size === "xs" ? "xs" : ""} chip-${tone}`;
    return <span className={cls} onClick={onClick} style={style}>{children}</span>;
}
