# YRedis Multiplayer Integration Implementation Plan

## Context
The basic deployment of y-redis on fly.io is already working. You can test it using the player test files in `web-deckbuilding/y-redis/tests`.


## Environment Setup

1. Install Y.js ecosystem and routing dependencies:
```bash
pnpm add yjs y-websocket y-indexeddb react-router-dom
```

2. Install TypeScript definitions:
```bash
pnpm add -D @types/react-router-dom
```

3. Verify YRedis backend is accessible:
```bash
curl https://web-deckbuilding-yredis.fly.dev/health
```

## Core Infrastructure

4. Create `src/features/multiplayer/types/index.ts` with interfaces for YjsDocumentStructure, MultiplayerConnection, RoomMetadata, and AuthToken

5. Create `src/features/multiplayer/services/auth-service.ts` with fetchAuthToken(), refreshToken(), and validateRoomAccess() functions. Make sure to reference the existing /y-redis/bin/auth-server-example.js, which currently works.

6. Create `src/features/multiplayer/services/yjs-document.ts` with GameDocument class that manages Y.Doc schema and provides granular update methods

7. Create `src/features/multiplayer/services/sync-bridge.ts` with SyncBridge class to handle bidirectional Zustand-Y.js synchronization with loop prevention

8. Create `src/features/multiplayer/hooks/useMultiplayerSync.ts` hook for React component integration with connection lifecycle management

9. Verify types and services compile correctly:
```bash
pnpm typecheck && pnpm lint
```

## State Management

10. Create `src/store/multiplayer-store.ts` with connection state, room metadata, and actions (createRoom, joinRoom, leaveRoom) - no persistence middleware

11. Update `src/store/game-store.ts` to conditionally skip localStorage hydration in multiplayer mode and notify sync bridge on state changes

12. Update `src/store/player-store.ts` to sync player actions through Y.js when connected

13. Update `src/store/market-store.ts` to broadcast market changes through Y.js when connected

14. Test store changes don't break existing functionality:
```bash
pnpm test && pnpm typecheck
```

## Routing

15. Create `src/features/multiplayer/router/RoomRoute.tsx` wrapper component that validates room ID and handles join logic

16. Update `src/main.tsx` to add React Router with routes for "/" (single-player) and "/room/:roomId" (multiplayer)

17. Test routing changes and app still loads using the Playwright MCP.
```bash
pnpm dev
```

## UI Components

18. Create `src/features/multiplayer/components/CreateRoomButton.tsx` that generates room ID, copies shareable link, and navigates to room

19. Create `src/features/multiplayer/components/JoinRoomModal.tsx` with room code input and validation

20. Create `src/features/multiplayer/components/ConnectionStatus.tsx` to display connection state with visual indicators

21. Update `src/components/GameHeader.tsx` to include CreateRoomButton, JoinRoomModal trigger, and ConnectionStatus in top-right area

22. Test UI components render without errors:
```bash
pnpm test && pnpm dev
```

## WebSocket Integration

23. Create `src/features/multiplayer/services/websocket-provider.ts` with ManagedWebSocketProvider class for connection management and reconnection logic

24. Implement Y.js document initialization in sync-bridge.ts with gameMap, playersMap, and marketArray structure

25. Add bidirectional observers between Y.js documents and Zustand stores with debouncing and update tracking

26. Test WebSocket connection can be established:
```bash
node tests/player_one_test.js
```

## Integration Testing

27. Create `src/features/multiplayer/test/multiplayer-store.test.ts` for store unit tests

28. Create `src/features/multiplayer/test/sync-bridge.test.ts` for synchronization logic tests

29. Run unit tests to verify multiplayer logic:
```bash
pnpm test
```

30. Create `tests/e2e/multiplayer-basic.spec.ts` using two browser contexts to test room creation, joining, and state sync

31. Run E2E tests to verify full multiplayer flow:
```bash
pnpm test:e2e
```

## Final Verification

32. Run complete verification suite:
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```

33. Build and test production bundle:
```bash
pnpm build && pnpm preview
```