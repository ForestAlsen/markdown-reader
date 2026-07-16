import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSize = 'small' | 'medium' | 'large';
const FONT_MAP: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
};

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  accent: string;
  border: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  fontPx: number;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#f7f5f2',
  surface: '#ffffff',
  text: '#1c1917',
  subtext: '#78716c',
  accent: '#c2410c',
  border: '#e7e5e4',
};
const darkColors: ThemeColors = {
  background: '#0c0a09',
  surface: '#1c1917',
  text: '#f5f5f4',
  subtext: '#a8a29e',
  accent: '#fb923c',
  border: '#292524',
};

const ThemeContext = createContext<ThemeContextType>(null!);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    (async () => {
      try {
        const dark = await AsyncStorage.getItem('darkMode');
        const fs = (await AsyncStorage.getItem('fontSize')) as FontSize | null;
        if (dark === 'true') setIsDark(true);
        if (fs === 'small' || fs === 'medium' || fs === 'large') setFontSize(fs);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('darkMode', String(next));
  };

  const setFont = (s: FontSize) => {
    setFontSize(s);
    AsyncStorage.setItem('fontSize', s);
  };

  const value: ThemeContextType = {
    isDark,
    toggleDark,
    fontSize,
    setFontSize: setFont,
    fontPx: FONT_MAP[fontSize],
    colors: isDark ? darkColors : lightColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
