import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

const LETTERS = ["Q", "u", "i", "k", "L", "i", "v"];
const DOTS = ["dot-a", "dot-b", "dot-c"];

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<"intro" | "text" | "tagline" | "exit">(
    "intro",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("tagline"), 1400);
    const t3 = setTimeout(() => setPhase("exit"), 2600);
    const t4 = setTimeout(() => {
      sessionStorage.setItem("splashShown", "1");
      onDone();
    }, 3200);
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
          "linear-gradient(135deg, #050e1a 0%, #0a1f35 40%, #0d2d4a 70%, #0a2240 100%)",
        transition: phase === "exit" ? "opacity 0.6s ease" : "none",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes splashPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes letterReveal {
          from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes roadDash {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes carMove {
          0% { transform: translateX(-8px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .splash-icon {
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .splash-letter {
          display: inline-block;
          opacity: 0;
          animation: letterReveal 0.4s ease forwards;
        }
        .splash-tagline {
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }
        .splash-pulse-ring {
          animation: splashPulseRing 1.8s ease-out infinite;
        }
        .road-dash {
          animation: roadDash 1.2s ease forwards;
        }
        .car-anim {
          animation: carMove 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Icon area */}
      <div
        style={{
          position: "relative",
          width: 100,
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        {/* Pulse rings */}
        {phase !== "intro" && (
          <>
            <div
              className="splash-pulse-ring"
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid rgba(56, 189, 248, 0.5)",
              }}
            />
            <div
              className="splash-pulse-ring"
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid rgba(56, 189, 248, 0.3)",
                animationDelay: "0.5s",
              }}
            />
          </>
        )}

        {/* Icon circle */}
        <div
          className="splash-icon"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 0 32px rgba(14, 165, 233, 0.5), 0 0 64px rgba(14, 165, 233, 0.2)",
          }}
        >
          {/* Car SVG */}
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            className="car-anim"
            role="img"
            aria-label="Car icon"
          >
            <title>Car</title>
            <path d="M6 22h26l-4-8H10L6 22z" fill="white" fillOpacity="0.95" />
            <path d="M4 22h30v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" fill="white" />
            <circle cx="10" cy="28" r="2.5" fill="#0ea5e9" />
            <circle cx="28" cy="28" r="2.5" fill="#0ea5e9" />
            <path
              d="M14 22V16h10v6"
              fill="rgba(14,165,233,0.3)"
              stroke="rgba(14,165,233,0.6)"
              strokeWidth="0.5"
            />
            <rect
              x="3"
              y="24"
              width="4"
              height="1.5"
              rx="0.75"
              fill="rgba(255,255,200,0.8)"
            />
            <rect
              x="31"
              y="24"
              width="4"
              height="1.5"
              rx="0.75"
              fill="rgba(255,100,100,0.8)"
            />
          </svg>
        </div>
      </div>

      {/* Road line below icon */}
      <svg
        width="120"
        height="16"
        viewBox="0 0 120 16"
        role="img"
        aria-label="Road"
        style={{
          marginBottom: 24,
          opacity: phase !== "intro" ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
      >
        <title>Road</title>
        <line
          x1="0"
          y1="8"
          x2="120"
          y2="8"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="3"
        />
        <line
          x1="0"
          y1="8"
          x2="120"
          y2="8"
          stroke="rgba(56, 189, 248, 0.7)"
          strokeWidth="2"
          strokeDasharray="200"
          strokeDashoffset="0"
          className="road-dash"
        />
        <line
          x1="20"
          y1="8"
          x2="35"
          y2="8"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          opacity="0.5"
        />
        <line
          x1="55"
          y1="8"
          x2="70"
          y2="8"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          opacity="0.5"
        />
        <line
          x1="90"
          y1="8"
          x2="105"
          y2="8"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          opacity="0.5"
        />
      </svg>

      {/* QuikLiv title */}
      <div style={{ marginBottom: 12 }}>
        {phase !== "intro" && (
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "white",
              lineHeight: 1,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {LETTERS.map((letter, i) => (
              <span
                key={letter + String(i)}
                className="splash-letter"
                style={{
                  animationDelay: `${i * 0.07}s`,
                  color: i < 4 ? "white" : "#38bdf8",
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
        <p
          className="splash-tagline"
          style={{
            color: "rgba(148, 210, 240, 0.85)",
            fontSize: 14,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Know Before You Go
        </p>
      )}

      {/* Bottom dots */}
      <div
        style={{ position: "absolute", bottom: 48, display: "flex", gap: 6 }}
      >
        {DOTS.map((id, i) => (
          <div
            key={id}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === 0 ? "#38bdf8" : "rgba(255,255,255,0.2)",
              transition: "background 0.4s ease",
              animation: `splashPulseRing ${1 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
