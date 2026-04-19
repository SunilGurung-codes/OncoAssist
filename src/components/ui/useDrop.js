import React, { useState } from "react";

export function useDrop(onDrop) {
    const [over, setOver] = useState(false);
    return {
        over,
        props: {
            onDragOver: (e) => { e.preventDefault(); setOver(true); },
            onDragLeave: () => setOver(false),
            onDrop: (e) => {
                e.preventDefault(); setOver(false);
                try { const d = JSON.parse(e.dataTransfer.getData("application/json")); onDrop && onDrop(d); } catch { }
            }
        }
    };
}
