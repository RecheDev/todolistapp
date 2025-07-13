# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses --turbopack for faster builds)
- **Build**: `npm run build`
- **Production start**: `npm start`
- **Lint**: `npm run lint`

## Architecture Overview

This is a full-stack todo application built with Next.js 15 (App Router), TypeScript, Supabase, and TailwindCSS.

### Core Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: TanStack Query (React Query) for server state, React Context for auth
- **Forms**: React Hook Form with Zod validation

### Database Architecture

- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Main table**: `todos` with user-based access control
- **Authentication**: Supabase Auth with email/password
- **Schema**: See `supabase-migration.sql` for complete database setup including triggers and indexes

### Application Structure

**Route-based organization** (App Router):
- `app/(auth)/` - Authentication routes (login/register) 
- `app/(app)/dashboard/` - Main todo dashboard (protected)
- `app/layout.tsx` - Root layout with providers

**Component organization**:
- `components/features/` - Feature-specific components (auth, todo)
- `components/ui/` - Reusable UI components (Radix-based)
- `components/providers.tsx` - Global providers (QueryClient, AuthProvider)

**State management layers**:
- `context/AuthContext.tsx` - Authentication state and methods
- `hooks/useAuth.ts` - Auth hook (wraps context)
- `hooks/useTodos.ts` - Todo CRUD operations with optimistic updates
- `lib/api.ts` - Supabase API functions
- `lib/supabaseClient.ts` - Supabase client configuration

### Key Patterns

**Data fetching**: Uses TanStack Query with optimistic updates for all todo operations. Each mutation includes rollback logic on failure.

**Authentication flow**: 
1. AuthContext manages user state and auth methods
2. Supabase handles session management automatically
3. RLS policies enforce data isolation per user

**Type safety**: 
- `types/database.ts` defines all database types
- Supabase types are used throughout for consistency

**Environment variables required**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Development Notes

- Uses TailwindCSS v4 (latest alpha)
- Configured with ESLint (Next.js + TypeScript rules)
- Testing dependencies installed but no test configuration present
- All todo operations include optimistic updates with proper error handling
- Database uses UUIDs for all IDs and includes automatic timestamp management