#!/usr/bin/env node

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import ws from 'ws';

console.log('=== Smoke Test C0 - Provider Connectivity + Auth ===');
console.log('Goal: Can fetch a token and connect to a room?');
console.log(
  'Assert: Receive status "connected" and at least one sync event within timeout.\n'
);

console.log('Step 1: Fetching token from auth server...');
let token;
try {
  const response = await fetch(
    'https://web-deckbuilding-yredis.fly.dev/auth/token'
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch token: ${response.status} ${response.statusText}`
    );
  }
  token = await response.text();
  console.log('✓ Successfully fetched token:', token.substring(0, 50) + '...');
} catch (error) {
  console.error('✗ Error fetching token:', error);
  process.exit(1);
}

const room = 'smoketest-c0-' + Math.random().toString(36).slice(2, 8);
console.log('\nStep 2: Connecting to room:', room);

const doc = new Y.Doc();
const provider = new WebsocketProvider(
  'wss://web-deckbuilding-yredis.fly.dev',
  room,
  doc,
  {
    WebSocketPolyfill: ws,
    params: { yauth: token },
  }
);

let statusReceived = false;
let syncReceived = false;
const timeout = 10000;

provider.on('status', (e) => {
  console.log('✓ Status event received:', e.status);
  if (e.status === 'connected') {
    statusReceived = true;
    checkCompletion();
  }
});

provider.on('sync', (isSynced) => {
  console.log('✓ Sync event received:', isSynced);
  syncReceived = true;
  checkCompletion();
});

const checkCompletion = () => {
  if (statusReceived && syncReceived) {
    console.log(
      '\n✅ TEST PASSED: Successfully connected and synced with the server'
    );
    provider.destroy();
    doc.destroy();
    process.exit(0);
  }
};

setTimeout(() => {
  console.error('\n✗ TEST FAILED: Timeout waiting for connection/sync');
  console.log(
    `Status received: ${statusReceived}, Sync received: ${syncReceived}`
  );
  provider.destroy();
  doc.destroy();
  process.exit(1);
}, timeout);

console.log(`Waiting up to ${timeout}ms for connection and sync...`);
