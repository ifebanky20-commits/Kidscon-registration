# Kidscon Registration

React, TypeScript, and Vite application for school registration and event administration, backed by Supabase.

## Getting started

1. Run `npm ci` to install dependencies.
2. Copy `.env.example` to `.env` and supply your Supabase project URL and public anon key. Vite loads environment files from the project root.
3. Run `npm run dev` to start the development server.

## Project structure

```text
data/                         CSV sample and registration data
public/                       Static assets served directly
src/
  app/
    App.tsx                   Route definitions and lazy-loaded pages
    layouts/                  Public and admin page shells
    providers/                Application provider composition
  features/
    admin/                    Admin pages, navbar/sidebar, context, and export utilities
    auth/                     Login page, auth context, and route guard
    events/                   Event pages, cards, queries, service, and date utilities
    landing/                  Landing page and its sections
    registration/             Registration, confirmation, print, PDF, and form state
  shared/
    components/
      layout/                 Public navigation, footer, and Kidscon logo
      ui/                     Reusable interface components and toast configuration
    lib/                      External service clients (Supabase)
    theme/                    Theme provider, context, and toggle
    types/                    Database row and relationship types
    utils/                    General-purpose utilities
  assets/                     Imported image assets
  schemas/                    Validation schemas and inferred form types
  styles/                     Tailwind theme tokens and global styles
  main.tsx                    Application bootstrap
  vite-env.d.ts               Environment variable declarations
```

Keep a feature’s pages, components, hooks, services, and context together inside its folder. Put reusable presentation and integration code in `shared/`, and route composition in `app/`. Validation schemas stay in `schemas/`. Use the `@/` alias for imports from `src/` (for example, `@/shared/components/ui/Button`). The alias is configured in TypeScript and Vite. Group imports in this order, with blank lines between groups: third-party packages, React/React DOM, then internal `@/` modules. Keep stylesheet imports last. Avoid barrel files that combine eager and lazy pages. Keep build, deployment configuration, and environment files at the project root.

## Commands

- `npm run dev`: start the development server.
- `npm run typecheck`: check all TypeScript files in strict mode.
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint.

Environment values are ignored by Git. Only commit placeholder values in `.env.example`.

## TypeScript

Application source uses `.ts` and `.tsx`. `tsconfig.json` enables strict checking for the app and Vite configuration. ESLint checks TypeScript and React rules. The Supabase client uses the shared database model in `src/shared/types/database.ts`; keep those definitions synchronized with schema changes. Vite environment variables are declared in `src/vite-env.d.ts`.

## Styling policy

Use Tailwind CSS for all application UI styling, including arbitrary values/properties, responsive states, dark mode, print variants, and reduced motion. Keep complete class names in source so Tailwind can discover them. Do not add inline styles, CSS modules, CSS-in-JS, or separate component stylesheets when a Tailwind utility can handle the requirement. ESLint rejects inline `style` and chart style-object props outside PDF components.

`src/styles/index.css` is the Tailwind v4 entry point: it declares theme tokens, the class-based dark variant, and animation keyframes through Tailwind's `@theme` configuration. The only standalone CSS rule is the documented print-page exception below.

Allowed exceptions, which must be explained when changed:

- **PDF tickets:** `src/features/registration/components/pdf/RegistrationTicketPDF.tsx` uses `@react-pdf/renderer` primitives and `StyleSheet`. These render PDF documents rather than HTML and cannot consume Tailwind classes.
- **Word exports:** `docx` formatting options configure the generated Word document. Browser CSS and Tailwind cannot style Word document content.
- **Printed page margin:** the `@page` rule in `src/styles/index.css` sets the browser's print-page margin to 1cm. Tailwind's `print:` utilities style elements but cannot express a paged-media at-rule.
- **Library internals:** Recharts and Sonner manage their own computed geometry, positioning, and interaction styles. Application-owned chart content and toast appearance use Tailwind; internal renderer output is managed by those libraries.

Explain any additional exception and why Tailwind cannot handle it before introducing another styling approach.

## Page composition

Pages compose components from their corresponding `src/features/` folder and reusable controls from `src/shared/components/`. Registration validation and its inferred `RegistrationForm` type live in `src/schemas/registration.ts`. Registration page hooks live beside `pages/registration/RegistrationPage.tsx`; `useRegistrationForm` owns form initialization and step navigation. The registration page calls event, draft, and submission hooks directly and shares the form through `FormProvider`. School, student, and teacher steps call their own verification, attendee, and import hooks; the review step subscribes to the form values it displays. School, student, and teacher hooks are colocated with their consumers in `components/school/`, `components/students/`, and `components/teachers/`. Keep hooks in a feature-level `hooks/` folder only when multiple consumers share them. Database writes live in `src/features/registration/services/registration.ts`, and local draft storage lives in `src/features/registration/utils/registrationDraft.ts`. Shared form values are accessed through typed `useFormContext` and `useWatch` calls. Shared export formatting lives in `src/features/admin/utils/export.ts`.

Keep schemas out of page files. Extract substantial page sections, dialogs, and tables into feature components, while leaving routing and overall page composition in the page.

## Public event pages

- `/events`: upcoming experiences with name and location search.
- `/events/:id`: event details, registration preparation, and registration availability.
- Cards link to event details before the registration form.
- Public event pages use live Supabase data. Registration is available for open, upcoming events.
- Public event data is shared through `src/features/events/services/events.ts` and `src/features/events/hooks/usePublicEvents.ts`.
