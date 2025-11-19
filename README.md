# Web Deckbuilding

web-deckbuilding is a real-time multiplayer deckbuilding sandbox. You can access it at [web-deckbuilding.fly.dev](https://web-deckbuilding.fly.dev/). It features collaborative gameplay powered by Yjs and y-redis, with real-time state synchronization across multiple players. I built it to help me quickly iterate on the board game I'm creating; there weren't any suitable digital solutions so I was previously making physical cards, which took a lot longer.

<p align="center">
  <img src="screenshot.png" alt="Web Deckbuilding Screenshot" width="50%">
</p>

It supports both single-player and multiplayer modes; **single-player** has fully local state management with localStorage persistance, while **multiplayer** allows for real-time collaborative gameplay using y-redis.

This readme is longer than most; it's meant as a personal reference for when I haven't worked on this codebase in a while.

## 1.0 Architecture

> **Note**: This project started from the [react-query-zustand-ts-vite-boilerplate](https://github.com/ascii-16/react-query-zustand-ts-vite-boilerplate), which provided the initial setup for React Query, Zustand, TypeScript, and Vite, along with development tooling including ESLint, Prettier, Husky git hooks, and semantic-release. Check their readme for more detail on these components.

### 1.1 Core Layers

The application follows a three-tier architecture with mode-dependent persistence:

1. **Component Layer (UI)**: React components that handle user interactions and display. Components are organized by feature and primarily consume data from Zustand stores through hooks.

2. **Store Layer (State Management)**: Zustand stores that maintain application state and coordinate between components and services. Stores act as **thin wrappers** around service functions, handling state updates and persistence. Stores can reference each other for complex operations. For simple state updates that don't involve logic, they may exist only in Zustand and not show up in the service layer.

3. **Service Layer (Business Logic)**: Pure TypeScript functions that encapsulate all complex business logic and game rules. Services are **stateless** and operate on immutable data structures, returning new state rather than mutating existing state. They don't directly access stores, they only work with data passed to them.

**Persistence**:
- **Single-player**: Zustand's persist middleware with localStorage for automatic save/load. Each store has its own localStorage key (`player-store`, `game-store`, `market-store`). The application runs entirely in the browser with no server connection—state is automatically saved on changes and loaded on page refresh.
- **Multiplayer**: Y-redis for real-time synchronization with CRDT conflict resolution. State changes flow through Yjs CRDTs, synced via WebSocket connections to the y-redis server infrastructure (Redis streams for message distribution + Tigris S3 for permanent storage).

### 1.2 Data Flow Diagram

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
│  • Handles persistence                                     │
└────────┬───────────────────┬───────────────────────────────┘
         │                   │
         │           Delegates business logic
         │                   │
         │                   ▼
         │   ┌─────────────────────────────────────────────┐
         │   │           Service Layer                     │
         │   │  • Pure functions                           │
         │   │  • Immutable operations                     │
         │   │  • Business rules & game logic              │
         │   │  • Returns new state                        │
         │   └─────────────────────────────────────────────┘
         │
         └─── Persistence (mode-dependent)
              │
              ├─── Single-player ──▶ localStorage
              │
              └─── Multiplayer ──▶ Yjs (CRDT) ──▶ WebSocket ──▶ y-redis Server
                                                                      │
                                                                      ├─▶ Redis (streams)
                                                                      └─▶ Tigris S3 (persistence)
```

### 1.3 Overall File Structure

The project is organized with feature-based architecture and clear separation between frontend application code and multiplayer infrastructure:

```
web-deckbuilding/
├── src/                         # Frontend application code
│   ├── features/                # Feature modules (cards, player, game, market)
│   │   ├── cards/
│   │   ├── player/
│   │   ├── game/
│   │   └── market/
│   ├── lib/multiplayer/         # Multiplayer client code (Yjs integration)
│   ├── store/                   # Zustand stores (game, player, market)
│   └── components/              # Shared UI components
├── y-redis/                     # Multiplayer backend infrastructure
│   ├── bin/                     # Server and worker entry points
│   ├── src/                     # WebSocket server implementation
│   └── fly.*.toml               # Deployment configurations
└── fly.toml                     # Frontend deployment config
```

### 1.4 Feature File Structure

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
├── game/
│   └── ...
└── market/
    └── ...
```

### 1.5 State Management

Zustand is used to store state locally; for multiplayer it syncs with y-redis. Each store follows a consistent pattern:

1. **State Definition**: TypeScript interface defining the shape of the state
2. **Actions**: Methods that update state, typically by calling service functions
3. **Selectors**: Methods to read specific parts of state
4. **Persistence**: Automatic saving to localStorage (single-player) or Y-redis (multiplayer)

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
// Persistence (mode-dependent):
//
// Single-player:
//   → localStorage auto-saves via Zustand persist middleware
//
// Multiplayer:
//   → Zustand change detected by binding (zustandYjsBinding.ts)
//   → Yjs map updated with ORIGIN flag to prevent echo
//   → Y.Doc sends update via WebSocket to y-redis server
//   → Server broadcasts to other clients via Redis streams
//   → Other clients receive update, apply to their Yjs map
//   → Remote Yjs changes trigger store.setState() (skipping echo)
  ↓
// Component re-renders with new state (local + remote clients)
```


## 2.0 Multiplayer Architecture

### 2.1 Overview

The multiplayer system uses [y-redis](https://github.com/yjs/y-redis) (which uses a CRDT library called Yjs under the hood) to enable real-time collaborative gameplay. Multiple players can join a room via a 6-character room code and see each other's actions in real-time.

**Technology Stack**:
- **Yjs**: CRDT (Conflict-free Replicated Data Types) library for conflict-free state synchronization
- **y-redis**: Backend infrastructure for Yjs using Redis and S3 storage
- **Upstash Redis**: Managed Redis instance for message distribution
- **Tigris S3**: Object storage for permanent document persistence

### 2.2 Multiplayer File Structure

**Frontend** (`/src/`):
```
src/
├── lib/multiplayer/
│   ├── connectionManager.ts    # WebSocket connections, JWT auth, room lifecycle
│   ├── multiplayerManager.ts   # Singleton coordinating room and store bindings
│   ├── zustandYjsBinding.ts    # Bidirectional sync between Zustand and Yjs
│   └── yjsSchema.ts            # Shared document structure (game, market, players)
├── store/
│   ├── game-store.ts           # Multiplayer actions (createRoom, joinRoom, leaveRoom)
│   ├── market-store.ts         # Market/catalog state
│   └── player-store.ts         # Player state
└── components/
    └── MultiplayerControls.tsx # Modal-based multiplayer UI in GameHeader
```

**y-redis Server** (`/y-redis/`):
```
y-redis/
├── bin/
│   ├── server.js    # WebSocket server entry point
│   └── worker.js    # Background persistence worker entry point
├── src/
│   ├── api.js       # Redis client and document management
│   ├── server.js    # WebSocket server setup with uWebSockets.js
│   ├── ws.js        # WebSocket protocol implementation
│   └── storage/
│       ├── s3.js        # Tigris/S3 storage provider
│       ├── postgres.js  # PostgreSQL storage provider
│       └── memory.js    # In-memory storage fallback
├── fly.server.toml  # Server deployment config
└── fly.worker.toml  # Worker deployment config
```

### 2.3 Key Components

- `connectionManager.ts`: Establishes WebSocket connections with JWT authentication and manages room lifecycle with 6-character alphanumeric room codes.
- `multiplayerManager.ts`: Singleton class coordinating connection, store binding, and synchronization across game, market, and player stores.
- `zustandYjsBinding.ts`: Two-way sync between Zustand stores and Y.js maps with deep equality checks to prevent echo loops.
- `bin/server.js`: WebSocket server handling client connections, JWT verification, and permission callbacks with health checks.
- `bin/worker.js`: Background process monitoring Redis queue, compacting streams, and persisting documents to Tigris storage.
- **Redis Streams**: Fast message distribution with 7-day TTL, using Lua scripts for atomic operations.
- **Tigris Storage**: Permanent document storage in S3-compatible format using Yjs updateV2 binary format.

### 2.4 Synchronization Flow

**Initial Connection & Sync:**
```typescript
// User joins room
multiplayerManager.joinRoom(roomId)
  ↓
// Fetch JWT token (cached 55min) - connectionManager.ts:70
getAuthToken() → fetch('/auth/token')
  ↓
// Establish WebSocket connection - connectionManager.ts:18
connectRoom({ serverUrl, roomId, token })
  → new Y.Doc()
  → new WebsocketProvider(serverUrl, roomId, doc, { params: { yauth: token } })
  ↓
// Server verifies JWT and establishes connection
  ↓
// Create bidirectional bindings - multiplayerManager.ts:161-189
bindMultipleKeys(gameStore, shared.game, ['game'])
bindMultipleKeys(marketStore, shared.market, ['catalog'])
bindMultipleKeys(playerStore, shared.game, ['players'])
  ↓
// Bindings initialize: hydrate Zustand from Y.Doc if exists, else seed Y.Doc
// (zustandYjsBinding.ts:59-85)
```

**Real-time Updates:**
```typescript
// Player makes change (e.g., draws card)
usePlayerStore.drawPlayerCard(playerId)
  ↓
// Zustand store updates locally (same as single-player)
  ↓
// Binding detects change - zustandYjsBinding.ts:109-124
store.subscribe() → detects state[key] changed
  ↓
// Update Yjs (including ORIGIN flag, which prevents echo)
ymap.doc.transact(() => ymap.set(key, currentValue), ORIGIN)
  ↓
// WebsocketProvider sends update to y-redis server
  ↓
// Server broadcasts via Redis streams to other clients
  ↓
// Other clients receive Yjs update
  ↓
// Remote binding applies update - zustandYjsBinding.ts:88-106
yObserver() → if (txn.origin !== ORIGIN)
  → store.setState({ [key]: newValue })
  ↓
// All clients' components re-render with synchronized state
```

**Background Persistence:** Worker process periodically persists Y.Doc snapshots from Redis to Tigris S3 storage for durability and recovery.


## 3.0 Deployment

### 3.1 Fly.io Apps

**1. Frontend + Single Player (`web-deckbuilding` / `web-deckbuilding-dev`)**
- **Config**: `fly.toml`
- **Build**: `pnpm run build` (builds static assets via Vite)
- **Runtime**: Static files served via nginx
- **Description**: React SPA with all single-player game logic and frontend code; GitHub Actions auto-deploys to `web-deckbuilding` on push to `main` or `web-deckbuilding-dev` on push to `develop`

**2. y-redis Server (`web-deckbuilding-yredis`)**
- **Config**: `y-redis/fly.server.toml`
- **Command**: `npm run start:both` (runs `node ./bin/auth-server-example.js` + `node ./bin/server.js`)
- **Description**: WebSocket server handling multiplayer connections, JWT verification, and real-time message distribution

**3. y-redis Worker (`web-deckbuilding-yredis-worker`)**
- **Config**: `y-redis/fly.worker.toml`
- **Command**: `node ./bin/worker.js`
- **Description**: Background worker for document persistence, stream compaction, and Redis cleanup

### 3.2 External Services

- **Upstash Redis**: Managed Redis instance integrated via Fly.io secrets, eliminating the need to self-host Redis infrastructure for real-time message distribution and temporary state storage.

- **Tigris Storage**: S3-compatible object storage service integrated via Fly.io, used for permanent Yjs document persistence to keep all infrastructure within the Fly.io ecosystem.

### 3.3 Environment Variables & Secrets

**Frontend Environment Variables**
- **Local Development**: Copy `.env.example` to `.env` and configure for local development. Vite automatically reads these variables during `pnpm dev`.
- **Production (Fly.io)**: Environment variables are configured in `fly.toml` under `[build.args]` section. These are passed as Docker build arguments and baked into the JavaScript bundle at build time by Vite (see `Dockerfile:35-38`).

**y-redis Server & Worker Secrets**

Both `web-deckbuilding-yredis` (server) and `web-deckbuilding-yredis-worker` (worker) require the same secrets. Run each command twice: once with `-a web-deckbuilding-yredis` and once with `-a web-deckbuilding-yredis-worker`:
```bash
# Redis connection (Upstash Redis)
fly secrets set REDIS=redis://default:xxx@xxx.upstash.io:6379 -a [app]

# S3 storage (Tigris)
fly secrets set S3_ACCESS_KEY=xxx -a [app]
fly secrets set S3_SECRET_KEY=xxx -a [app]
fly secrets set S3_BUCKET=xxx -a [app]
fly secrets set S3_ENDPOINT=fly.storage.tigris.dev -a [app]
fly secrets set S3_REGION=auto -a [app]
fly secrets set S3_PORT=443 -a [app]
fly secrets set S3_SSL=true -a [app]

# JWT authentication (generate with openssl or similar)
fly secrets set AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nxxx\n-----END PUBLIC KEY-----" -a [app]
fly secrets set AUTH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----" -a [app]
fly secrets set AUTH_PERM_CALLBACK=http://127.0.0.1:5173/auth/perm -a [app]

# Optional: Redis room TTL in seconds (default: 604800 = 7 days; y-redis/src/api.js:114)
fly secrets set REDIS_ROOM_TTL=86400 -a [app]  # Example: 1 day
```

### 3.4 Deployment Pipeline

**App Deployment:**
GitHub Actions (`.github/workflows/fly-deploy.yml`) automatically deploys the frontend on push to `main` or `develop` branches. Uses separate Fly.io API deploy tokens (`FLY_API_TOKEN` for production, `DEV_FLY_API_TOKEN` for dev) with remote builds on Fly.io infrastructure.

**y-redis Deployment:**
The y-redis server and worker apps are deployed separately and manually since changes to the y-redis repo are infrequent:
```bash
cd y-redis
flyctl deploy --app web-deckbuilding-yredis --config fly.server.toml
flyctl deploy --app web-deckbuilding-yredis-worker --config fly.worker.toml
```

## 4.0 Feature Backlog
- Editing/deletion of market cards
- Drag and drop for cards in the player section
- Improve appearance using (cleaner / more modern Tailwind)
- Specify attributes to be automatically tracked on card play (e.g. actions, coins)
- Extensive testing for more than two players