import { Eye, EyeOff, Navigation } from "lucide-react";
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

  const inputBase =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none transition focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/40";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5"
      style={{
        background:
          "linear-gradient(135deg, #050e1a 0%, #0a1f35 40%, #0d2d4a 70%, #0a2240 100%)",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#38bdf8]/20 border border-[#38bdf8]/30 flex items-center justify-center mb-3">
          <Navigation className="w-7 h-7 text-[#38bdf8]" />
        </div>
        <h1
          className="text-4xl font-bold text-white tracking-tight"
          style={{ fontFamily: "inherit" }}
        >
          QuikLiv
        </h1>
        <p className="text-[#38bdf8]/80 text-sm mt-1 tracking-widest uppercase">
          Know Before You Go
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Create your account
            </h2>
            <p className="text-white/50 text-sm mt-1">
              Set up once and you're good to go
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="ob-username"
                className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide"
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
                className={inputBase}
              />
              {errors.username && (
                <p
                  data-ocid="onboarding.error_state"
                  className="text-red-400 text-xs mt-1"
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="ob-email"
                className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide"
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
                className={inputBase}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="ob-password"
                className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
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
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              data-ocid="onboarding.submit_button"
              type="submit"
              className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                boxShadow: "0 4px 24px rgba(56,189,248,0.3)",
              }}
            >
              Get Started →
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-xs mt-5">
          Your info stays on this device only.
        </p>
      </motion.div>
    </motion.div>
  );
}
