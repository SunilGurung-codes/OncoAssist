import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../components/ui/Icon.jsx";

const DEMO_USERNAME = "onco";
const DEMO_PASSWORD = "onco";
const CREDENTIAL_REPLACEMENT_DELAY_MS = 300;
const AUTHENTICATION_DELAY_MS = 1500;

export function LoginScreen({ onLogin }) {
    const [usr, setUsr] = useState(DEMO_USERNAME);
    const [pwd, setPwd] = useState(DEMO_PASSWORD);
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);
    const showLoadingTimer = useRef(null);
    const loginTimer = useRef(null);

    useEffect(() => {
        return () => {
            clearTimeout(showLoadingTimer.current);
            clearTimeout(loginTimer.current);
        };
    }, []);

    const completeLogin = (event) => {
        event?.preventDefault();
        if (submittingRef.current) return;

        submittingRef.current = true;
        setError(false);
        setSubmitting(true);
        setUsr(DEMO_USERNAME);
        setPwd(DEMO_PASSWORD);

        showLoadingTimer.current = setTimeout(() => {
            setLoading(true);
            loginTimer.current = setTimeout(() => {
                onLogin();
            }, AUTHENTICATION_DELAY_MS);
        }, CREDENTIAL_REPLACEMENT_DELAY_MS);
    };

    if (loading) {
        return (
            <div data-screen-label="00 Login" style={{ background: "var(--c-surface)", display: "flex", flexDirection: "column", height: "100vh", width: "100vw", alignItems: "center", justifyContent: "center" }}>
                <style>{`
                 @keyframes spin { 100% { transform: rotate(360deg); } }
               `}</style>
                <div style={{ width: 48, height: 48, borderRadius: 24, border: "3px solid #D4E8F9", borderTopColor: "#0A4693", animation: "spin 1s linear infinite", marginBottom: 24 }} />
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--c-text-strong)" }}>Authenticating...</div>
                <div style={{ fontSize: 14, color: "var(--c-text-mute)", marginTop: 8 }}>Loading your workspace and patient list</div>
            </div>
        );
    }

    return (
        <div className="login-container" data-screen-label="00 Login">
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    80%, 100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>

            {/* Absolute Top Left Logo */}
            <div className="login-brand" style={{ position: "absolute", top: 24, left: 32, right: 24, maxWidth: "min(42vw, 760px)", zIndex: 2 }}>
                <img
                    src="/images/OncoLogo.png"
                    alt="OncoAssist"
                    style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: 132,
                        objectFit: "contain",
                        objectPosition: "left center",
                        display: "block"
                    }}
                />
            </div>

            {/* Center Box */}
            <div className="login-card">

                {/* Left side (Form) */}
                <div className="login-left">
                    <div style={{ fontSize: 32, fontWeight: 500, color: "var(--c-text-strong)", marginBottom: 16, letterSpacing: "-0.5px", marginTop: 18 }}>Sign in to your workstation</div>
                    <div style={{ fontSize: 16, color: "var(--c-text-mute)", marginBottom: 40, lineHeight: 1.55, paddingRight: 20 }}>Use your Onco Clinic network credentials. You'll be redirected to your patient dashboard.</div>

                    <form onSubmit={completeLogin}>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--c-text-strong)" }}>Onco ID / Username</div>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 16, top: 14, color: "var(--c-text-ghost)" }}>{Icon.user({ s: 20 })}</span>
                                <input value={usr} onChange={e => setUsr(e.target.value)} disabled={submitting} style={{ width: "100%", height: 48, borderRadius: 8, border: "1px solid var(--c-border)", padding: "0 10px 0 46px", fontSize: 16, outline: "none", color: "var(--c-text)", background: "var(--c-surface)" }} placeholder="e.g. x.provider" aria-label="Onco ID or username" />
                            </div>
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--c-text-strong)" }}>Password</div>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 16, top: 14, color: "var(--c-text-ghost)" }}>{Icon.lock({ s: 20 })}</span>
                                <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} disabled={submitting} style={{ width: "100%", height: 48, borderRadius: 8, border: "1px solid var(--c-border)", padding: "0 46px 0 46px", fontSize: 16, outline: "none", color: "var(--c-text)", background: "var(--c-surface)" }} placeholder="••••••••" aria-label="Password" />
                                <span style={{ position: "absolute", right: 16, top: 14, color: "var(--c-text-ghost)", cursor: "pointer" }}>{Icon.eye({ s: 20 })}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 40 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "var(--c-text-mute)", cursor: "pointer", marginBottom: 16 }}>
                                <input type="checkbox" defaultChecked disabled={submitting} style={{ accentColor: "var(--c-blue-deep)", width: 16, height: 16 }} />
                                Keep me signed in on this workstation
                            </label>
                            <div style={{ fontSize: 15, color: "var(--c-blue-deep)", fontWeight: 600, cursor: "pointer" }}>Forgot password?</div>
                        </div>

                        {error && <div style={{ color: "var(--c-red-deep)", fontSize: 15, marginBottom: 16, lineHeight: 1.45 }}>Please enter any username and password to continue.</div>}
                        <button type="submit" disabled={submitting} style={{ width: "100%", height: 52, borderRadius: 8, background: "var(--c-blue-deep)", color: "var(--c-surface)", fontSize: 16, fontWeight: 600, cursor: submitting ? "default" : "pointer", border: "none", opacity: submitting ? 0.86 : 1 }}>{submitting ? "Signing in..." : "Sign in"}</button>
                    </form>
                </div>

                {/* Right side (Tap/Scanner) */}
                <div className="login-right">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-mute)", letterSpacing: 0.5 }}>TAP-TO-SIGN-IN</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--c-blue-50)", borderRadius: 14, color: "var(--c-blue-deep)", fontSize: 13, fontWeight: 600 }}>
                            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--c-blue-deep)" }} />
                            Scanning
                        </div>
                    </div>

                    <div style={{ fontSize: 24, fontWeight: 500, color: "var(--c-text-strong)", marginBottom: 12 }}>Tap your Onco ID badge</div>
                    <div style={{ fontSize: 16, color: "var(--c-text-mute)", lineHeight: 1.55, marginBottom: 40, paddingRight: 20 }}>Hold your badge against the reader on the right side of this workstation. OncoAssist will sign you in and load your patient list.</div>

                    {/* Scanner Animation Area (Solid white card) */}
                    <div onClick={() => { setUsr(DEMO_USERNAME); setPwd(DEMO_PASSWORD); }} style={{ flex: 1, minHeight: 250, background: "var(--c-surface)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(0,0,0,0.03)", border: "1px solid var(--c-border-faint)", cursor: "pointer", position: "relative", overflow: "hidden" }}>

                        {/* Concentric rings */}
                        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "1.5px solid var(--c-blue)", opacity: 0.2, animation: "pulse-ring 2s infinite ease-out" }} />
                            <div style={{ position: "absolute", width: "65%", height: "65%", borderRadius: "50%", border: "1.5px solid var(--c-blue)", opacity: 0.2, animation: "pulse-ring 2s infinite ease-out", animationDelay: "0.5s" }} />
                        </div>

                        {/* Doctor Badge UI Element */}
                        <div style={{ zIndex: 10, width: 56, height: 72, background: "var(--c-surface)", border: "1px solid var(--c-border-soft)", borderRadius: 6, padding: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", boxShadow: "0 6px 16px rgba(0,0,0,0.06)", marginBottom: 24 }}>
                            <div style={{ background: "var(--c-blue-deep)", color: "white", fontSize: 8, width: "100%", textAlign: "center", padding: "3px 0", borderRadius: 3 }}>Onco</div>
                            <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--c-blue-50)", color: "var(--c-blue-deep)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>XY</div>
                            <div style={{ fontSize: 6, color: "var(--c-text-soft)", textAlign: "center" }}>XYZ, MD</div>
                        </div>

                        <div style={{ zIndex: 20, fontWeight: 600, color: "var(--c-text-strong)", fontSize: 16 }}>Waiting for badge...</div>
                        <div style={{ zIndex: 20, marginTop: 4, color: "var(--c-text-soft)", fontSize: 13 }}>Reader: WS-7212-A · Exam Rm 4</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginTop: 40 }}>
                        <div style={{ width: 50, height: 60, background: "var(--c-surface)", border: "1px solid var(--c-border-soft)", borderRadius: 6, padding: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ background: "var(--c-blue-deep)", color: "white", fontSize: 6, width: "100%", textAlign: "center", padding: "2px 0", borderRadius: 2 }}>ONCO</div>
                            <div style={{ width: 18, height: 18, borderRadius: 9, background: "var(--c-blue-50)", color: "var(--c-blue-deep)", fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>XY</div>
                            <div style={{ fontSize: 5, color: "var(--c-text-mute)", textAlign: "center" }}>XYZ, MD</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-text-strong)", marginBottom: 6 }}>Don't have an NFC badge?</div>
                            <div style={{ fontSize: 14, color: "var(--c-text-mute)", lineHeight: 1.5 }}>Visit the Onco ID office (Gonda 2-200) or sign in with your password on the left.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absolute Bottom Footer - now hidden on small screens so it doesn't overlap */}
            <div className="footer-links" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 60px", fontSize: 12, color: "var(--c-text-soft)", display: "flex", justifyContent: "space-between", pointerEvents: "auto", background: "transparent", lineHeight: 1.45 }}>
                <style>{`
                  @media (max-width: 1024px) {
                    .footer-links { display: none !important; }
                  }
                `}</style>
                <div>© Onco Clinic · Authorized users only. Access is monitored and logged for HIPAA compliance.</div>
                <div style={{ display: "flex", gap: 24 }}>
                    <span style={{ cursor: "pointer" }}>Privacy</span>
                    <span style={{ cursor: "pointer" }}>Acceptable Use</span>
                    <span style={{ cursor: "pointer" }}>System status · All services operational</span>
                </div>
            </div>
        </div>
    );
}
