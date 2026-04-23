<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Project Context

### Scaffold commands used
```
npx @tanstack/cli@latest create devtaproom-start --agent
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
```

### Stack
- **Framework**: TanStack Start (SSR + file-based routing)
- **Router**: TanStack Router (file-based, `/src/routes/`)
- **Data fetching**: TanStack Query (replaces RTK Query from original)
- **State**: Zustand (cart, UI language, auth)
- **Backend**: Supabase (PostgreSQL + Auth — same as original DevTaproom)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Build**: Vite 8 (requires **Node ≥ 20.19 or 22+** — use `.nvmrc` → `nvm use`)
- **Package manager**: npm
- **Deployment**: Vercel (portable/Node adapter)

### Routes (file-based)
| File | Route |
|------|-------|
| `src/routes/__root.tsx` | Root shell (QueryClientProvider, auth init) |
| `src/routes/index.tsx` | `/` — Home with categories + search |
| `src/routes/category.$categoryId.tsx` | `/category/:id` — Category items |
| `src/routes/cart.tsx` | `/cart` — Cart + checkout |
| `src/routes/order.$orderId.tsx` | `/order/:id` — Order confirmation + QR |

### Environment variables
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Key architectural decisions
- RTK Query replaced with `@tanstack/react-query` + `queryOptions` helpers in `src/queries/`
- Menu data fetched client-side via `menuQueryOptions()` (single query for categories + items)
- Zustand stores kept as-is from original (cart persisted to localStorage)
- Supabase Auth (Google OAuth) initialized in `AuthInit` component inside root shell
- Search state lives in URL search params (validated with zod in each route)
- `#/*` path alias maps to `src/*`

### Known gotchas
- Node version: must use Node 22+ (Vite 8 / rolldown requirement). Run `nvm use` in project root.
- Tailwind v4 uses `@import "tailwindcss"` syntax, not `@tailwind base/components/utilities`
- `createFileRoute` path must exactly match the file path (auto-generated `routeTree.gen.ts`)

### Next steps
- Deploy to Vercel (set env vars in Vercel dashboard)
- Add server-side data prefetching in route `loader` functions for SEO
- Wire up `AuthButton` component to header
- Explore React Server Components for menu data (`@tanstack/react-start/rsc`)

