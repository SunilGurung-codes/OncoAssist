import React, { useState, useEffect } from "react";
import { Icon } from "./Icon.jsx";

export function TextSelectionPopup({ onExplaining }) {
    const [rect, setRect] = useState(null);
    const [text, setText] = useState("");

    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.toString().trim() === "") {
                setRect(null);
                return;
            }

            const r = sel.getRangeAt(0).getBoundingClientRect();
            // Don't show if the selection box is invisible or extremely huge
            if (r.width === 0 || r.height === 0) return;

            setRect({
                x: r.x + r.width / 2,
                y: r.y
            });
            setText(sel.toString().trim());
        };

        document.addEventListener("selectionchange", handleSelection);
        return () => document.removeEventListener("selectionchange", handleSelection);
    }, []);

    if (!rect) return null;

    return (
        <div style={{
            position: "fixed",
            left: rect.x,
            top: rect.y - 10,
            transform: "translate(-50%, -100%)",
            background: "var(--c-surface-ivory)",
            border: "0.5px solid var(--c-border)",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            zIndex: 9999,
            pointerEvents: "auto",
            animation: "jumpIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
        }}>
            <button
                onClick={() => onExplaining && onExplaining(text)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px",
                    borderRadius: 12,
                    background: "var(--c-surface-alt)",
                    border: "0.5px solid var(--c-border-faint)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--c-text-strong)"
                }}
                className="hover-bg"
            >
                <div style={{ color: "var(--c-green)", display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </div>
                Ask OncoAssist
            </button>
            <div style={{ width: 1, height: 16, background: "var(--c-border-faint)", margin: "0 4px" }} />
            <button className="hover-bg" style={{ padding: "4px", borderRadius: 8, color: "var(--c-text)" }} title="Bold"><b>B</b></button>
            <button className="hover-bg" style={{ padding: "4px", borderRadius: 8, color: "var(--c-text)" }} title="Italic"><i>I</i></button>
            <button className="hover-bg" style={{ padding: "4px", borderRadius: 8, color: "var(--c-text)" }} title="Format">Aa</button>
            <style>{`
                @keyframes jumpIn {
                    from { opacity: 0; transform: translate(-50%, -80%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
                }
                .hover-bg:hover {
                    background: var(--c-border-faint) !important;
                }
            `}</style>
        </div>
    );
}
