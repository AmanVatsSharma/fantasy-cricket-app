# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## Project Overview

This is a **React Native mobile app** for fantasy cricket (Dream11-style), built with React Navigation, Zustand for state management, and React Native SVG. The codebase follows a flat source structure under `/mobile/src`.

## Commonly Used Commands

### Mobile App Commands
```bash
cd mobile
npm install                    # Install dependencies
npm start                     # Start Metro bundler
npx expo start                 # Alternative: Start with Expo
npx expo run:android           # Run on Android emulator
npx expo run:ios               # Run on iOS simulator
npx expo build:android         # Build Android APK
```

### Nx Commands (Workspace-level)
```bash
npx nx <target> <project>      # Run task (build, lint, test, etc.)
npx nx graph                   # Visualize project dependencies
npx nx sync                    # Sync TypeScript project references
npx nx sync:check              # Verify TypeScript references in CI
npx nx format:check            # Check code formatting
npx nx format:write            # Fix code formatting
npx nx run-many -t build       # Build all projects
```

### Package Manager
Uses **npm** (detected from `package-lock.json`). Prefix Nx commands with `npm exec` or ensure nx is available globally.

## Architecture

### Source Structure
```
mobile/src/
├── app/
│   ├── App.tsx               # Main app entry with navigation
│   ├── api/
│   │   └── apiClient.ts      # API client (axios-based)
│   ├── components/
│   │   ├── Dream11TabBar.tsx  # Bottom tab navigator
│   │   └── SidebarDrawer.tsx  # Side drawer menu
│   ├── screens/               # All screen components
│   │   ├── AccountScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── MatchDetailScreen.tsx
│   │   └── ... (24+ screens total)
│   └── store/                 # Zustand state stores
│       ├── useAuthStore.ts
│       ├── useUserStore.ts
│       └── useWalletStore.ts
```

### Navigation Structure
- **Stack Navigator**: Handles screen transitions (Splash → Login → Main)
- **Bottom Tab Navigator**: Main app tabs (HOME, WATCHLIVE, CLUBS, ACCOUNT)
- Routes use `screenOptions={{ headerShown: false }}` - all headers are custom

### State Management (Zustand)
Stores follow pattern: `use<Type>Store.ts` with getters/setters for auth, user, and wallet state.

### UI Patterns
- Custom header with drawer trigger, logo, wallet pill, and notifications bell
- Match cards with VS hero section, animated glow effects, countdown timers
- Glassmorphic design with semi-transparent backgrounds and blur effects
- Consistent color scheme: `#080810` (dark), `#CE404D` (accent), `#ECBD15` (gold)

## Nx Workspace

The repository is an Nx workspace but the mobile app is a standalone React Native project. The `/packages` directory is empty. Nx is configured with the `@nx/js` plugin for TypeScript support. The workspace uses:
- **TypeScript** with `tsconfig.base.json` for shared config
- **Prettier** for code formatting (`.prettierrc`)
- **Nx Cloud** for CI task distribution

## Development Notes

- Screens are imported directly in App.tsx (not lazy loaded)
- API calls use `apiClient.get()` / `apiClient.post()` pattern with error handling
- Animations use React Native's `Animated` API with loop patterns
- Team flags use emoji system with color-coded backgrounds per team

<!-- nx configuration end-->
