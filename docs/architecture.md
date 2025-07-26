## Architecture Overview

- **Frontend-only SPA**: No persistent backend storage, all state managed client-side
- **React 19** with TypeScript for UI components
- **Zustand** for state management (logged in dev mode)
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling and dev server

## Project Structure

```
src/
├── components/ui/     # Reusable UI components (button, input, header, spinner)
├── features/          # Feature-based modules with domain logic
├── hooks/             # Shared custom hooks
├── lib/               # Utilities, API config, helpers
├── routes/            # Routing configuration
├── store/             # Zustand stores
├── types/             # Shared TypeScript types
└── test/              # Test configuration
```