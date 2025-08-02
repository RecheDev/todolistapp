# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- `npm test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with Playwright UI mode
- `npm run test:debug` - Run tests in debug mode
- `npm run test:headed` - Run tests in headed mode
- `npm run test:unit` - Run Jest unit tests
- `npm run test:unit:watch` - Run Jest in watch mode
- `npm run test:unit:coverage` - Run Jest with coverage report

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **TypeScript** in strict mode
- **TailwindCSS v4** for styling
- **TanStack Query** for state management and optimistic updates
- **localStorage** for data persistence (demo app)
- **Radix UI** for accessible components
- **Playwright** for E2E testing, **Jest** for unit tests

### Project Structure
```
app/                    # Next.js App Router
├── (auth)/            # Authentication routes (login, register)
├── (app)/             # Protected app routes (dashboard, calendar, stats)
└── layout.tsx         # Root layout with providers

components/
├── features/          # Feature-specific components
│   ├── auth/          # Login/register forms
│   ├── dashboard/     # Main dashboard components
│   ├── todo/          # Todo item and forms
│   └── calendar/      # Calendar integration
├── ui/               # Reusable UI components (shadcn/ui based)
└── providers.tsx     # Global providers setup

hooks/                # Custom React hooks for data and UI logic
lib/                  # Core utilities and API layer
types/                # TypeScript definitions
context/              # React contexts (Auth, Theme)
```

### Key Architecture Patterns

#### Data Layer (lib/api.ts)
- All data operations use localStorage for demo purposes
- Functions simulate async operations but don't add delays for optimal UX
- Includes migration logic for backward compatibility
- Undo functionality with time-based expiration for all delete operations

#### State Management
- **TanStack Query** handles server state with optimistic updates
- **React Context** manages authentication and theme state
- Custom hooks (`useTodos`, `useTodoMutations`) provide focused data access
- **Mutation Factory Pattern** (`useMutationFactory`) standardizes error handling and success notifications
- Hooks are modular and re-exportable for backward compatibility

#### Advanced Hook Architecture
- Specialized hooks for focused responsibilities:
  - `useTodos` - Main data access with filtering/search
  - `useTodoMutations` - CRUD operations with optimistic updates  
  - `useTodoSelection` - Bulk selection management
  - `useSearchAndFilter` - Search and filter logic
  - `useMutationFactory` - Standardized mutation patterns

#### Authentication (context/AuthContext.tsx)
- Demo-only authentication with hardcoded credentials
- Demo credentials: `demo@todoapp.com` / `demo123`
- Uses localStorage for session persistence
- Clears all data on sign out

#### Component Architecture
- Feature-based organization under `components/features/`
- Reusable UI components in `components/ui/` following shadcn/ui patterns
- Error boundaries at root and feature levels
- Lazy loading for performance optimization

#### Safe Storage Pattern (lib/storage.ts)
- SSR-compatible localStorage wrapper with error handling
- Automatic JSON serialization/deserialization
- Safe fallbacks for server-side rendering

#### Form Validation (lib/validations.ts)  
- **Zod schemas** for type-safe validation across the app
- Input sanitization helpers for security
- Comprehensive validation for all user inputs

#### TypeScript Types (types/database.ts)
- Comprehensive type definitions for Todo and User
- Support for bulk operations and optimistic updates
- Input/output types for all API operations
- Strict typing with branded types for IDs

### Demo App Specifics
- Uses localStorage instead of a real database
- Demo credentials are hardcoded in AuthContext: `demo@todoapp.com` / `demo123`
- All API functions simulate network behavior without artificial delays
- Data persists between sessions via localStorage
- Migration logic handles schema changes between versions

### Testing Strategy
- **Playwright** for comprehensive E2E testing across auth, todos, accessibility
- **Jest** for unit testing hooks, utilities, and components
- Test utilities in `__tests__/utils/` for consistent test setup
- Tests cover error handling, optimistic updates, and keyboard navigation
- Accessibility testing with axe-core integration
- Separate directories: `tests/` (E2E) and `__tests__/` (unit)

### Key Development Patterns
- **Multi-level error boundaries** for graceful failure handling
- **Optimistic updates** with automatic rollback on failure
- **Theme system** with system preference detection and persistence
- **Accessibility-first** design with keyboard navigation and ARIA support
- **Performance optimization** through lazy loading and query caching
- **Type safety** with comprehensive Zod validation and TypeScript strict mode

## Important File Locations

### Core Architecture Files
- `lib/api.ts` - Main data layer with localStorage operations
- `hooks/useMutationFactory.ts` - Standardized mutation patterns
- `components/providers.tsx` - Global provider setup (Query, Auth, Theme)
- `context/AuthContext.tsx` - Demo authentication logic
- `types/database.ts` - Comprehensive type definitions

### Configuration Files  
- `tailwind.config.ts` - Custom design system with CSS variables
- `next.config.ts` - Next.js 15 configuration with Turbopack
- `playwright.config.ts` - Cross-browser E2E test configuration
- `jest.config.js` - Unit test configuration with Next.js integration

### Development Guidelines
- When adding new features, follow the mutation factory pattern for consistent error handling
- Use the existing validation schemas in `lib/validations.ts` for form inputs
- All new components should include proper TypeScript types and error boundaries
- Test both unit (Jest) and E2E (Playwright) for new functionality
- Follow the feature-based component organization pattern