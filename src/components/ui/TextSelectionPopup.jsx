import React, { useEffect, useRef, useState } from "react";

export function TextSelectionPopup({ onAsk }) {
    const [rect, setRect] = useState(null);
    const [text, setText] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [lockedRect, setLockedRect] = useState(null);
    const [lockedText, setLockedText] = useState("");
    const inputRef = useRef(null);
    const expandedRef = useRef(false);
    const openingRef = useRef(false);
    const openingTimeoutRef = useRef(null);

    useEffect(() => {
        expandedRef.current = expanded;
    }, [expanded]);

    useEffect(() => {
        const handleSelection = () => {
            if (expandedRef.current || openingRef.current) return;
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.toString().trim() === "") {
                setRect(null);
                setText("");
                setExpanded(false);
                setQuery("");
                return;
            }

            const range = sel.getRangeAt(0);
            const r = range.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;

            setRect({ x: r.x + r.width / 2, y: r.y });
            setText(sel.toString().trim());
        };

        document.addEventListener("selectionchange", handleSelection);
        return () => {
            document.removeEventListener("selectionchange", handleSelection);
            if (openingTimeoutRef.current) window.clearTimeout(openingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (expanded && inputRef.current) inputRef.current.focus();
    }, [expanded]);

    const preserveSelection = (e) => e.preventDefault();
    const openExpanded = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLockedRect(rect);
        setLockedText(text);
        openingRef.current = true;
        if (openingTimeoutRef.current) window.clearTimeout(openingTimeoutRef.current);
        openingTimeoutRef.current = window.setTimeout(() => {
            openingRef.current = false;
        }, 250);
        setExpanded(true);
    };
    const closeExpanded = () => {
        setExpanded(false);
        setQuery("");
        setLockedRect(null);
        setLockedText("");
        openingRef.current = false;
        if (openingTimeoutRef.current) window.clearTimeout(openingTimeoutRef.current);
    };
    const submit = () => {
        const trimmed = query.trim();
        if (!trimmed) return;
        if (onAsk) onAsk(lockedText || text, trimmed);
        setRect(null);
        setText("");
        setExpanded(false);
        setQuery("");
        setLockedRect(null);
        setLockedText("");
        openingRef.current = false;
        if (openingTimeoutRef.current) window.clearTimeout(openingTimeoutRef.current);
        window.getSelection()?.removeAllRanges();
    };

    const activeRect = expanded ? lockedRect : rect;
    const activeText = expanded ? lockedText : text;

    if (!activeRect || !activeText) return null;

    return (
        <>
            <style>{`
                @keyframes jumpIn {
                    from { opacity: 0; transform: translate(-50%, -80%) scale(0.95); }
                    to   { opacity: 1; transform: translate(-50%, -100%) scale(1); }
                }
                .tsp-btn:hover { background: var(--c-border-faint) !important; }
                .tsp-send:hover { opacity: 0.88; }
            `}</style>

            <div style={{
                position: "fixed",
                left: activeRect.x,
                top: activeRect.y - 10,
                transform: "translate(-50%, -100%)",
                background: "var(--c-surface-ivory)",
                border: "0.5px solid var(--c-border)",
                borderRadius: expanded ? 14 : 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
                zIndex: 9999,
                pointerEvents: "auto",
                animation: "jumpIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                overflow: "hidden",
                minWidth: expanded ? 260 : "auto",
            }}>
                {!expanded && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px" }}>
                        <button
                            className="tsp-btn"
                            onMouseDown={openExpanded}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "4px 8px", borderRadius: 12,
                                background: "var(--c-surface-alt)",
                                border: "0.5px solid var(--c-border-faint)",
                                fontSize: 12, fontWeight: 500, color: "var(--c-text-strong)"
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                            </svg>
                            Ask OncoAssist
                        </button>
                        <div style={{ width: 1, height: 16, background: "var(--c-border-faint)", margin: "0 2px" }} />
                        <button className="tsp-btn" onMouseDown={preserveSelection} style={{ padding: "4px 5px", borderRadius: 7, fontSize: 12, color: "var(--c-text)", fontWeight: 700 }}>B</button>
                        <button className="tsp-btn" onMouseDown={preserveSelection} style={{ padding: "4px 5px", borderRadius: 7, fontSize: 12, color: "var(--c-text)", fontStyle: "italic" }}>I</button>
                        <button className="tsp-btn" onMouseDown={preserveSelection} style={{ padding: "4px 5px", borderRadius: 7, fontSize: 12, color: "var(--c-text)" }}>Aa</button>
                    </div>
                )}

                {expanded && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}>
                        <span style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: "var(--c-blue)",
                            background: "var(--c-blue-50)",
                            borderRadius: 6,
                            padding: "2px 6px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            maxWidth: 92,
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {activeText}
                        </span>

                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submit();
                                if (e.key === "Escape") closeExpanded();
                            }}
                            placeholder="Ask a question…"
                            style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 13,
                                color: "var(--c-text)",
                                minWidth: 0
                            }}
                        />

                        <button
                            onClick={submit}
                            className="tsp-send"
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: query.trim() ? "var(--c-blue)" : "var(--c-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                cursor: query.trim() ? "pointer" : "default",
                                transition: "background 0.15s"
                            }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
