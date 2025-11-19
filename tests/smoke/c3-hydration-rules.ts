#!/usr/bin/env npx tsx

import { WebSocket } from 'ws';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Polyfill WebSocket for Node.js
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
globalThis.WebSocket = WebSocket as any;

// Mock localStorage for Node.js
const mockStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
};

// Create the real game store structure but for testing
const createGameStore = (storeName: string, initialGame: any = null) => {
  return create(
    persist(
      (set: any, get: any) => ({
        game: initialGame,
        roomId: null,
        isConnected: false,

        createGame: () => {
          set({
            game: {
              market: { catalog: [] },
              players: [],
              startingDeckComposition: { basic: 10 },
              startingHandSize: 5,
            },
          });
        },

        createRoom: async () => {
          // Mock implementation for testing
          const roomId = 'test-room-' + Math.random().toString(36).slice(2, 8);
          set({ roomId, isConnected: true });
          return roomId;
        },

        joinRoom: async (roomId: string) => {
          set({ roomId, isConnected: true });
        },

        leaveRoom: () => {
          set({ roomId: null, isConnected: false });
        },

        getGame: () => get().game,
      }),
      {
        name: storeName,
        storage: createJSONStorage(() => mockStorage),
      }
    )
  );
};

console.log(
  '=== Smoke Test C3 - Initial Hydration Rules (Real Store Structure) ==='
);
console.log('Goal:');
console.log('  - If doc empty: first join seeds from local snapshot');
console.log('  - If doc has data: joining clients prefer doc over local state');
console.log('Assert:');
console.log(
  '  - Host creates room and seeds; Joiner reads Host state after sync'
);
console.log(
  '  - Refresh Joiner; state rehydrates from Y, not from localStorage\n'
);

async function runTest(): Promise<void> {
  let hostConn: Connection | null = null;
  let joinerConn: Connection | null = null;
  let joinerConn2: Connection | null = null;
  let hostBinding: Binding | null = null;
  let joinerBinding: Binding | null = null;
  let joinerBinding2: Binding | null = null;

  try {
    console.log('Step 1: Creating Host with initial state...');

    // Host has existing local state
    const hostStore = create<GameState>((set) => ({
      turn: 5,
      phase: 'battle',
      seed: 'host-seed-123',
      setTurn: (turn) => set({ turn }),
      setPhase: (phase) => set({ phase }),
      setSeed: (seed) => set({ seed }),
    }));

    console.log('  Host initial state:', {
      turn: hostStore.getState().turn,
      phase: hostStore.getState().phase,
      seed: hostStore.getState().seed,
    });

    console.log('\nStep 2: Host creates room...');
    const [hostToken] = await Promise.all([getAuthToken()]);
    const roomId = createNewRoomId();
    console.log('  Room ID:', roomId);

    hostConn = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: hostToken,
    });

    // Wait for host to connect
    await new Promise<void>((resolve) => {
      hostConn!.provider.on('status', (e) => {
        if (e.status === 'connected') {
          console.log('  ✓ Host connected');
          resolve();
        }
      });
    });

    // Host binds - should seed Y from local state since Y is empty
    console.log('\nStep 3: Host binds to Y (should seed from local)...');
    hostBinding = bindStoreKeyToYjs({
      store: hostStore as unknown as StoreApi<GameState>,
      ymap: hostConn.shared.game,
      key: 'turn',
    });
    const hostBinding2 = bindStoreKeyToYjs({
      store: hostStore as unknown as StoreApi<GameState>,
      ymap: hostConn.shared.game,
      key: 'phase',
    });
    const hostBinding3 = bindStoreKeyToYjs({
      store: hostStore as unknown as StoreApi<GameState>,
      ymap: hostConn.shared.game,
      key: 'seed',
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const yStateAfterHost = {
      turn: hostConn.shared.game.get('turn'),
      phase: hostConn.shared.game.get('phase'),
      seed: hostConn.shared.game.get('seed'),
    };
    console.log('  Y state after host bind:', yStateAfterHost);

    console.log('\nStep 4: Joiner connects with different local state...');

    // Joiner has different local state
    const joinerStore = create<GameState>((set) => ({
      turn: 1,
      phase: 'setup',
      seed: 'joiner-seed-456',
      setTurn: (turn) => set({ turn }),
      setPhase: (phase) => set({ phase }),
      setSeed: (seed) => set({ seed }),
    }));

    console.log('  Joiner initial state:', {
      turn: joinerStore.getState().turn,
      phase: joinerStore.getState().phase,
      seed: joinerStore.getState().seed,
    });

    const joinerToken = await getAuthToken();
    joinerConn = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: joinerToken,
    });

    // Wait for joiner to connect and sync
    await new Promise<void>((resolve) => {
      joinerConn!.provider.on('sync', (isSynced) => {
        if (isSynced) {
          console.log('  ✓ Joiner connected and synced');
          resolve();
        }
      });
    });

    // Joiner binds - should hydrate from Y since Y has data
    console.log('\nStep 5: Joiner binds to Y (should hydrate from Y)...');
    joinerBinding = bindStoreKeyToYjs({
      store: joinerStore as unknown as StoreApi<GameState>,
      ymap: joinerConn.shared.game,
      key: 'turn',
    });
    const joinerBinding2b = bindStoreKeyToYjs({
      store: joinerStore as unknown as StoreApi<GameState>,
      ymap: joinerConn.shared.game,
      key: 'phase',
    });
    const joinerBinding3 = bindStoreKeyToYjs({
      store: joinerStore as unknown as StoreApi<GameState>,
      ymap: joinerConn.shared.game,
      key: 'seed',
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const joinerStateAfterBind = {
      turn: joinerStore.getState().turn,
      phase: joinerStore.getState().phase,
      seed: joinerStore.getState().seed,
    };
    console.log('  Joiner state after bind:', joinerStateAfterBind);

    console.log(
      '\nStep 6: Simulating Joiner refresh (new connection, same Y data)...'
    );

    // Clean up first joiner connection
    joinerBinding.unbind();
    joinerBinding2b.unbind();
    joinerBinding3.unbind();
    joinerConn.destroy();

    // Create new store for "refreshed" joiner with different local state
    const joinerStore2 = create<GameState>((set) => ({
      turn: 99,
      phase: 'refresh-phase',
      seed: 'refresh-seed-789',
      setTurn: (turn) => set({ turn }),
      setPhase: (phase) => set({ phase }),
      setSeed: (seed) => set({ seed }),
    }));

    console.log('  Refreshed joiner initial state:', {
      turn: joinerStore2.getState().turn,
      phase: joinerStore2.getState().phase,
      seed: joinerStore2.getState().seed,
    });

    const joinerToken2 = await getAuthToken();
    joinerConn2 = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: joinerToken2,
    });

    // Wait for connection and sync
    await new Promise<void>((resolve) => {
      joinerConn2!.provider.on('sync', (isSynced) => {
        if (isSynced) {
          console.log('  ✓ Refreshed joiner connected and synced');
          resolve();
        }
      });
    });

    // Bind again - should still hydrate from Y
    joinerBinding2 = bindStoreKeyToYjs({
      store: joinerStore2 as unknown as StoreApi<GameState>,
      ymap: joinerConn2.shared.game,
      key: 'turn',
    });
    const joinerBinding2c = bindStoreKeyToYjs({
      store: joinerStore2 as unknown as StoreApi<GameState>,
      ymap: joinerConn2.shared.game,
      key: 'phase',
    });
    const joinerBinding2d = bindStoreKeyToYjs({
      store: joinerStore2 as unknown as StoreApi<GameState>,
      ymap: joinerConn2.shared.game,
      key: 'seed',
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const refreshedJoinerState = {
      turn: joinerStore2.getState().turn,
      phase: joinerStore2.getState().phase,
      seed: joinerStore2.getState().seed,
    };
    console.log('  Refreshed joiner state after bind:', refreshedJoinerState);

    // Verify tests
    const testsPassed =
      // Host seeded Y with its local state
      yStateAfterHost.turn === 5 &&
      yStateAfterHost.phase === 'battle' &&
      yStateAfterHost.seed === 'host-seed-123' &&
      // Joiner hydrated from Y, not its local state
      joinerStateAfterBind.turn === 5 &&
      joinerStateAfterBind.phase === 'battle' &&
      joinerStateAfterBind.seed === 'host-seed-123' &&
      // Refreshed joiner also hydrated from Y
      refreshedJoinerState.turn === 5 &&
      refreshedJoinerState.phase === 'battle' &&
      refreshedJoinerState.seed === 'host-seed-123';

    if (testsPassed) {
      console.log('\n✅ TEST PASSED: Initial hydration rules work correctly!');
      console.log('  - Empty Y doc was seeded from first client (host)');
      console.log('  - Joining clients hydrated from Y, not local state');
      console.log('  - Refresh/reconnect consistently hydrates from Y');
    } else {
      console.log('\n✗ TEST FAILED: Hydration issues detected');
      process.exit(1);
    }

    // Clean up
    hostBinding2.unbind();
    hostBinding3.unbind();
    joinerBinding2c.unbind();
    joinerBinding2d.unbind();
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error);
    process.exit(1);
  } finally {
    if (hostBinding) hostBinding.unbind();
    if (joinerBinding) joinerBinding.unbind();
    if (joinerBinding2) joinerBinding2.unbind();
    if (hostConn) hostConn.destroy();
    if (joinerConn) joinerConn.destroy();
    if (joinerConn2) joinerConn2.destroy();
  }
}

// Run with timeout
const timeout = setTimeout(() => {
  console.error('\n✗ TEST FAILED: Timeout after 15 seconds');
  process.exit(1);
}, 15000);

runTest()
  .then(() => {
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('Unhandled error:', error);
    process.exit(1);
  });
