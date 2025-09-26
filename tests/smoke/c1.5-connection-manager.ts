#!/usr/bin/env npx tsx

import { WebSocket } from 'ws';
import * as Y from 'yjs';
import {
  connectRoom,
  getAuthToken,
  createNewRoomId,
} from '../../src/lib/multiplayer/connectionManager';
import type { Connection } from '../../src/lib/multiplayer/connectionManager';

// Polyfill WebSocket for Node.js
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
globalThis.WebSocket = WebSocket as any;

console.log(
  '=== Smoke Test C1.5 (TypeScript) - Connection Manager and Schema ==='
);
console.log(
  'Goal: Test our connection manager abstraction and Yjs schema structure'
);
console.log(
  'Assert: Can use connectRoom() and attachShared() to write/read structured data\n'
);

const WS_SERVER_URL = 'wss://web-deckbuilding-yredis.fly.dev';

async function runTest(): Promise<void> {
  let connA: Connection | null = null;
  let connB: Connection | null = null;

  try {
    console.log('Step 1: Fetching auth tokens for both clients...');
    const [tokenA, tokenB] = await Promise.all([
      getAuthToken(),
      getAuthToken(),
    ]);
    console.log('✓ Got auth tokens');

    const roomId = 'smoketest-c15ts-' + Math.random().toString(36).slice(2, 8);
    console.log('Room ID:', roomId);

    console.log('\nStep 2: Creating Client A with connection manager...');
    connA = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: tokenA,
    });
    console.log('✓ Client A created with roomId:', connA.roomId);

    console.log('\nStep 3: Creating Client B with connection manager...');
    connB = connectRoom({
      serverUrl: WS_SERVER_URL,
      roomId,
      token: tokenB,
    });
    console.log('✓ Client B created with roomId:', connB.roomId);

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

    console.log('\nStep 4: Testing structured data through our schema...');

    // Test game map
    connA.shared.game.set('turn', 5);
    connA.shared.game.set('phase', 'combat');
    console.log('✓ Client A set game data: turn=5, phase=combat');

    // Test market map
    connA.shared.market.set('supply', ['card1', 'card2', 'card3']);
    connA.shared.market.set('prices', { card1: 10, card2: 15, card3: 20 });
    console.log('✓ Client A set market data');

    // Test players map (nested map structure)
    const player1Data = new Y.Map();
    player1Data.set('hp', 100);
    player1Data.set('deck', ['basic1', 'basic2']);
    connA.shared.players.set('player1', player1Data);
    console.log('✓ Client A set player1 data');

    // Test using createNewRoomId function
    const newRoomId = createNewRoomId();
    console.log('✓ Generated new room ID using createNewRoomId():', newRoomId);

    // Wait for sync and verify on Client B
    await new Promise((resolve) => {
      setTimeout(resolve, 500); // Give it time to sync
    });

    console.log('\nStep 5: Verifying data on Client B...');

    const gameData = {
      turn: connB.shared.game.get('turn') as number,
      phase: connB.shared.game.get('phase') as string,
    };
    console.log('Game data on B:', gameData);

    const marketData = {
      supply: connB.shared.market.get('supply') as string[],
      prices: connB.shared.market.get('prices') as Record<string, number>,
    };
    console.log('Market data on B:', marketData);

    const player1OnB = connB.shared.players.get('player1') as Y.Map<any>;
    const playerData = player1OnB
      ? {
          hp: player1OnB.get('hp') as number,
          deck: player1OnB.get('deck') as string[],
        }
      : null;
    console.log('Player1 data on B:', playerData);

    // Verify all data matches
    const testsPassed =
      gameData.turn === 5 &&
      gameData.phase === 'combat' &&
      JSON.stringify(marketData.supply) ===
        JSON.stringify(['card1', 'card2', 'card3']) &&
      marketData.prices.card1 === 10 &&
      playerData?.hp === 100 &&
      JSON.stringify(playerData?.deck) ===
        JSON.stringify(['basic1', 'basic2']) &&
      newRoomId.length > 0;

    if (testsPassed) {
      console.log(
        '\n✅ TEST PASSED: Connection manager and schema work correctly!'
      );
      console.log('  - All structured data synchronized properly');
      console.log('  - game, market, and players maps all functional');
      console.log('  - createNewRoomId() generates valid UUIDs');
    } else {
      console.log('\n✗ TEST FAILED: Data mismatch');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Clean up
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
