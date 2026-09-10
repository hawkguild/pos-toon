import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'emerald' | 'red' | 'black' | 'blue' | 'random';

export interface ShadePalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  primaryColor: string;
  shades: ShadePalette;
  swatch: [string, string];
}

const EMERALD_SHADES: ShadePalette = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
};

const RED_SHADES: ShadePalette = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
};

const BLACK_SHADES: ShadePalette = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#334155',
  700: '#1e293b',
  800: '#0f172a',
  900: '#020617',
  950: '#000000',
};

const BLUE_SHADES: ShadePalette = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

const RANDOM_PALETTES: ShadePalette[] = [
  // Violet
  {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
    500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
  },
  // Orange
  {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
    500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407',
  },
  // Cyan
  {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
    500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344',
  },
  // Pink
  {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
    500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724',
  },
  // Amber
  {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
    500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03',
  },
  // Rose
  {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519',
  },
  // Teal
  {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
    500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e',
  },
];

export const THEMES: Record<ThemeId, ThemeOption> = {
  emerald: {
    id: 'emerald',
    name: 'ขาว + เขียวกัญชา',
    description: 'โทนเขียวกัญชาสมุนไพรสดใส สะอาดตา (ค่าเริ่มต้น)',
    primaryColor: '#059669',
    shades: EMERALD_SHADES,
    swatch: ['#ffffff', '#059669'],
  },
  red: {
    id: 'red',
    name: 'ขาว + แดง',
    description: 'โทนขาวตัดแดงโมเดิร์น โดดเด่น ชัดเจน',
    primaryColor: '#dc2626',
    shades: RED_SHADES,
    swatch: ['#ffffff', '#dc2626'],
  },
  black: {
    id: 'black',
    name: 'ขาว + ดำ',
    description: 'โทนขาวตัดดำ มินิมอล คลาสสิก หรูหรา',
    primaryColor: '#0f172a',
    shades: BLACK_SHADES,
    swatch: ['#ffffff', '#0f172a'],
  },
  blue: {
    id: 'blue',
    name: 'ขาว + น้ำเงิน',
    description: 'โทนขาวตัดน้ำเงิน สดใส มืออาชีพ',
    primaryColor: '#2563eb',
    shades: BLUE_SHADES,
    swatch: ['#ffffff', '#2563eb'],
  },
  random: {
    id: 'random',
    name: 'ขาว + สุ่มสี (Random)',
    description: 'สุ่มจานสีสดใสใหม่ทุกครั้งที่เลือก',
    primaryColor: '#7c3aed',
    shades: RANDOM_PALETTES[0],
    swatch: ['#ffffff', 'linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4)'],
  },
};

interface ThemeContextType {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  activeTheme: ThemeOption;
  rollRandomTheme: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('pos_app_theme');
    return (saved as ThemeId) || 'emerald';
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('pos_app_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [randomShades, setRandomShades] = useState<ShadePalette>(RANDOM_PALETTES[0]);

  const rollRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_PALETTES.length);
    setRandomShades(RANDOM_PALETTES[randomIndex]);
  };

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem('pos_app_theme', id);
    if (id === 'random') {
      rollRandomTheme();
    }
  };

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => {
      const next = !prev;
      localStorage.setItem('pos_app_dark_mode', String(next));
      return next;
    });
  };

  const setDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    localStorage.setItem('pos_app_dark_mode', String(val));
  };

  const baseOption = THEMES[themeId] || THEMES.emerald;

  const activeTheme: ThemeOption =
    themeId === 'random'
      ? {
          ...baseOption,
          primaryColor: randomShades[600],
          shades: randomShades,
        }
      : baseOption;

  useEffect(() => {
    const root = document.documentElement;
    const { shades } = activeTheme;

    // Apply Tailwind v4 --color-emerald-* overrides on root
    const keys: (keyof ShadePalette)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    keys.forEach((key) => {
      root.style.setProperty(`--color-emerald-${key}`, shades[key]);
      root.style.setProperty(`--emerald-${key}`, shades[key]);
    });

    // Theme utility variables
    root.style.setProperty('--theme-primary', shades[600]);
    root.style.setProperty('--theme-primary-hover', shades[700]);
    root.style.setProperty('--theme-primary-light', shades[50]);
    root.style.setProperty('--theme-primary-border', shades[200]);
    root.style.setProperty('--theme-primary-text', shades[800]);

    root.setAttribute('data-theme', themeId);
  }, [activeTheme, themeId]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-mode', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-mode', 'light');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        setThemeId,
        activeTheme,
        rollRandomTheme,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

