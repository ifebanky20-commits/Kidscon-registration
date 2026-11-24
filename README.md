# Kidscon Registration

Next.js App Router and TypeScript application for school registration and event administration, backed by Supabase.

## Getting started

1. With Node.js 20.9 or later, run `npm ci`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the existing production project, using `.env.example` as a template. An existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works.
3. Run `npm run dev` and open `http://localhost:3000`.

Both development and production connect to the production Supabase project. Development actions can change live data. Supply the same environment variables before building for deployment.

## Database migration for registration and admin access

Before deploying the frontend changes, review and apply `supabase/migrations/20261124000000_registration_integrity.sql` to the existing schema on PostgreSQL 15 or later. Back up production and validate the migration against a disposable copy of its schema and policies first.

The migration uses trusted Supabase Auth app metadata for authorization. Give each approved administrator `app_metadata.role = "admin"` using the Supabase Auth Admin API or an equivalent privileged operation. Preserve other app metadata, and have admins sign out and back in to refresh their JWTs. Confirm that public school registration works through the registration RPC, an ordinary account cannot read student records, and an approved admin can view and print a roster.

Coordinate the database migration and frontend deployment in one release window. The migration removes direct anonymous writes to schools and attendees, and the new frontend calls the transactional RPCs. Older registration pages need to reload after deployment.

## Search and social previews

Set `SITE_URL` to the public website origin before building. Vercel deployments can also use the production project URL supplied by Vercel. The origin is used for canonical links, social images, and `/sitemap.xml`.

## Project structure

```text
src/
  app/                        Next.js routes, layouts and loading UI
  components/
    pages/
      admin/                  Dashboard, schools, students, events and reports
      auth/                   Admin sign-in and session handling
      public/                 Landing, event browsing and public navigation
      registration/           Form steps, validation, draft, confirmation and print
    ui/                       Shared UI primitives
  providers/                  Application providers and theme state
  lib/                        Supabase client and shared school queries
  types/                      Database and relationship types
  utils/                      Shared helpers
  styles/                     Tailwind tokens and global styles
```

Start in `app/` to find a route. Follow its import into `components/pages/` for the screen, related components, hooks, and data access. Use `@/` for imports from `src/`, such as `@/components/ui/Button`. Site images live in `public/` and use root-relative URLs.

## Commands

- `npm run dev`: start the development server.
- `npm run typecheck`: check all TypeScript files in strict mode.
- `npm run build`: type-check and create a production build in `.next/`.
- `npm start`: serve the production build locally.
- `npm run lint`: run ESLint.

Environment values are ignored by Git. Only commit placeholder values in `.env.example`.

## TypeScript

Application source uses `.ts` and `.tsx`. `tsconfig.json` enables strict checking for the app and Next.js configuration. ESLint checks TypeScript and React rules. The Supabase client uses the shared database model in `src/types/database.ts`; keep those definitions synchronized with schema changes.

## Styling policy

Use Tailwind CSS for all application UI styling, including arbitrary values/properties, responsive states, dark mode, print variants, and reduced motion. Keep complete class names in source so Tailwind can discover them. Do not add inline styles, CSS modules, CSS-in-JS, or separate component stylesheets when a Tailwind utility can handle the requirement. ESLint rejects inline `style` and chart style-object props outside PDF components.

`src/styles/index.css` is the Tailwind v4 entry point: it declares theme tokens, the class-based dark variant, and animation keyframes through Tailwind's `@theme` configuration. The only standalone CSS rule is the documented print-page exception below.

Allowed exceptions, which must be explained when changed:

- **PDF tickets:** `src/components/pages/registration/components/pdf/RegistrationTicketPDF.tsx` uses `@react-pdf/renderer` primitives and `StyleSheet`. These render PDF documents rather than HTML and cannot consume Tailwind classes.
- **Word exports:** `docx` formatting options configure the generated Word document. Browser CSS and Tailwind cannot style Word document content.
- **Printed page margin:** the `@page` rule in `src/styles/index.css` sets the browser's print-page margin to 1cm. Tailwind's `print:` utilities style elements but cannot express a paged-media at-rule.
- **Library internals:** Recharts and Sonner manage their own computed geometry, positioning, and interaction styles. Application-owned chart content and toast appearance use Tailwind; internal renderer output is managed by those libraries.

Explain any additional exception and why Tailwind cannot handle it before introducing another styling approach.

## Page composition

Route files compose page components and layouts. Keep page-specific queries, form schemas, and substantial UI sections beside the screens that use them. Registration steps share typed form values through `FormProvider`, `useFormContext`, and `useWatch`.

`src/providers/AppProviders.tsx` composes app-wide providers. The admin event provider lives with the admin events page.

## Public event pages

- `/events`: upcoming experiences with name and location search.
- `/events/:id`: event details, registration preparation, and registration availability.
- Cards link to event details before the registration form.
- Public event pages use the configured Supabase database. Registration is available for open, upcoming events.
- Public event data is shared through `src/components/pages/public/events/events.ts` and `src/components/pages/public/events/usePublicEvents.ts`.
