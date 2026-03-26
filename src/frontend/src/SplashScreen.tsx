import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

const LETTERS = ["Q", "u", "i", "k", "L", "i", "v"];

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<"intro" | "text" | "tagline" | "exit">(
    "intro",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 500);
    const t2 = setTimeout(() => setPhase("tagline"), 1300);
    const t3 = setTimeout(() => setPhase("exit"), 2500);
    const t4 = setTimeout(() => {
      sessionStorage.setItem("splashShown", "1");
      onDone();
    }, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(150deg, oklch(0.09 0.015 265) 0%, oklch(0.12 0.022 250) 40%, oklch(0.11 0.018 255) 70%, oklch(0.08 0.012 270) 100%)",
        transition: phase === "exit" ? "opacity 0.6s ease" : "none",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes splashSlideUp {
          from { transform: translateY(32px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes splashPulseRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes splashLetterReveal {
          from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes splashFadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashRoadDash {
          from { stroke-dashoffset: 240; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes splashCarMove {
          0% { transform: translateX(-16px); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes splashGlowPulse {
          0%, 100% { box-shadow: 0 0 32px oklch(0.76 0.18 195 / 0.5), 0 0 64px oklch(0.76 0.18 195 / 0.2); }
          50% { box-shadow: 0 0 48px oklch(0.76 0.18 195 / 0.7), 0 0 96px oklch(0.76 0.18 195 / 0.35); }
        }
        .splash-icon-wrap {
          animation: splashSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .splash-icon-circle {
          animation: splashGlowPulse 2.5s ease-in-out infinite;
        }
        .splash-letter {
          display: inline-block;
          opacity: 0;
          animation: splashLetterReveal 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .splash-tagline {
          opacity: 0;
          animation: splashFadeInUp 0.65s ease forwards;
        }
        .splash-pulse-ring {
          animation: splashPulseRing 2s ease-out infinite;
        }
        .splash-road-dash {
          animation: splashRoadDash 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .splash-car-anim {
          animation: splashCarMove 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .splash-badge {
          opacity: 0;
          animation: splashFadeInUp 0.5s ease 0.2s forwards;
        }
      `}</style>

      {/* Icon area */}
      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        {/* Pulse rings */}
        {phase !== "intro" && (
          <>
            <div
              className="splash-pulse-ring"
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "2px solid oklch(0.76 0.18 195 / 0.5)",
              }}
            />
            <div
              className="splash-pulse-ring"
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "1.5px solid oklch(0.76 0.18 195 / 0.25)",
                animationDelay: "0.6s",
              }}
            />
          </>
        )}

        {/* Icon circle */}
        <div className="splash-icon-wrap" style={{ position: "relative" }}>
          <div
            className="splash-icon-circle"
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, oklch(0.76 0.18 195) 0%, oklch(0.65 0.22 205) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Car SVG */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              className="splash-car-anim"
              role="img"
              aria-label="Car icon"
            >
              <title>Car</title>
              <path
                d="M7 25h30l-4.5-9H11.5L7 25z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M5 25h34v5a2.5 2.5 0 01-2.5 2.5H7.5A2.5 2.5 0 015 30v-5z"
                fill="white"
              />
              <circle cx="12" cy="32" r="3" fill="oklch(0.65 0.22 205)" />
              <circle cx="32" cy="32" r="3" fill="oklch(0.65 0.22 205)" />
              <path
                d="M16 25V18h12v7"
                fill="oklch(0.76 0.18 195 / 0.3)"
                stroke="oklch(0.76 0.18 195 / 0.6)"
                strokeWidth="0.5"
              />
              <rect
                x="3"
                y="27"
                width="5"
                height="2"
                rx="1"
                fill="oklch(0.95 0.1 90 / 0.9)"
              />
              <rect
                x="36"
                y="27"
                width="5"
                height="2"
                rx="1"
                fill="oklch(0.65 0.19 25 / 0.9)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Road line */}
      <svg
        width="140"
        height="16"
        viewBox="0 0 140 16"
        role="img"
        aria-label="Road"
        style={{
          marginBottom: 28,
          opacity: phase !== "intro" ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s",
        }}
      >
        <title>Road</title>
        <line
          x1="0"
          y1="8"
          x2="140"
          y2="8"
          stroke="oklch(0.95 0.006 220 / 0.1)"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="8"
          x2="140"
          y2="8"
          stroke="oklch(0.76 0.18 195 / 0.75)"
          strokeWidth="2"
          strokeDasharray="240"
          strokeDashoffset="0"
          className="splash-road-dash"
        />
        {[20, 55, 90].map((x) => (
          <line
            key={x}
            x1={x}
            y1="8"
            x2={x + 14}
            y2="8"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="10 8"
            opacity="0.4"
          />
        ))}
      </svg>

      {/* QuikLiv title */}
      <div style={{ marginBottom: 14 }}>
        {phase !== "intro" && (
          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "white",
              lineHeight: 1,
              fontFamily:
                "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {LETTERS.map((letter, i) => (
              <span
                key={letter + String(i)}
                className="splash-letter"
                style={{
                  animationDelay: `${i * 0.065}s`,
                  color: i >= 4 ? "oklch(0.76 0.18 195)" : "white",
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        )}
      </div>

      {/* Tagline */}
      {(phase === "tagline" || phase === "exit") && (
        <>
          <p
            className="splash-tagline"
            style={{
              color: "oklch(0.76 0.18 195 / 0.9)",
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              marginBottom: 16,
            }}
          >
            Smart Traffic · Smarter Timing
          </p>
          <div
            className="splash-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid oklch(0.76 0.18 195 / 0.3)",
              background: "oklch(0.76 0.18 195 / 0.1)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "oklch(0.76 0.18 195)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: "oklch(0.76 0.18 195 / 0.85)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Time It Right. Arrive Chill.
            </span>
          </div>
        </>
      )}

      {/* Bottom progress dots */}
      <div
        style={{ position: "absolute", bottom: 44, display: "flex", gap: 8 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? 24 : 7,
              height: 7,
              borderRadius: 999,
              background:
                i === 0 ? "oklch(0.76 0.18 195)" : "oklch(0.76 0.18 195 / 0.2)",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
