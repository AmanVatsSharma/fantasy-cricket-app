/**
 * Centralized color tokens for the 11DREAMER app.
 *
 * Single source of truth for all UI colors. New screens should import from
 * here instead of inlining hex strings in StyleSheet.create().
 *
 * Grouped by role:
 *   - brand     — primary brand colors (red, gold, green CTA)
 *   - surface   — backgrounds, panels, cards
 *   - text      — typography hierarchy
 *   - border    — separators and outlines
 *   - feedback  — error and success states
 */

export const colors = {
  brand: {
    red: '#CE404D',         // primary red (button bg, focus, glow, resend)
    redDark: '#A02030',     // pressed/hover state
    redLight: '#E85A66',    // highlight
    gold: '#ECBD15',        // accent (countdown, badges)
    green: '#1FA855',       // primary CTA (Continue with Mobile)
    greenLight: '#3DD870',  // CTA highlight
  },

  surface: {
    bg: '#080810',          // app background
    panel: '#1A1A22',       // login/signup card
    panelElevated: '#23232C', // input fields, modals
    input: '#14141F',       // input box bg
    inputDeep: '#0d0d12',   // deepest surface
    cardOverlay: 'rgba(255, 255, 255, 0.05)',
  },

  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
    subtle: 'rgba(255, 255, 255, 0.4)',
    placeholder: 'rgba(255, 255, 255, 0.3)',
    link: '#CE404D',
    onRed: '#FFFFFF',       // text that sits on red bg
  },

  border: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.2)',
    focus: '#CE404D',
  },

  feedback: {
    error: '#FF4444',
    errorBg: 'rgba(255, 68, 68, 0.1)',
    success: '#3DD870',
  },
} as const;

// Convenience: gradients (must be arrays, not strings)
export const gradients = {
  redCTA: ['#E03342', '#A02030'] as const,    // gradient red for primary action
  greenCTA: ['#3DD870', '#1FA855'] as const,  // gradient green for "Continue with Mobile"
  redHero: ['#CE404D', '#080810'] as const,    // top-to-bottom hero
  redHeader: ['#E03342', '#A02030'] as const, // header strip
  shield: ['#CE404D', '#8E1A24'] as const,     // logo shield fill
} as const;

export type Colors = typeof colors;
export type Gradients = typeof gradients;
