'use client';

import { EventThemeProvider, type EventThemeId, getEventThemeStyles, eventThemes } from '@/components/providers/event-theme-provider';
import { FloatingShapes } from '@/components/features/floating-shapes';
import { GroundIllustration } from '@/components/features/ground-illustration';
import { useTheme } from '@/components/providers/theme-provider';
import type { ReactNode } from 'react';

interface ListEventThemeWrapperProps {
  eventThemeId: EventThemeId;
  children: ReactNode;
}

export function ListEventThemeWrapper({ eventThemeId, children }: ListEventThemeWrapperProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'obsidian' || resolvedTheme === 'scriptorium';
  
  const eventThemeStyles = getEventThemeStyles(eventThemeId, isDark);
  const theme = eventThemes[eventThemeId];
  
  return (
    <EventThemeProvider eventThemeId={eventThemeId}>
      <div 
        data-event-theme={eventThemeId}
        style={eventThemeStyles}
        className="relative"
      >
        {/* Floating decorations */}
        <FloatingShapes />
        
        {/* Header emojis for festive themes */}
        {eventThemeId !== 'none' && theme.headerEmojis && (
          <div 
            className="absolute top-0 right-0 text-2xl opacity-60 pointer-events-none select-none"
            aria-hidden="true"
          >
            {theme.headerEmojis}
          </div>
        )}
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Ground illustration */}
        <GroundIllustration />
      </div>
    </EventThemeProvider>
  );
}
