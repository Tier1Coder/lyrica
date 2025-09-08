# Lyrica — Modular Next.js Template

Full-stack, reusable Next.js 13+ template with TypeScript, Tailwind CSS, and Supabase for Auth/DB. Features are toggleable via a central config for fast client customization.

## Tech Stack
- Next.js 13+/14 (App Router)
- TypeScript
- Tailwind CSS (dark mode via class)
- Supabase (Postgres + Auth)
- Optional: React Leaflet (maps), react-markdown + rehype-sanitize (blog)

## Quick Start
1) Copy `.env.example` to `.env.local` and fill values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2) Install deps and run dev:
   - pnpm: `pnpm install && pnpm dev`
   - npm: `npm install && npm run dev`
3) Open http://localhost:3000

## Feature Toggles
Edit `config/features.ts`:
```ts
export default {
  useCalendar: true,
  useMaps: true,
  useBlog: true,
  useContact: true,
} as const
```
Navigation and routes reflect these flags. Disabled pages return 404.

## Auth Flow
- Signup: `/signup`, Login: `/login`, Logout button in the navbar.
- Protected route: `/dashboard`. Middleware redirects unauthenticated users.
- Supabase Auth helpers provide server and route handler clients.

## Database Schema (Supabase)
Run SQL in Supabase SQL editor from `PLAN.md` (events, posts, messages) to create tables and RLS policies.

## Modules
- Calendar: `/calendar` CRUD via API routes, RLS restricts to owner.
- Maps: `/maps` with Leaflet + OSM tiles.
- Blog: `/blog` list, `/blog/new` create, `/blog/[id]` detail. Markdown is sanitized.
- Contact: `/contact` posts to `/api/contact` with server validation.

## Theming
- Dark mode toggle (stores preference in `localStorage`).
- Colors are CSS variables in `app/globals.css` and mapped in `tailwind.config.ts`.

## Security
- Do not commit `.env*` files. Only use env vars for secrets.
- API routes validate inputs and log internal errors server-side only.
- Supabase RLS enforces user ownership and read access rules.

## Deploy
- Vercel: set env vars and deploy the repo. Build with `next build`.
- Supabase: set up Auth (email/password) and run schema SQL. Copy project URL and anon key to Vercel.

## Testing
- Toggle flags in `config/features.ts` to verify nav and page availability.
- Create account, login, view `/dashboard`.
- Test module pages according to needs.

## Notes
- OAuth providers can be added in Supabase; wire up with Supabase Auth helpers similarly to email/password.
- For rate limiting contact form, consider middleware or external providers (e.g., Upstash). Current template includes validation and notes only.
