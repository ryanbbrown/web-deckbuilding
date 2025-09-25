# Web Deckbuilding

## Overview

This application is a frontend-only single-page application (SPA) for simulating deckbuilding card games. It follows a layered architecture with clear separation of concerns between UI components, business logic services, and state management.

## Core Layers

### 1. Component Layer (UI)
React components that handle user interactions and display. Components are organized by feature and primarily consume data from Zustand stores through hooks.

### 2. Store Layer (State Management)
Zustand stores that maintain application state and coordinate between components and services. Stores act as **thin wrappers** around service functions, handling state updates and persistence. Stores can reference each other for complex operations.

For simple state updates that don't involve logic, they may exist only in Zustand and not show up in the service layer.

### 3. Service Layer (Business Logic)
Pure TypeScript functions that encapsulate all complex business logic and game rules. Services are **stateless** and operate on immutable data structures, returning new state rather than mutating existing state. They don't directly access stores, they only work with data passed to them.



## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     React Components                       │
│  (User interactions, event handlers, UI rendering)         │
└────────────────┬────────────────────┬──────────────────────┘
                 │                    │
                 ▼                    ▼
         Reads state          Calls actions
                 │                    │
┌────────────────▼────────────────────▼──────────────────────┐
│                    Zustand Stores                          │
│  • Maintains state                                         │
│  • Provides selectors                                      │
│  • Exposes actions (thin wrappers)                         │
│  • Handles persistence to localStorage                     │
└────────────────┬───────────────────────────────────────────┘
                 │
         Delegates business logic
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  • Pure functions                                           │
│  • Immutable operations                                     │
│  • Business rules & game logic                              │
│  • Returns new state                                        │
└─────────────────────────────────────────────────────────────┘
```

## Code Organization

### Feature Folders
Code is organized by feature (cards, player, game, market) rather than by type, keeping related code together:

```
src/features/
├── cards/
│   ├── components/   # UI components
│   ├── services/     # Business logic
│   └── types/        # TypeScript definitions
├── player/
│   ├── components/
│   ├── services/
│   └── types/
└── game/
    ├── components/
    ├── services/
    └── types/
```

### Adding New Features
1. Define types in `features/[feature]/types`
2. Implement business logic in `features/[feature]/services`
3. Create/update store in `src/store`
4. Build UI components in `features/[feature]/components`
5. Wire up in main App component


## State Management Details

### Zustand Store Structure
Each store follows a consistent pattern:

1. **State Definition**: TypeScript interface defining the shape of the state
2. **Actions**: Methods that update state, typically by calling service functions
3. **Selectors**: Methods to read specific parts of state
4. **Persistence**: Automatic saving to localStorage

Example flow:
```typescript
// Component calls store action
usePlayerStore.drawPlayerCard(playerId)
  ↓
// Store delegates to service
drawCard(player)
  ↓
// Service returns new state
{ player: updatedPlayer, drawnCard: card }
  ↓
// Store updates its state
set((state) => ({ players: { ...state.players, [playerId]: updatedPlayer } }))
  ↓
// Component re-renders with new state
```

### Persistence Layer
The application uses Zustand's persist middleware with localStorage:

- **Automatic Saving**: State changes are automatically persisted to browser localStorage
- **Automatic Loading**: State is restored on page refresh

Each store has its own localStorage key, as shown below. You can think of localStorage as a dict; each key refers to a store, and the value is a JSON-serializable string that contains the store's data (matching the store interface defined at the top of each of the store files).

Storage keys:
- `player-store`: Player data and their cards
- `game-store`: Game configuration and settings
- `market-store`: Available card catalog
