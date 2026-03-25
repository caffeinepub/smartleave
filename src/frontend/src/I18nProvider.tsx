import type React from "react";
import { I18nContext, useI18nState } from "./i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, t } = useI18nState();
  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
