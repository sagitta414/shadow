import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "void" | "cold-blue" | "candlelight" | "glitch";

export interface Theme {
  name: ThemeName;
  label: string;
  icon: string;
  desc: string;
  vars: Record<string, string>;
  bodyClass: string;
}

export const THEMES: Theme[] = [
  {
    name: "void",
    label: "Void",
    icon: "◼",
    desc: "The abyss",
    bodyClass: "theme-void",
    vars: {
      "--t-bg": "#000000",
      "--t-surface": "rgba(4,0,10,0.9)",
      "--t-border": "rgba(255,255,255,0.06)",
      "--t-accent1": "#8B0000",
      "--t-accent2": "#B8860B",
      "--t-accent3": "#2D1B69",
      "--t-text": "#C8C8D8",
      "--t-text-dim": "rgba(200,200,220,0.45)",
      "--t-glow1": "rgba(139,0,0,0.35)",
      "--t-glow2": "rgba(184,134,11,0.3)",
      "--t-orb1": "rgba(139,0,0,0.18)",
      "--t-orb2": "rgba(45,27,105,0.2)",
      "--t-filter": "none",
    },
  },
  {
    name: "cold-blue",
    label: "Cold Blue",
    icon: "❄",
    desc: "Isolation",
    bodyClass: "theme-cold-blue",
    vars: {
      "--t-bg": "#000811",
      "--t-surface": "rgba(0,8,20,0.92)",
      "--t-border": "rgba(74,144,217,0.12)",
      "--t-accent1": "#1a4a8a",
      "--t-accent2": "#4a90d9",
      "--t-accent3": "#0a2040",
      "--t-text": "#b8d4f0",
      "--t-text-dim": "rgba(140,180,240,0.45)",
      "--t-glow1": "rgba(26,74,138,0.5)",
      "--t-glow2": "rgba(74,144,217,0.35)",
      "--t-orb1": "rgba(20,60,120,0.25)",
      "--t-orb2": "rgba(10,30,70,0.2)",
      "--t-filter": "hue-rotate(180deg) saturate(0.75) brightness(0.95)",
    },
  },
  {
    name: "candlelight",
    label: "Candlelight",
    icon: "🕯",
    desc: "Claustrophobia",
    bodyClass: "theme-candlelight",
    vars: {
      "--t-bg": "#0a0500",
      "--t-surface": "rgba(15,8,0,0.92)",
      "--t-border": "rgba(180,100,10,0.15)",
      "--t-accent1": "#7a3500",
      "--t-accent2": "#c87820",
      "--t-accent3": "#3d1a00",
      "--t-text": "#e8d0a0",
      "--t-text-dim": "rgba(220,180,100,0.45)",
      "--t-glow1": "rgba(122,53,0,0.5)",
      "--t-glow2": "rgba(200,120,32,0.35)",
      "--t-orb1": "rgba(100,40,0,0.3)",
      "--t-orb2": "rgba(60,20,0,0.2)",
      "--t-filter": "sepia(0.55) hue-rotate(-8deg) saturate(1.4) brightness(0.88)",
    },
  },
  {
    name: "glitch",
    label: "Static & Glitch",
    icon: "▓",
    desc: "Psychological distress",
    bodyClass: "theme-glitch",
    vars: {
      "--t-bg": "#000500",
      "--t-surface": "rgba(0,8,2,0.92)",
      "--t-border": "rgba(0,255,65,0.1)",
      "--t-accent1": "#005500",
      "--t-accent2": "#00ff41",
      "--t-accent3": "#001a00",
      "--t-text": "#b0ffb8",
      "--t-text-dim": "rgba(100,240,120,0.45)",
      "--t-glow1": "rgba(0,100,0,0.5)",
      "--t-glow2": "rgba(0,255,65,0.3)",
      "--t-orb1": "rgba(0,80,10,0.2)",
      "--t-orb2": "rgba(0,40,5,0.15)",
      "--t-filter": "hue-rotate(90deg) saturate(0.6) brightness(0.9)",
    },
  },
];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    return (localStorage.getItem("sw-theme") as ThemeName) || "void";
  });

  const theme = THEMES.find((t) => t.name === themeName) ?? THEMES[0];

  useEffect(() => {
    localStorage.setItem("sw-theme", themeName);
    // Apply body class for theme-specific CSS
    document.body.className = theme.bodyClass;
    // Apply CSS variables to root
    Object.entries(theme.vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
