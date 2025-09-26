# Plan: Add Multiplayer Room Support with Yjs + y-redis (Auth) to a Zustand SPA

## Step 1 — Install Dependencies
Action: Add Yjs and its websocket client (plus `uuid` for room IDs).
Check: Build succeeds.

`pnpm add yjs y-websocket y-protocols uuid`

Pitfalls:
- Don’t import Node-only APIs in browser code (use `WebSocketPolyfill` only in Node smoke scripts).

---

## Step 2 — Define a Light Yjs Document Shape (no formal schema)
Action: Use three top-level keys that mirror your existing persisted store keys:
- `game: Y.Map` (e.g., `turn`, `seed`, `phase`)
- `market: Y.Map` (e.g., `supply`, `prices`)
- `players: Y.Map<pid -> Y.Map>` (e.g., `deck: Y.Array`, `discard: Y.Array`, `hp`)

Rationale:
- Yjs is schemaless; using `Y.Map`/`Y.Array` gives field-level concurrency and fewer clobbers than a single JSON blob.

Example accessor:

`// yjsSchema.ts
export const attachShared = (doc: Y.Doc) => ({
  game: doc.getMap('game'),
  market: doc.getMap('market'),
  players: doc.getMap('players'),
});`

Pitfalls:
- Avoid a single giant JSON value; represent independently edited sub-objects as `Y.Map`/`Y.Array`.

---

## Step 3 — Create a Connection Manager (with Auth)
Action: Write `connectRoom({ serverUrl, roomId, token }) → { doc, provider, destroy }`.
- Fetch token from your auth server.
- Instantiate `WebsocketProvider(serverUrl, roomId, doc, { params: { yauth: token } })`.
- Listen to `status` and `sync` for diagnostics.
- Provide `destroy()` that tears down provider and doc.

Example snippets (critical details):

`// pass auth exactly as your server expects:
new WebsocketProvider(WS_URL, roomId, doc, { params: { yauth: token } });`

`// minimal event hooks for logs:
provider.on('status', e => console.log('[ws]', e.status));
provider.on('sync',   s => console.log('[ws] sync', s));`

Pitfalls:
- Your server expects the param key `yauth` (not `token`).
- Use `wss://` in prod; verify Fly proxy allows query params.

### Smoke Test C0 — Provider Connectivity + Auth
Goal: Can you fetch a token and connect to a room?
Assert: Receive `status: "connected"` and at least one `sync` event within a timeout.
Harness:
- Node script: `fetch(https://.../auth/token)` → `token`.
- `new WebsocketProvider(WS_URL, room, doc, { WebSocketPolyfill: ws, params: { yauth: token } })`.
- Log `status`/`sync`; exit success on connect.

### Smoke Test C1 — Server Round-Trip of a Key
Goal: Writes travel through the server and are observable by another client.
Assert: Client A sets `ymap.set('counter', n)`; Client B sees `counter === n`.
Harness:
- Two providers to the same `room`.
- Client A on `connected`: `ymap.set('counter', (ymap.get('counter') ?? 0) + 1)`.
- Client B observes `ymap.toJSON()` and asserts the value.

---

## Step 4 — Create a Safe Binding Between Zustand and Yjs
Action: Implement a tiny adapter that binds a single store key to a `Y.Map` entry.
Concept:
- Zustand → Yjs: After a local action, write that key to Yjs inside a transaction with a unique `origin`.
- Yjs → Zustand: Observe the Y map; on change, set the store key unless `txn.origin` matches your local origin.

Critical snippet (echo-safe pattern):

`const ORIGIN = Symbol('y-origin');
// write
doc.transact(() => ymap.set(key, value), ORIGIN);
// read
ymap.observeDeep((_e, txn) => {
  if (txn.origin === ORIGIN) return;       // prevent echo
  set(s => { (s as any)[key] = ymap.get(key); });
});`

Seeding rule:
- On first bind, if Y has the key → hydrate store from Y.
- Else → seed Y from current local store value (once).

Pitfalls:
- Missing `origin` guard causes echo loops or double applications.
- Don’t write to Y during the Y→Zustand observer path.

### Smoke Test C2 — Bind a Single Store Key
Goal: Store action updates local and Y; remote updates apply once to local.
Assert:
- Calling `nextTurn()` bumps `turn` locally and reflects in `doc.getMap('game').get('turn')`.
- A remote client setting `game.turn` updates local store once (no oscillation).
Harness:
- Run one provider + store; call action; assert Y matches.
- Spawn a second provider; set Y; assert the store in the first process updates once.

---

## Step 5 — Extend Zustand Stores Minimally
Action:
- Add `roomId: string | null`.
- Add `conn?: { doc: Y.Doc; dispose(): void }`.
- Add lifecycle actions: `createRoom()`, `joinRoom(roomId)`, `leaveRoom()`.
- Keep existing actions (e.g., `nextTurn()`) unchanged for callers; when connected, mirror their changed keys to Y.

Example write-through inside an action:

`set(s => { s.turn += 1; });
const c = get().conn;
if (c) c.doc.transact(() => c.doc.getMap('game').set('turn', get().turn), ORIGIN);`

Pitfalls:
- Bind only the shared slice; keep UI-only/ephemeral state local.
- Ensure `dispose()` removes observers and destroys provider/doc.

### Smoke Test C3 — Initial Hydration Rules (seed-once, don’t clobber)
Goal:
- If doc empty: first join seeds from local snapshot.
- If doc has data: joining clients prefer doc over local persisted state.
Assert:
- Host creates room and seeds; Joiner reads Host state after `sync`.
- Refresh Joiner; state rehydrates from Y, not from localStorage.
Harness:
- Script A: create room, seed `game.turn=5`.
- Script B: join; after `sync`, assert `turn===5`; reload B; assert unchanged.

---

## Step 6 — Add Minimal UI for Rooms
Action:
- “Create Room” → generate UUID, call `createRoom()`, navigate to `/room/:id`, show share link.
- “Join Room” → parse `:id`, call `joinRoom(id)` on mount.
- “Leave Room” → call `leaveRoom()`, remain in single-player with `persist`.

Example calls:

`await useGameStore.getState().createRoom(); // then navigate to /room/:id
await useGameStore.getState().joinRoom(roomId);`

Pitfalls:
- Only seed Y on create or first bind when doc is empty.
- Guard UI against “connecting” vs “connected” to avoid double-binding.

### Smoke Test C4 — Multi-Key Consistency + Teardown
Goal:
- Multiple keys (`game.turn`, `market.supply`) sync.
- After `leaveRoom()`, actions no longer write to Y; re-join re-binds once (no duplicate observers).
Assert:
- Modify both keys from A; B observes convergence.
- A calls `leaveRoom()`; A modifies locally; B sees no Y changes.
- A re-joins; one set of observers; changes sync again.
Harness:
- Script toggling join/leave and mutating keys; count observer registrations in logs.

---

## Step 7 — Auth Hardening (Already Required in Your Setup)
Action:
- Implement `getAuthToken()` that calls `/auth/token`, caches, and refreshes before expiry.
- On token refresh, reconnect provider with new `params`.
- Handle transient failures with backoff.

Snippet:

`const token = await fetch(`${AUTH_URL}/auth/token`).then(r => r.text());
const provider = new WebsocketProvider(WS_URL, roomId, doc, { params: { yauth: token } });`

Pitfalls:
- Expired token loops: detect `disconnected`, refresh token, attempt reconnect.
- Ensure Fly proxy passes query params to the websocket backend.

---

## Acceptance Criteria
- Single-player UX (Zustand + `persist`) unchanged when not connected.
- Two clients in the same `roomId` converge on `game`, `market`, and one `players[pid]` field within a reasonable latency.
- Leaving a room stops all Y writes; re-joining re-binds cleanly (no duplicate observers).
- Smoke tests C0–C4 pass locally (Node) and optionally in CI.

---

Summary: Keep Zustand as your sole app API, add a connection+binding layer that mirrors a minimal shared slice to Yjs over y-redis with `yauth` tokens, and validate incrementally with C0–C4 smoke tests at each step.