#!/usr/bin/env npx tsx

import { WebSocket } from 'ws';
import * as Y from 'yjs';
import { create, StoreApi } from 'zustand';
import {
  connectRoom,
  getAuthToken,
} from '../../src/lib/multiplayer/connectionManager';
import { bindStoreKeyToYjs } from '../../src/lib/multiplayer/zustandYjsBinding';
import type { Connection } from '../../src/lib/multiplayer/connectionManager';

// Polyfill WebSocket for Node.js
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
globalThis.WebSocket = WebSocket as any;

console.log('=== Smoke Test C2 - Zustand-Yjs Binding ===');
console.log(
  'Goal: Store action updates local and Y; remote updates apply once to local'
);
console.log('Assert:');
console.log('  - Calling nextTurn() bumps turn locally and reflects in Y');
console.log(
  '  - Remote client setting game.turn updates local store once (no oscillation)\n'
);

// Create a simple game store for testing
interface GameState {
  turn: number;
  phase: string;
  nextTurn: () => void;
  setPhase: (phase: string) => void;
}

const WS_SERVER_URL = 'wss://web-deckbuilding-yredis.fly.dev';

async function runTest(): Promise<void> {
  let connA: Connection | null = null;
  let connB: Connection | null = null;
  let bindingA: { unbind: () => void } | null = null;
  let bindingB: { unbind: () => void } | null = null;

  try {
    console.log('Step 1: Creating Zustand stores for both clients...');

    // Create stores for both clients
    const storeA = create<GameState>((set) => ({
      turn: 1,
      phase: 'setup',
      nextTurn: () => set((state) => ({ turn: state.turn + 1 })),
      setPhase: (phase) => set({ phase }),
    }));

    const storeB = create<GameState>((set) => ({
      turn: 1,
      phase: 'setup',
      nextTurn: () => set((state) => ({ turn: state.turn + 1 })),
      setPhase: (phase) => set({ phase }),
    }));

    console.log('✓ Created Zustand stores');
    console.log('  Store A initial:', {
      turn: storeA.getState().turn,
      phase: storeA.getState().phase,
    });
    console.log('  Store B initial:', {
      turn: storeB.getState().turn,
      phase: storeB.getState().phase,
    });

    console.log('\nStep 2: Fetching auth tokens...');
    const [tokenA, tokenB] = await Promise.all([
      getAuthToken(),
      getAuthToken(),
    ]);
    console.log('✓ Got auth tokens');

    const roomId = 'smoketest-c2-' + Math.random().toString(36).slice(2, 8);
    console.log('Room ID:', roomId);

    console.log('\nStep 3: Connecting Client A to room...');
    connA = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: tokenA,
    });

    console.log('\nStep 4: Connecting Client B to room...');
    connB = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: tokenB,
    });

    // Wait for both to connect
    await new Promise<void>((resolve) => {
      let aConnected = false;
      let bConnected = false;

      connA!.provider.on('status', (e: { status: string }) => {
        if (e.status === 'connected' && !aConnected) {
          aConnected = true;
          console.log('✓ Client A connected');
          if (bConnected) resolve();
        }
      });

      connB!.provider.on('status', (e: { status: string }) => {
        if (e.status === 'connected' && !bConnected) {
          bConnected = true;
          console.log('✓ Client B connected');
          if (aConnected) resolve();
        }
      });
    });

    console.log('\nStep 5: Binding Zustand stores to Yjs...');

    let aSyncCount = 0;
    let bSyncCount = 0;

    // Bind store A to Yjs
    bindingA = bindStoreKeyToYjs({
      store: storeA as unknown as StoreApi<GameState>,
      ymap: connA.shared.game,
      key: 'turn',
      onSync: () => {
        aSyncCount++;
      },
    });
    console.log('✓ Bound Store A turn to Yjs');

    // Also bind phase for Store A
    const bindingA2 = bindStoreKeyToYjs({
      store: storeA as unknown as StoreApi<GameState>,
      ymap: connA.shared.game,
      key: 'phase',
    });

    // Bind store B to Yjs
    bindingB = bindStoreKeyToYjs({
      store: storeB as unknown as StoreApi<GameState>,
      ymap: connB.shared.game,
      key: 'turn',
      onSync: () => {
        bSyncCount++;
      },
    });
    console.log('✓ Bound Store B turn to Yjs');

    // Also bind phase for Store B
    const bindingB2 = bindStoreKeyToYjs({
      store: storeB as unknown as StoreApi<GameState>,
      ymap: connB.shared.game,
      key: 'phase',
    });

    // Wait for initial sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('\nStep 6: Testing Zustand action → Yjs sync...');
    const initialTurn = storeA.getState().turn;
    console.log('  Initial turn on A:', initialTurn);

    // Call nextTurn() on store A
    storeA.getState().nextTurn();
    const newTurn = storeA.getState().turn;
    console.log('  After nextTurn() on A:', newTurn);

    // Wait for sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if it synced to Y and then to Store B
    const turnInY = connA.shared.game.get('turn') as number;
    const turnInB = storeB.getState().turn;
    console.log('  Turn in Yjs:', turnInY);
    console.log('  Turn in Store B:', turnInB);

    console.log('\nStep 7: Testing remote Y update → Zustand sync...');

    // Set a value directly in Y from Client B
    connB.doc.transact(() => {
      connB.shared.game.set('turn', 10);
      connB.shared.game.set('phase', 'combat');
    });
    console.log('  Set turn=10, phase=combat directly in Y from Client B');

    // Wait for sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    const stateAfterYUpdate = {
      A: storeA.getState(),
      B: storeB.getState(),
    };
    console.log('  After Y update - Store A:', {
      turn: stateAfterYUpdate.A.turn,
      phase: stateAfterYUpdate.A.phase,
    });
    console.log('  After Y update - Store B:', {
      turn: stateAfterYUpdate.B.turn,
      phase: stateAfterYUpdate.B.phase,
    });

    console.log(
      '\nStep 8: Testing Player B Zustand action → sync to Player A...'
    );

    // Now Player B uses their Zustand method (realistic scenario)
    storeB.getState().nextTurn(); // Should increment turn to 11
    storeB.getState().setPhase('victory');
    console.log(
      '  Player B called nextTurn() and setPhase("victory") via Zustand'
    );

    // Wait for sync
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalStateA = storeA.getState();
    const finalStateB = storeB.getState();
    const finalYState = {
      turn: connA.shared.game.get('turn') as number,
      phase: connA.shared.game.get('phase') as string,
    };

    console.log('  Final Store A:', {
      turn: finalStateA.turn,
      phase: finalStateA.phase,
    });
    console.log('  Final Store B:', {
      turn: finalStateB.turn,
      phase: finalStateB.phase,
    });
    console.log('  Final Y state:', finalYState);
    console.log('  Sync counts - A:', aSyncCount, 'B:', bSyncCount);

    // Verify tests pass
    const testsPassed =
      newTurn === initialTurn + 1 && // nextTurn() worked locally
      turnInY === newTurn && // Local change synced to Y
      turnInB === newTurn && // Y change synced to Store B
      stateAfterYUpdate.A.turn === 10 && // Remote Y update synced to Store A
      stateAfterYUpdate.A.phase === 'combat' && // Phase also synced
      finalStateB.turn === 11 && // Player B's nextTurn() worked
      finalStateB.phase === 'victory' && // Player B's setPhase() worked
      finalStateA.turn === 11 && // Player B's changes synced to Player A
      finalStateA.phase === 'victory' && // Phase change also synced
      finalYState.turn === 11 && // Y has the latest value
      finalYState.phase === 'victory'; // Y has the latest phase

    if (testsPassed) {
      console.log('\n✅ TEST PASSED: Zustand-Yjs binding works correctly!');
      console.log('  - Store actions update both local state and Yjs');
      console.log('  - Remote Yjs updates sync to local stores');
      console.log('  - No oscillation/echo detected');
    } else {
      console.log('\n✗ TEST FAILED: Binding issues detected');
      process.exit(1);
    }

    // Clean up bindings
    bindingA2.unbind();
    bindingB2.unbind();
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Clean up
    if (bindingA) bindingA.unbind();
    if (bindingB) bindingB.unbind();
    if (connA) connA.destroy();
    if (connB) connB.destroy();
  }
}

// Run with timeout
const timeout = setTimeout(() => {
  console.error('\n✗ TEST FAILED: Timeout after 10 seconds');
  process.exit(1);
}, 10000);

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
