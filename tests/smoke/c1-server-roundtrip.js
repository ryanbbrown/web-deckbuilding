#!/usr/bin/env node

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import ws from 'ws';

console.log('=== Smoke Test C1 - Server Round-Trip of a Key ===');
console.log(
  'Goal: Writes travel through the server and are observable by another client.'
);
console.log(
  'Assert: Client A sets ymap.set("counter", n); Client B sees counter === n.\n'
);

console.log('Step 1: Fetching tokens for both clients...');
const fetchToken = async () => {
  const response = await fetch(
    'https://web-deckbuilding-yredis.fly.dev/auth/token'
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch token: ${response.status}`);
  }
  return response.text();
};

let tokenA, tokenB;
try {
  [tokenA, tokenB] = await Promise.all([fetchToken(), fetchToken()]);
  console.log('✓ Fetched tokens for both clients');
} catch (error) {
  console.error('✗ Error fetching tokens:', error);
  process.exit(1);
}

const room = 'smoketest-c1-' + Math.random().toString(36).slice(2, 8);
console.log('Room:', room);

console.log('\nStep 2: Creating Client A...');
const docA = new Y.Doc();
const providerA = new WebsocketProvider(
  'wss://web-deckbuilding-yredis.fly.dev',
  room,
  docA,
  {
    WebSocketPolyfill: ws,
    params: { yauth: tokenA },
  }
);

const ymapA = docA.getMap('state');
console.log('✓ Client A created');

console.log('\nStep 3: Creating Client B...');
const docB = new Y.Doc();
const providerB = new WebsocketProvider(
  'wss://web-deckbuilding-yredis.fly.dev',
  room,
  docB,
  {
    WebSocketPolyfill: ws,
    params: { yauth: tokenB },
  }
);

const ymapB = docB.getMap('state');
console.log('✓ Client B created');

let clientAConnected = false;
let clientBConnected = false;
let testCompleted = false;
const timeout = 10000;
const testValue = Math.floor(Math.random() * 1000);

providerA.on('status', (e) => {
  if (e.status === 'connected' && !clientAConnected) {
    clientAConnected = true;
    console.log('✓ Client A connected');
    checkAndRunTest();
  }
});

providerB.on('status', (e) => {
  if (e.status === 'connected' && !clientBConnected) {
    clientBConnected = true;
    console.log('✓ Client B connected');
    checkAndRunTest();
  }
});

const checkAndRunTest = () => {
  if (clientAConnected && clientBConnected && !testCompleted) {
    testCompleted = true;
    console.log('\nStep 4: Client A setting counter to', testValue);
    ymapA.set('counter', testValue);
    ymapA.set('note', 'hello from A');
  }
};

ymapB.observeDeep(() => {
  const counter = ymapB.get('counter');
  const note = ymapB.get('note');

  if (counter !== undefined && note !== undefined) {
    console.log('✓ Client B observed changes:', { counter, note });

    if (counter === testValue && note === 'hello from A') {
      console.log('\n✅ TEST PASSED: Server round-trip successful!');
      console.log('  - Client A wrote counter =', testValue);
      console.log('  - Client B received counter =', counter);

      providerA.destroy();
      providerB.destroy();
      docA.destroy();
      docB.destroy();
      process.exit(0);
    }
  }
});

setTimeout(() => {
  console.error('\n✗ TEST FAILED: Timeout waiting for round-trip');
  console.log('Current state on B:', ymapB.toJSON());
  providerA.destroy();
  providerB.destroy();
  docA.destroy();
  docB.destroy();
  process.exit(1);
}, timeout);

console.log(`Waiting up to ${timeout}ms for round-trip...`);
