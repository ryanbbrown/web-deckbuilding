#!/usr/bin/env node

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import ws from 'ws';

console.log('=== Smoke Test C1.5 - Connection Manager and Schema ===');
console.log(
  'Goal: Test our connection manager abstraction and Yjs schema structure'
);
console.log(
  'Assert: Can use our schema structure to write/read structured data\n'
);

// Inline the schema functions since we can't import TS directly
const attachShared = (doc) => ({
  game: doc.getMap('game'),
  market: doc.getMap('market'),
  players: doc.getMap('players'),
});

const initializeDoc = (doc) => {
  doc.getMap('game');
  doc.getMap('market');
  doc.getMap('players');
};

// Inline connection manager logic
const connectRoom = ({ serverUrl, roomId, token }) => {
  const doc = new Y.Doc();

  // Ensure the doc has the right structure
  initializeDoc(doc);

  // Get typed references to the maps
  const shared = attachShared(doc);

  const provider = new WebsocketProvider(serverUrl, roomId, doc, {
    WebSocketPolyfill: ws,
    params: { yauth: token },
  });

  provider.on('status', (e) => {
    console.log('[ws]', e.status);
  });

  provider.on('sync', (isSynced) => {
    console.log('[ws] sync', isSynced);
  });

  const destroy = () => {
    provider.destroy();
    doc.destroy();
  };

  return { doc, provider, shared, destroy, roomId };
};

const getAuthToken = async () => {
  const response = await fetch(
    'https://web-deckbuilding-yredis.fly.dev/auth/token'
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch token: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
};

async function runTest() {
  try {
    console.log('Step 1: Fetching auth tokens for both clients...');
    const [tokenA, tokenB] = await Promise.all([
      getAuthToken(),
      getAuthToken(),
    ]);
    console.log('✓ Got auth tokens');

    const roomId = 'smoketest-c15-' + Math.random().toString(36).slice(2, 8);
    console.log('Room ID:', roomId);

    console.log(
      '\nStep 2: Creating Client A with connection manager pattern...'
    );
    const connA = connectRoom({
      serverUrl: 'wss://web-deckbuilding-yredis.fly.dev',
      roomId,
      token: tokenA,
    });
    console.log('✓ Client A created with roomId:', connA.roomId);

    console.log(
      '\nStep 3: Creating Client B with connection manager pattern...'
    );
    const connB = connectRoom({
      serverUrl: 'wss://web-deckbuilding-yredis.fly.dev',
      roomId,
      token: tokenB,
    });
    console.log('✓ Client B created with roomId:', connB.roomId);

    // Wait for both to connect
    await new Promise((resolve) => {
      let aConnected = false;
      let bConnected = false;

      connA.provider.on('status', (e) => {
        if (e.status === 'connected' && !aConnected) {
          aConnected = true;
          console.log('✓ Client A connected');
          if (bConnected) resolve();
        }
      });

      connB.provider.on('status', (e) => {
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

    // Wait for sync and verify on Client B
    await new Promise((resolve) => {
      setTimeout(resolve, 500); // Give it time to sync
    });

    console.log('\nStep 5: Verifying data on Client B...');

    const gameData = {
      turn: connB.shared.game.get('turn'),
      phase: connB.shared.game.get('phase'),
    };
    console.log('Game data on B:', gameData);

    const marketData = {
      supply: connB.shared.market.get('supply'),
      prices: connB.shared.market.get('prices'),
    };
    console.log('Market data on B:', marketData);

    const player1OnB = connB.shared.players.get('player1');
    const playerData = player1OnB
      ? {
          hp: player1OnB.get('hp'),
          deck: player1OnB.get('deck'),
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
      JSON.stringify(playerData?.deck) === JSON.stringify(['basic1', 'basic2']);

    if (testsPassed) {
      console.log(
        '\n✅ TEST PASSED: Connection manager pattern and schema work correctly!'
      );
      console.log('  - All structured data synchronized properly');
      console.log('  - game, market, and players maps all functional');
    } else {
      console.log('\n✗ TEST FAILED: Data mismatch');
    }

    // Clean up
    connA.destroy();
    connB.destroy();
    process.exit(testsPassed ? 0 : 1);
  } catch (error) {
    console.error('\n✗ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run with timeout
const timeout = setTimeout(() => {
  console.error('\n✗ TEST FAILED: Timeout after 10 seconds');
  process.exit(1);
}, 10000);

runTest().then(() => clearTimeout(timeout));
