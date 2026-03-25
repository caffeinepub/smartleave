import { useEffect, useState } from "react";

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("quikliv_dark_mode");
    // Default to dark (the original design)
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("quikliv_dark_mode", String(isDark));
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  function toggle() {
    setIsDark((v) => !v);
  }

  return [isDark, toggle];
}
