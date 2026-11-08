# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (`packageManager` is pinned in `package.json`; `pnpm-workspace.yaml` disables build scripts for `sharp` and `unrs-resolver`).

- `pnpm dev` — dev server at http://localhost:3000 (Turbopack)
- `pnpm build` — production build (also runs type checking)
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript)

There is no test runner configured.

## Stack and configuration

- Next.js 16.4 (App Router, `app/` directory), React 19.3, TypeScript strict, Tailwind CSS v4.
- **Read the version-matched docs in `node_modules/next/dist/docs/` before writing Next.js code** (see AGENTS.md); APIs differ from older Next.js versions.
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`. With Cache Components on, dynamic data access must be wrapped in `<Suspense>` or cached with `"use cache"` — check the docs for the current rules.
- Tailwind v4 is wired through Turbopack: `*.css` files are processed by the `@tailwindcss/turbopack` loader (no `postcss.config` file). Theme tokens live in `app/globals.css` via `@import "tailwindcss"` and an `@theme inline` block mapping CSS variables (`--background`, `--foreground`, fonts) to Tailwind colors.
- Layouts/pages use the global typed helpers `LayoutProps<"/route">` / `PageProps<"/route">` instead of hand-written prop types.
- Path alias `@/*` resolves to the repo root.
- **Pages keep their state across navigations.** With Cache Components, Next hides pages with React `<Activity>` instead of unmounting them, and keeps up to 3 routes. Use `useOnHide` (from `lib/use-navigation-reset.ts`) to reset transient state on hide: submitting flags, success screens, open dialogs, and pending timers (cancel them, or they fire after the user has left). For overlays that live in a layout (menus, the cart sheet), close them with `useOnPathnameChange`. See `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
- **Instant-navigation rules (dev overlay warnings).** Read `params`/`searchParams` only inside a child wrapped in `<Suspense>`, never at the top of a page. Layouts must always render `children`: `AdminGuard` covers the panel with an overlay instead of dropping it. Inside a `<Suspense>` boundary, render `NotFoundView` rather than calling `notFound()`.

## Project state

This branch (`dev`) is a fresh start: a client-demo prototype of an e-commerce site for thekeyoffreedom, a local Costa Rican clothing brand (Spanish UI, CRC prices, Costa Rica only). The earlier Algolia-based prototype on `main` (nested `thekeyoffreedom/` folder) was discarded on purpose. Don't restore it or use it as a reference.

If the client approves the prototype, the production stack will be Supabase (Postgres), Drizzle, Hono, Zod, Cloudinary (images), and Vercel (deploy). For now the prototype runs on mock data with no backend.

## Conventions

- **Explicit types, not inferred.** Declare domain types as named `type`s and annotate Zod schemas as `z.ZodType<T>` (no `z.infer`). Annotate callback parameters and return types, including array callbacks and `superRefine` callbacks (`z.core.$RefinementCtx<T>`), and give functions explicit return types.
- UI copy is in Spanish (Costa Rica). Format money with `formatCRC`.
- Shared text helpers (`normalize`, `slugify`) live in `lib/text.ts`.

## Data architecture

- `lib/schemas.ts` declares the model types, each with a Zod schema annotated `z.ZodType<T>` so the compiler catches drift: category, then product, then variants (color × size, stock per variant) and images (optionally tagged by color). Sizes come from the fixed ordered list `SIZES` (with `"Única"`). Prices are integer CRC, IVA included. These schemas are meant to become the Drizzle tables and Hono validation later.
- `data/seed.ts` holds the static catalog. Its stock values are chosen on purpose to show the available, low-stock and out-of-stock states. `lib/catalog.ts` validates it with `catalogSchema` (a bad seed fails the build).
- `lib/catalog.ts` is the **only** data-access layer: async functions with `"use cache"`. Pages and components must call these functions, never import the seed directly, so that Supabase can replace the seed later without touching the UI.
- `lib/catalog-query.ts` holds pure search, filter, sort and pagination logic driven by URL params (`q, cat, talla, color, min, max, disponible, orden, pagina`). Size, color and availability filters match against the *same* variant. Facet counts are computed with the other filters applied. Search ignores accents, plural and gender.
- `lib/availability.ts` holds the stock-to-state logic (`LOW_STOCK_THRESHOLD = 3`) and `formatCRC`.
- Storefront routes are in `app/(store)/` (home, `tienda`, `tienda/[slug]`, `pedido`, `nosotros`, `contacto`), and their components are in `components/store/`. Catalog URL state is shared by `CatalogNavProvider` (`components/store/catalog/catalog-nav.tsx`), which updates the URL inside a transition. Product pages are prerendered with `generateStaticParams`.
- `lib/cart.ts` is the cart: a `useSyncExternalStore` store persisted in localStorage, empty on the server. Lines snapshot the product data and are capped at variant stock. `lib/order.ts` holds the order form schema and builds the WhatsApp message. `data/cr-locations.json` holds the province → canton → district data (from ubicaciones.paginasweb.cr, read via `lib/cr-locations.ts`). Brand constants and `whatsappUrl()` are in `lib/site.ts`.
- Visual accents from the effect libraries are installed through the shadcn registry, e.g. `components/ui/spotlight.tsx` from Aceternity. Its keyframes live in `globals.css` with a reduced-motion fallback.
- The admin panel lives in `app/admin/`; the store header and mobile menu link to it (`ADMIN_LINK` in `components/store/nav-links.ts`), which is intentional while this is a prototype. `login/` sits outside the `(panel)` group, which is wrapped by `AdminGuard` and `AdminShell`. Components are in `components/admin/`. `lib/admin-session.ts` holds the session, with hardcoded credentials checked client-side (`admin@thekeyoffreedom.com` / `LaLlave2026`). The login form is prefilled with them (`PREFILLED_CREDENTIALS`) so the client gets in with one click; remove that for production. production will swap in Supabase Auth behind the same `signIn`/`signOut`/`useAdminSession` API. Every save, delete or import validates, waits a little to feel like a request, then shows a toast. Nothing is persisted.
- `lib/product-import.ts` holds pure import logic: one row per variant, rows grouped by product name, header aliases ignore accents and case, and per-row errors are reported. Files are read client-side with SheetJS (`xlsx`, installed from the official cdn.sheetjs.com tarball, not npm) through a dynamic `import()`.
- Product photos live in `public/products/*.webp`. The raw Instagram download is in `_fuentes/instagram/`, which is gitignored and never served.
- The admin panel (`/admin`) is visual only: forms validate and confirm, but nothing persists. Only the cart persists, in `localStorage`. The UI must never say it is a demo.

## Agent skills

Project skills are vendored in `.agents/skills/` (tracked in `skills-lock.json`): `better-ui` (UI polish: surfaces, icons, motion) and `grill-me` (user-invoked plan/design interview).
