# Lyrica Next.js Template - AI Agent Guidelines

## Architecture Overview
This is a modular Next.js 13+ template with feature toggles in `config/features.ts`. Features include auth, blog, calendar, bookings, maps, and contact systems. Each module can be enabled/disabled, affecting navigation and page availability.

## Core Patterns

### Feature Toggles
- **File**: `config/features.ts`
- **Usage**: Import `features` object and check flags before rendering components/pages
- **Example**: `if (!features.useBlog) return notFound()` in page components 
- **Navigation**: Navbar conditionally renders links based on feature flags

### Supabase Integration
- **Client Types**:
  - Browser: `createClient()` from `@/lib/supabase/client`
  - Server: `createServerClient()` from `@/lib/supabase/server`
  - API Routes: `createRouteClient()` from `@/lib/supabase/route`
- **Auth Flow**: Middleware redirects unauthenticated users from protected paths
- **RLS**: All database queries rely on Row Level Security policies

### API Route Patterns
- **Validation**: Use Zod schemas for input validation
- **Error Handling**: Return `safeErrorMessage()` for production, full error in development
- **Auth Check**: Verify user session before mutations
- **Example**: `app/api/posts/route.ts` shows complete CRUD pattern

### Authentication & Roles
- **Admin System**: Check `role` field in `profiles` table
- **Helpers**: `requireAdmin()`, `isAdmin()`, `isModerator()` in `@/lib/auth.ts`
- **Middleware**: Protects `/dashboard`, `/blog/new`, and admin routes

### Database Schema
- **Setup**: Run `ai/sql/lyrica-complete-database-schema.sql` in Supabase
- **Tables**: `profiles`, `posts`, `events`, `messages`, `bookings`, `categories`
- **Relationships**: Foreign keys to `auth.users(id)` with CASCADE deletes

### Theming System
- **CSS Variables**: Defined in `app/globals.css` with light/dark variants
- **Tailwind**: Extended with custom color tokens (`--bg`, `--fg`, `--primary`, etc.)
- **Toggle**: `ThemeToggle` component manages `dark` class on `<html>`

### Error Handling
- **API Routes**: Catch errors, log to console, return safe messages
- **Validation**: Zod schemas with detailed error responses
- **Database Errors**: Check for table existence, return setup instructions

### Development Workflow
- **Install**: `pnpm install` (uses pnpm-lock.yaml)
- **Dev**: `pnpm dev` (Next.js dev server)
- **Build**: `pnpm build` (production build)
- **Type Check**: `pnpm typecheck` (TypeScript validation)
- **Env Setup**: Copy `.env.example` to `.env.local` with Supabase credentials

### Key Directories
- `ai/docs/`: Comprehensive documentation for all features
- `ai/sql/`: Database schemas and sample data
- `components/ui/`: Reusable UI components
- `lib/`: Utilities, auth helpers, Supabase clients
- `config/`: Feature toggles and site configuration

### Conventions
- **Imports**: Use `@/` path alias for absolute imports
- **Styling**: Tailwind with custom CSS variables, no component libraries
- **State**: Server components preferred, client components only when needed
- **Security**: Never log sensitive data, use environment variables for secrets
