# Kidscon Registration

React, TypeScript, and Vite application for school registration and event administration, backed by Supabase.

## Getting started

1. Run `npm ci` to install dependencies.
2. Copy `.env.example` to `.env` and supply your Supabase project URL and public anon key. Vite loads environment files from the project root.
3. Run `npm run dev` to start the development server.

## Project structure

```text
src/
  App.tsx                     Routes and lazy-loaded pages
  main.tsx                    Application entry point
  pages/
    public/                   Landing page, event list and event details
    auth/                     Admin login
    admin/                    Dashboard, schools, students, events and reports
    registration/             Registration form, confirmation and print pages
  components/
    ui/                       Shared buttons, inputs, dialogs and theme toggle
    layout/                   Public navigation, footer and logo
    admin/                    Admin navigation, tables, charts and dialogs
    public/                   Landing sections and event cards
    registration/             Registration steps, student dialog and PDF ticket
    auth/                     Protected route component
  hooks/                      Reusable hooks grouped by feature
  contexts/                   Auth, event selection and theme state
  layouts/                    Public and admin page shells
  providers/                  Application provider composition
  services/                   Supabase data operations
  lib/                        Supabase client and navigation configuration
  types/                      Database and relationship types
  schemas/                    Registration validation
  utils/                      Formatting, exports, draft persistence and helpers
  config/                     App configuration
  mocks/                      Demo data grouped by feature
  assets/                     Imported images
  styles/                     Tailwind tokens and global styles
  vite-env.d.ts               Environment variable declarations
```

Start in `pages/` to find a screen. Its smaller UI pieces belong in `components/`, reusable state logic in `hooks/`, and database operations in `services/`. App-wide state lives in `contexts/`; shared UI primitives live in `components/ui/`. Keep build, deployment and environment files at the project root.

Use `@/` for imports from `src/`, for example `@/components/ui/Button` or `@/services/registration`. Import pages directly so route-based lazy loading remains intact. Group imports as third-party packages, React/React DOM, then internal modules, with stylesheets last.

## Commands

- `npm run dev`: start the development server.
- `npm run typecheck`: check all TypeScript files in strict mode.
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint.

Environment values are ignored by Git. Only commit placeholder values in `.env.example`.

## TypeScript

Application source uses `.ts` and `.tsx`. `tsconfig.json` enables strict checking for the app and Vite configuration. ESLint checks TypeScript and React rules. The Supabase client uses the shared database model in `src/types/database.ts`; keep those definitions synchronized with schema changes. Vite environment variables are declared in `src/vite-env.d.ts`.

## Styling policy

Use Tailwind CSS for all application UI styling, including arbitrary values/properties, responsive states, dark mode, print variants, and reduced motion. Keep complete class names in source so Tailwind can discover them. Do not add inline styles, CSS modules, CSS-in-JS, or separate component stylesheets when a Tailwind utility can handle the requirement. ESLint rejects inline `style` and chart style-object props outside PDF components.

`src/styles/index.css` is the Tailwind v4 entry point: it declares theme tokens, the class-based dark variant, and animation keyframes through Tailwind's `@theme` configuration. The only standalone CSS rule is the documented print-page exception below.

Allowed exceptions, which must be explained when changed:

- **PDF tickets:** `src/components/registration/pdf/RegistrationTicketPDF.tsx` uses `@react-pdf/renderer` primitives and `StyleSheet`. These render PDF documents rather than HTML and cannot consume Tailwind classes.
- **Word exports:** `docx` formatting options configure the generated Word document. Browser CSS and Tailwind cannot style Word document content.
- **Printed page margin:** the `@page` rule in `src/styles/index.css` sets the browser's print-page margin to 1cm. Tailwind's `print:` utilities style elements but cannot express a paged-media at-rule.
- **Library internals:** Recharts and Sonner manage their own computed geometry, positioning, and interaction styles. Application-owned chart content and toast appearance use Tailwind; internal renderer output is managed by those libraries.

Explain any additional exception and why Tailwind cannot handle it before introducing another styling approach.

## Page composition

Pages compose UI from `src/components/` and state logic from `src/hooks/`. Registration hooks live in `src/hooks/registration/`; validation lives in `src/schemas/registration.ts`. Registration steps share typed form values through `FormProvider`, `useFormContext`, and `useWatch`.

In `src/contexts/`, `AuthProvider.tsx`, `EventProvider.tsx`, and `ThemeProvider.tsx` manage state. Their matching `*-context.ts` files declare the context and expose its consumer hook. `src/providers/AppProviders.tsx` composes the application providers.

Database writes live in `src/services/registration.ts`, draft persistence in `src/utils/registrationDraft.ts`, and export formatting in `src/utils/export.ts`.

Keep schemas out of page files. Extract substantial page sections, dialogs, and tables into feature components, while leaving routing and overall page composition in the page.

## Public event pages

- `/events`: upcoming experiences with name and location search.
- `/events/:id`: event details, registration preparation, and registration availability.
- Cards link to event details before the registration form.
- Public event pages use live Supabase data. Registration is available for open, upcoming events.
- Public event data is shared through `src/services/events.ts` and `src/hooks/events/usePublicEvents.ts`.
