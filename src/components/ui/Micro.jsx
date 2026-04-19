import React from "react";

export function Micro({ icon, children, onClick, ghost }) {
    return (
        <span className={"micro " + (ghost ? "micro-ghost" : "")} onClick={onClick}>
            {icon}{children}
        </span>
    );
}
