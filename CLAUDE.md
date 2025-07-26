# Web Deckbuilding SPA (React 19 + Vite)
A frontend-only single-page application for simulating deckbuilding experiences, built with React, TypeScript, and Vite.


## General Guidelines
### Non-negotiable rules
- Frontend-only: never add backend endpoints.
- Type-safe everywhere; **no `any`**.
- Code must pass `pnpm lint && pnpm format`.
- Don't create global state without justification
- Don't add external dependencies without checking existing patterns

### How Claude should work
1. Plan before edit, cite affected files.
2. Always run `pnpm test` and `pnpm typecheck`.
3. Respect `AIDEV-*` anchors (see below).

### Project commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | TypeScript compile + Vite build |
| `pnpm test` | Run vitest tests |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm format` | Format with Prettier |

### Anchor comments
Use `AIDEV-NOTE / TODO / QUESTION`, concise (≤120 chars). Never delete without human OK.
- **Important:** Before scanning files, always first try to **locate existing anchors** `AIDEV-*` in relevant subdirectories.  
- **Update relevant anchors** when modifying associated code.


## Features, Components, and State
### Feature Architecture
Each feature follows this structure:
```
features/[feature-name]/
├── hooks/           # Feature-specific hooks
├── pages/           # Page components for routing
├── services/        # API calls and business logic
├── types/           # Feature-specific types
├── validation/      # Schema validation (using Yup)
└── test/           # Feature tests
```
This applies to every feature directory inside src/features/ unless otherwise noted.

### Component Patterns
- Components in PascalCase, co-located with index.ts exports
- Use TypeScript interfaces for all props
- Prefer function components with hooks
- UI components in `components/ui/` for reusability

### State Management
- **Zustand stores** in `src/store/` for global state
- Store actions follow set/get patterns (see auth-store.ts:13)
- Use React Query for server state and caching
- Local component state with useState for UI-only state


## More docs
- Architecture: `docs/architecture.md`
- For scaffolding features, UI components, or applying styles, follow the steps in `docs/contribution.md`.
- When writing tests, follow `src/test/CLAUDE.md`.
- When editing api, follow `src/lib/CLAUDE.md`.