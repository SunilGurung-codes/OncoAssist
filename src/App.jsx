import React, { useState, useEffect } from "react";
import { LoginScreen } from "./screens/LoginScreen.jsx";
import { DashboardScreen } from "./screens/DashboardScreen.jsx";
import { InitialScreen } from "./screens/InitialScreen.jsx";
import { ReviewScreen } from "./screens/ReviewScreen.jsx";
import { CopilotScreen } from "./screens/CopilotScreen.jsx";

export default function App() {
    const [screen, setScreen] = useState(() => localStorage.getItem("oa_screen") || "login");
    const [theme, setTheme] = useState(() => localStorage.getItem("oa_theme") || "light");

    useEffect(() => {
        localStorage.setItem("oa_screen", screen);
    }, [screen]);

    useEffect(() => {
        localStorage.setItem("oa_theme", theme);
        if (theme === "dark") {
            document.documentElement.classList.add("dark-theme");
        } else {
            document.documentElement.classList.remove("dark-theme");
        }
    }, [theme]);

    useEffect(() => {
        const r = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (!w || !h) return;
            const s = Math.min(w / 1440, h / 900);
            document.documentElement.style.setProperty("--scale", s);
        };
        r();
        requestAnimationFrame(r);
        window.addEventListener("resize", r);
        return () => window.removeEventListener("resize", r);
    }, []);

    const nav = s => setScreen(s);
    const tabFromScreen = { notes: "Notes", labs: "Labs", imaging: "Imaging" }[screen];

    const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

    let content;
    if (screen === "login") content = <LoginScreen onLogin={() => nav("dashboard")} />;
    else if (screen === "dashboard") content = <DashboardScreen onOpen={() => nav("initial")} theme={theme} toggleTheme={toggleTheme} />;
    else if (screen === "initial") content = <InitialScreen onNav={nav} onEnterNotes={() => nav("notes")} theme={theme} toggleTheme={toggleTheme} />;
    else if (screen === "review") content = <ReviewScreen onNav={nav} theme={theme} toggleTheme={toggleTheme} />;
    else content = <CopilotScreen onNav={nav} initialTab={tabFromScreen} theme={theme} toggleTheme={toggleTheme} />;

    return <div className="viewport">{content}</div>;
}
