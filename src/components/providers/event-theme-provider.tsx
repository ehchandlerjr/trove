'use client';

import { createContext, useContext, type ReactNode } from 'react';

// ============================================================================
// EVENT THEMES
// These layer ON TOP of base themes (Vellum, Obsidian, etc.)
// ============================================================================

export type EventThemeId = 
  | 'none'
  | 'birthday' 
  | 'christmas' 
  | 'wedding' 
  | 'easter' 
  | 'baby' 
  | 'halloween'
  | 'hanukkah'
  | 'graduation';

export interface EventTheme {
  id: EventThemeId;
  name: string;
  icon: string;
  accent: string;           // Primary accent color
  accentDark: string;       // Accent for dark themes
  secondary?: string;       // Optional secondary color
  accentBg: string;         // Light mode accent background
  accentBgDark: string;     // Dark mode accent background
  floatingShapes: string[]; // Shape types for floating elements
  groundKey: string;        // Ground illustration key
  headerEmojis: string;     // Decorative emojis for header
}

export const eventThemes: Record<EventThemeId, EventTheme> = {
  none: {
    id: 'none',
    name: 'Default',
    icon: '✨',
    accent: '', // Uses base theme accent
    accentDark: '',
    accentBg: '',
    accentBgDark: '',
    floatingShapes: [],
    groundKey: 'none',
    headerEmojis: '',
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    accent: '#E85A9A',
    accentDark: '#F08AB0',
    accentBg: '#FDF0F5',
    accentBgDark: '#2D1F24',
    floatingShapes: ['balloon', 'gift', 'confetti', 'star'],
    groundKey: 'birthday',
    headerEmojis: '🎈🎁🎉',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    accent: '#C41E3A',
    accentDark: '#E85A5A',
    secondary: '#1E5631',
    accentBg: '#FDF5F5',
    accentBgDark: '#241C1C',
    floatingShapes: ['snowflake', 'ornament', 'gift', 'star'],
    groundKey: 'christmas',
    headerEmojis: '🎄❄️🎅',
  },
  wedding: {
    id: 'wedding',
    name: 'Wedding',
    icon: '💒',
    accent: '#B8860B',
    accentDark: '#D4A84C',
    accentBg: '#FBF9F3',
    accentBgDark: '#252320',
    floatingShapes: ['heart', 'ring', 'dove', 'fleurDeLis'],
    groundKey: 'wedding',
    headerEmojis: '💍👰🤵',
  },
  easter: {
    id: 'easter',
    name: 'Easter',
    icon: '🐰',
    accent: '#9B59B6',
    accentDark: '#B87BC8',
    secondary: '#F1C40F',
    accentBg: '#F8F5FB',
    accentBgDark: '#221F24',
    floatingShapes: ['egg', 'tulip', 'bunny', 'butterfly'],
    groundKey: 'easter',
    headerEmojis: '🐰🥚🌷',
  },
  baby: {
    id: 'baby',
    name: 'Baby Shower',
    icon: '👶',
    accent: '#5DADE2',
    accentDark: '#7ECCE8',
    secondary: '#FAD7E5',
    accentBg: '#F0F8FF',
    accentBgDark: '#1C2124',
    floatingShapes: ['star', 'heart', 'cloud', 'moon'],
    groundKey: 'baby',
    headerEmojis: '👶🍼⭐',
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    icon: '🎃',
    accent: '#E67E22',
    accentDark: '#F0A050',
    secondary: '#6C3483',
    accentBg: '#FDF6F0',
    accentBgDark: '#241E18',
    floatingShapes: ['bat', 'pumpkin', 'moon', 'ghost'],
    groundKey: 'halloween',
    headerEmojis: '🎃👻🦇',
  },
  hanukkah: {
    id: 'hanukkah',
    name: 'Hanukkah',
    icon: '🕎',
    accent: '#1E5AA8',
    accentDark: '#4A8AD8',
    secondary: '#C9B037',
    accentBg: '#F0F5FB',
    accentBgDark: '#1C2028',
    floatingShapes: ['star', 'candle', 'dreidel'],
    groundKey: 'hanukkah',
    headerEmojis: '🕎✡️🕯️',
  },
  graduation: {
    id: 'graduation',
    name: 'Graduation',
    icon: '🎓',
    accent: '#2C3E50',
    accentDark: '#5D7A94',
    secondary: '#C9B037',
    accentBg: '#F5F7F9',
    accentBgDark: '#1C1E20',
    floatingShapes: ['star', 'diploma', 'cap'],
    groundKey: 'graduation',
    headerEmojis: '🎓📜🎉',
  },
};

// ============================================================================
// CONTEXT
// ============================================================================

interface EventThemeContextValue {
  eventTheme: EventTheme;
  eventThemeId: EventThemeId;
}

const EventThemeContext = createContext<EventThemeContextValue | undefined>(undefined);

interface EventThemeProviderProps {
  eventThemeId: EventThemeId;
  children: ReactNode;
}

export function EventThemeProvider({ eventThemeId, children }: EventThemeProviderProps) {
  const eventTheme = eventThemes[eventThemeId] || eventThemes.none;
  
  return (
    <EventThemeContext.Provider value={{ eventTheme, eventThemeId }}>
      {children}
    </EventThemeContext.Provider>
  );
}

export function useEventTheme() {
  const context = useContext(EventThemeContext);
  if (!context) {
    // Return default if not in provider
    return { eventTheme: eventThemes.none, eventThemeId: 'none' as EventThemeId };
  }
  return context;
}

// ============================================================================
// CSS VARIABLE INJECTION
// Returns style object to apply event theme overrides
// ============================================================================

export function getEventThemeStyles(
  eventThemeId: EventThemeId, 
  isDark: boolean
): React.CSSProperties {
  const theme = eventThemes[eventThemeId];
  
  if (eventThemeId === 'none' || !theme.accent) {
    return {};
  }
  
  return {
    '--event-accent': isDark ? theme.accentDark : theme.accent,
    '--event-accent-bg': isDark ? theme.accentBgDark : theme.accentBg,
    '--event-secondary': theme.secondary || (isDark ? theme.accentDark : theme.accent),
  } as React.CSSProperties;
}
