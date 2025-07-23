# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses --turbopack for faster builds)
- **Build**: `npm run build`
- **Production start**: `npm start`
- **Lint**: `npm run lint`
- **Test**: `npm test` (runs Playwright E2E tests)
- **Test with UI**: `npm run test:ui` (interactive test runner)
- **Test headed**: `npm run test:headed` (run tests in visible browser)
- **Test debug**: `npm run test:debug` (debug specific tests)

## Architecture Overview

This is a **portfolio demo** todo application built with Next.js 15.4.3 (App Router), TypeScript, and TailwindCSS. Features mobile-first responsive design with pure white/black color palette and localStorage-based data persistence.

### Core Tech Stack

- **Frontend**: Next.js 15.4.3 with App Router, React 19, TypeScript
- **Storage**: Browser localStorage (no external database required)
- **Authentication**: Demo credentials system (demo@todoapp.com / demo123)
- **Styling**: TailwindCSS v4 with Radix UI components
- **State Management**: TanStack Query for client state, React Context for auth
- **Forms**: React Hook Form with Zod validation
- **Testing**: Playwright E2E with accessibility testing (axe-core)

### Demo Architecture

**Self-contained portfolio demo** requiring no external setup:
- **Authentication**: localStorage-based demo system with hardcoded credentials
- **Data Storage**: All todos stored in browser localStorage with UUIDs
- **Demo Credentials**: `demo@todoapp.com` / `demo123`
- **Network Simulation**: Artificial delays in `lib/api.ts` for realistic UX
- **No Setup Required**: Works immediately without configuration or servers

### Application Structure

**Route-based organization** (App Router):
- `app/(auth)/` - Authentication routes (login/register) with mobile-first layouts
- `app/(app)/dashboard/` - Main todo dashboard (protected) with responsive design
- `app/layout.tsx` - Root layout with providers and theme setup

**Component organization**:
- `components/features/` - Feature-specific components (auth, todo)
- `components/ui/` - Reusable UI components (Radix-based with custom styling)
- `components/providers.tsx` - Global providers (QueryClient, AuthProvider, ThemeProvider)

**State management layers**:
- `context/AuthContext.tsx` - Demo authentication with localStorage persistence
- `hooks/useAuth.ts` - Auth hook wrapper
- `hooks/useTodos.ts` - Todo CRUD operations with optimistic updates
- `hooks/useTheme.tsx` - Theme management (light/dark toggle)
- `lib/api.ts` - localStorage-based API functions with simulated network delays

### Key Patterns

**Data fetching**: TanStack Query with optimistic updates for all todo operations. Each mutation includes rollback logic on failure and simulated network delays for realistic UX.

**Authentication flow**: 
1. Hardcoded demo credentials for easy access (demo@todoapp.com / demo123)
2. AuthContext manages localStorage-based session persistence
3. Automatic session restoration on page refresh
4. Protected routes with loading states

**Theme system**:
- Custom theme hook in `hooks/useTheme.tsx` with localStorage persistence
- Pure white/black color palette (no grays in dark mode)
- CSS variables in `app/globals.css` define dark mode as pure black (`0 0% 0%`)
- Simple toggle button (no dropdown) for better mobile UX

**Mobile-first responsive design**:
- All components designed mobile-first with responsive breakpoints
- Touch targets optimized for mobile (48px+ buttons)
- Subtle branding positioning (small title in top-left)
- Collapsible navigation and stats for mobile

**Type safety**: 
- `types/database.ts` defines all todo and user types
- Full TypeScript strict mode compliance
- Zod validation for forms

### Advanced Features

**Drag & Drop System**: Uses `@dnd-kit` for accessible todo reordering with touch support. Implementation in `components/features/todo/TodoList.tsx` with proper keyboard navigation and screen reader announcements.

**Bulk Operations**: Multi-select todos with keyboard shortcuts (Cmd/Ctrl+A) and bulk actions (complete, delete, priority changes). Selection state managed in `useTodos.ts` hook.

**Priority & Due Date System**: Three priority levels (low, medium, high) with visual indicators and due date management. Priority affects sorting order and visual prominence.

**Shopping List Mode**: Extended todo type with sub-items and quantities. Toggle between regular todos and shopping lists with different UI patterns.

**Search & Filtering**: Real-time search with 300ms debouncing, multiple filter options (completed, priority, due date). Implemented with URL state persistence for bookmarkable filtered views.

### Important Implementation Details

**Theme System**: The dark mode uses pure black backgrounds (`--color-background: 0 0% 0%`) defined in `app/globals.css`. Any component using `bg-background` or `bg-card` will automatically get the correct colors.

**localStorage API**: All CRUD operations in `lib/api.ts` include artificial delays (300-500ms) to simulate real network conditions and provide better UX with loading states.

**Optimistic Updates**: Todo operations immediately update the UI, then rollback if the simulated API call fails, providing instant feedback while maintaining data consistency.

**Demo Credentials**: Always use `demo@todoapp.com` / `demo123` - these are hardcoded in `context/AuthContext.tsx` and pre-filled in forms.

**Testing Configuration**: Playwright runs tests across multiple browsers (Chromium, Firefox, WebKit) and mobile viewports (Pixel 5, iPhone 12). The dev server starts automatically during testing with `npm test`.

**Keyboard Shortcuts**: 
- `Cmd/Ctrl + K`: Focus search input
- `Cmd/Ctrl + Shift + A/P/C`: Apply filters (All, Pending, Completed)
- `Tab navigation`: Full keyboard accessibility throughout the app
- `Enter/Space`: Activate buttons and toggle todos

**Error Handling**: 
- Toast notifications via Sonner for user feedback
- Error boundaries for graceful failure recovery
- Network status detection for offline scenarios
- Form validation with field-level error messages

## Development Notes

- **Portfolio Demo**: Designed for easy demonstration without external dependencies
- **Mobile-First**: All layouts prioritize mobile experience with responsive scaling
- **Pure Color Palette**: Strict white/black theme (no grays) for clean aesthetic
- **No External Dependencies**: Database, auth, and all features work completely offline
- Uses TailwindCSS v4 (alpha) with custom CSS variables for theming
- Comprehensive Playwright testing covering auth, CRUD, accessibility, and responsive design
- All todo operations include proper error handling and user feedback via Sonner toasts
- Theme toggle functionality with localStorage persistence and SSR-safe hydration