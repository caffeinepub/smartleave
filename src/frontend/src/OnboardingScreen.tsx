import { Eye, EyeOff, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = "Username is required";
    else if (username.trim().length < 2)
      errs.username = "At least 2 characters";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    localStorage.setItem(
      "quikliv_user",
      JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        password,
      }),
    );
    onDone();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5 overflow-y-auto py-8"
      style={{
        background:
          "linear-gradient(150deg, oklch(0.09 0.015 265) 0%, oklch(0.12 0.022 250) 45%, oklch(0.11 0.018 255) 75%, oklch(0.08 0.012 270) 100%)",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "oklch(0.76 0.18 195 / 0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "oklch(0.76 0.18 195 / 0.04)",
          }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center mb-8 relative"
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, oklch(0.76 0.18 195), oklch(0.65 0.22 205))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 8px 32px oklch(0.76 0.18 195 / 0.35)",
          }}
        >
          <Zap style={{ width: 30, height: 30, color: "white" }} />
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-1.5px",
            lineHeight: 1,
            fontFamily:
              "'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          Quik<span style={{ color: "oklch(0.76 0.18 195)" }}>Liv</span>
        </h1>
        <p
          style={{
            color: "oklch(0.76 0.18 195 / 0.8)",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginTop: 6,
          }}
        >
          Smart Traffic Timing
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative"
      >
        <div
          style={{
            borderRadius: 24,
            padding: "28px 28px",
            background: "oklch(0.14 0.012 265 / 0.9)",
            border: "1px solid oklch(0.76 0.18 195 / 0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "white",
                marginBottom: 6,
              }}
            >
              Create your account
            </h2>
            <p style={{ color: "oklch(0.68 0.018 240)", fontSize: 13 }}>
              Set up once — your data stays on this device.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Username */}
            <div>
              <label
                htmlFor="ob-username"
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "oklch(0.68 0.018 240)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Username
              </label>
              <input
                id="ob-username"
                data-ocid="onboarding.input"
                type="text"
                placeholder="e.g. alex_commuter"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((p) => ({ ...p, username: "" }));
                }}
                style={{
                  width: "100%",
                  background: "oklch(0.09 0.015 265 / 0.8)",
                  border: `1px solid ${errors.username ? "oklch(0.62 0.19 25 / 0.7)" : "oklch(0.76 0.18 195 / 0.25)"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
              {errors.username && (
                <p
                  data-ocid="onboarding.error_state"
                  style={{
                    color: "oklch(0.62 0.19 25)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="ob-email"
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "oklch(0.68 0.018 240)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Email
              </label>
              <input
                id="ob-email"
                data-ocid="onboarding.input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                style={{
                  width: "100%",
                  background: "oklch(0.09 0.015 265 / 0.8)",
                  border: `1px solid ${errors.email ? "oklch(0.62 0.19 25 / 0.7)" : "oklch(0.76 0.18 195 / 0.25)"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
              {errors.email && (
                <p
                  style={{
                    color: "oklch(0.62 0.19 25)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="ob-password"
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "oklch(0.68 0.018 240)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  data-ocid="onboarding.input"
                  id="ob-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  style={{
                    width: "100%",
                    background: "oklch(0.09 0.015 265 / 0.8)",
                    border: `1px solid ${errors.password ? "oklch(0.62 0.19 25 / 0.7)" : "oklch(0.76 0.18 195 / 0.25)"}`,
                    borderRadius: 12,
                    padding: "12px 48px 12px 16px",
                    color: "white",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "oklch(0.68 0.018 240)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 16, height: 16 }} />
                  ) : (
                    <Eye style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{
                    color: "oklch(0.62 0.19 25)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              data-ocid="onboarding.submit_button"
              type="submit"
              style={{
                width: "100%",
                marginTop: 4,
                padding: "14px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                color: "oklch(0.09 0.015 265)",
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.68 0.22 205))",
                boxShadow: "0 6px 28px oklch(0.76 0.18 195 / 0.35)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "-0.2px",
              }}
            >
              Get Started →
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "oklch(0.68 0.018 240 / 0.5)",
            fontSize: 12,
            marginTop: 18,
          }}
        >
          Your info stays on this device only.
        </p>
      </motion.div>
    </motion.div>
  );
}
