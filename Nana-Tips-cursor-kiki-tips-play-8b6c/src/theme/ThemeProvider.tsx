import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import { palettes, type ColorScheme, type Palette } from '@/theme/colors';
import { readJson, storageKeys, writeJson } from '@/state/storage';

export type Appearance = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  appearance: Appearance;
  resolved: ColorScheme;
  colors: Palette;
  ready: boolean;
  setAppearance: (appearance: Appearance) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAppearance(value: unknown): value is Appearance {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    readJson<unknown>(storageKeys.appearance).then((stored) => {
      if (!active) return;
      if (isAppearance(stored)) setAppearanceState(stored);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const resolved: ColorScheme =
    appearance === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : appearance;
  const colors = palettes[resolved];

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    void writeJson(storageKeys.appearance, next);
  }, []);

  useEffect(() => {
    if (!ready) return;
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background, ready]);

  const value = useMemo(
    () => ({ appearance, resolved, colors, ready, setAppearance }),
    [appearance, resolved, colors, ready, setAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return value;
}
