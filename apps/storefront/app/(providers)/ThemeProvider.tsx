"use client";

import React, { createContext, useContext, useEffect } from "react";
import type { TenantTheme } from "@repo/core-config";

interface ThemeContextValue {
  theme: TenantTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export function ThemeProvider({
  theme,
  children,
}: {
  theme: TenantTheme;
  children: React.ReactNode;
}) {
  useEffect(() => {
    // aplica as variáveis CSS no body
    document.documentElement.style.setProperty(
      "--tenant-primary",
      theme.primary
    );
    document.documentElement.style.setProperty(
      "--tenant-secondary",
      theme.secondary
    );
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}
