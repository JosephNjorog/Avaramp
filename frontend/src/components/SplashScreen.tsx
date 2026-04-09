"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem("avaramp-splash-shown")) {
      setPhase("done");
      return;
    }
    // enter → hold → exit → done
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1800);
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("avaramp-splash-shown", "1");
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0c0c0e 0%, #141420 50%, #0c0c0e 100%)",
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Radial glow behind logo */}
      <div style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,111,247,0.25) 0%, transparent 70%)",
        animation: "splashGlow 1.8s ease-in-out infinite alternate",
      }} />

      {/* Orbiting ring */}
      <div style={{
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: "50%",
        border: "1px solid rgba(124,111,247,0.3)",
        animation: "splashRing 2s linear infinite",
        opacity: phase === "enter" ? 0 : 1,
        transition: "opacity 0.4s ease 0.3s",
      }} />
      <div style={{
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: "50%",
        border: "1px solid rgba(124,111,247,0.15)",
        animation: "splashRing 3s linear infinite reverse",
        opacity: phase === "enter" ? 0 : 1,
        transition: "opacity 0.4s ease 0.5s",
      }} />

      {/* Logo container */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        transform: phase === "enter" ? "scale(0.7) translateY(20px)" : "scale(1) translateY(0)",
        opacity: phase === "enter" ? 0 : 1,
        transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
      }}>

        {/* Icon */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #1a1a2e, #7c6ff7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(124,111,247,0.5), 0 0 80px rgba(124,111,247,0.2)",
          animation: phase === "hold" ? "splashPulse 1.2s ease-in-out infinite" : "none",
        }}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
            <polygon
              points="13.5,2 8.5,13 12,13 10,22 15.5,11 12,11"
              fill="white"
              style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#f2f2f4",
            fontFamily: "system-ui, -apple-system, sans-serif",
            animation: phase === "hold" ? "splashText 0.5s ease forwards" : "none",
          }}>
            <span style={{ color: "#a78bfa" }}>Ava</span>Ramp
          </div>
          <div style={{
            fontSize: 13,
            color: "rgba(150,150,160,0.8)",
            letterSpacing: "0.12em",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 4,
            opacity: phase === "enter" ? 0 : 1,
            transform: phase === "enter" ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
          }}>
            CRYPTO TO FIAT · INSTANTLY
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute",
        bottom: 48,
        left: "50%",
        transform: "translateX(-50%)",
        width: 120,
        height: 2,
        borderRadius: 2,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          borderRadius: 2,
          background: "linear-gradient(90deg, #7c6ff7, #a78bfa)",
          width: phase === "enter" ? "0%" : phase === "hold" ? "70%" : "100%",
          transition: phase === "enter"
            ? "width 0.5s ease"
            : phase === "hold"
            ? "width 1.2s cubic-bezier(0.4,0,0.6,1)"
            : "width 0.4s ease",
        }} />
      </div>

      {/* Particle dots */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#7c6ff7",
          opacity: 0.4,
          top: `${20 + Math.sin(i * 1.05) * 35}%`,
          left: `${15 + (i * 14)}%`,
          animation: `splashFloat ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite alternate`,
        }} />
      ))}

      <style>{`
        @keyframes splashGlow {
          from { transform: scale(0.9); opacity: 0.6; }
          to   { transform: scale(1.1); opacity: 1; }
        }
        @keyframes splashRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes splashPulse {
          0%,100% { box-shadow: 0 0 40px rgba(124,111,247,0.5), 0 0 80px rgba(124,111,247,0.2); }
          50%      { box-shadow: 0 0 60px rgba(124,111,247,0.8), 0 0 120px rgba(124,111,247,0.3); }
        }
        @keyframes splashFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
        @keyframes splashText {
          from { opacity: 0.7; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
