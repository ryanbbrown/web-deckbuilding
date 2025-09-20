<current state>
YRedis is working and deployed on fly.io. It can be tested using `node tests/player_one_test.js` which connects a player, creates a room, and establishes a WebSocket connection to the YRedis backend. A second player can join using the generated room name with player_two_test.js. Both players successfully see each other's messages, proving basic YRedis WebSocket functionality works. However, YRedis is not integrated into the actual web deck-building app at all - the app still only uses local Zustand state management with no multiplayer capabilities.
</current state>

<desired future state>
Implement minimal YRedis integration in the existing codebase while preserving single-player functionality. The default experience remains unchanged - users visiting the website still use local Zustand state with no WebSocket connection. Add two new UI elements:
1. "Create room" button (top right) - generates a room code and navigates to a URL with that code
2. "Join room" button - allows entering an existing room code to join

When in a room (via create or join), all app state synchronizes through YRedis WebSocket connection. Every action by player 1 is immediately visible to player 2 in the same room. All existing Zustand stores should sync their state through YRedis when in multiplayer mode. Keep implementation minimal - no need for conflict resolution, optimistic updates, or complex edge case handling. Goal is proof of concept that two players on different computers can join the same room and see each other's actions in real-time.

State synchronization behavior:
- Before joining a room, each player has independent local state
- The player who creates a room keeps their existing state (which becomes the room's initial state)
- The player who joins a room discards their local state and adopts the room's shared state
- After joining, verify both players see identical state and all changes are synchronized

Testing requirements:
1. Research and implement backend testing to confirm multiple players can join rooms and view shared state - this will differ from existing unit/E2E test patterns
2. Use Playwright MCP for manual exploration before writing full E2E tests - investigate how to simulate two separate players (possibly using different browser contexts or instances)
3. Verify the state transition: independent states before joining → shared synchronized state after joining
</desired future state>

<response format>
Your response should be a long list of numbered steps. Each step should either: (1) specify shell/bash commands to be run or (2) refer to a single file and specify changes that should be made to that file.

Related steps can be grouped under headers, but step numbers should always be monotonically increasing (don’t reset back to 1). If the code implementation is not abundantly clear based on the description, you may include an inline code snippet or a brief (3-5 line) multiline code snippet. Do NOT just write out all the changes you’re going to make.
</response format>

<example response>
```markdown
# Market Store Migration Plan

## General Context
- Keep centralized `/src/store/` folder with separate domain stores
- Services will be removed for simple domains, stores handle all state and logic
- Stores contain both state mutations and selectors

## Market Domain Migration

1. Create `src/store/market-store.ts` with state interface: `cards: CardDefinition[]`
2. Add actions to market store: `addCardDefinition`, `removeCardDefinition`, `reset`
3. Add selectors to market store: `hasCardDefinition`, `getMarketCards`, `getCardById`
4. Create `src/store/market-store.test.ts` with tests for all actions and selectors
5. Update `src/features/market/test/market-service.test.ts` to use `useMarketStore.getState()` pattern instead of service imports
6. Delete entire `src/features/market/services/` folder (all functions now in store)
7. Delete `src/features/market/test/market-service.test.ts` after tests are migrated
8. Run `pnpm lint` to check for linting issues
9. Run `pnpm test` to verify all market store tests pass
10. Run `pnpm test:e2e` to verify E2E tests still pass

## Component Updates

11. Update `src/features/market/pages/MarketPage.tsx` to import `useMarketStore` instead of market service
12. Replace all market service function calls with store actions (e.g., `marketService.addCard()` becomes `useMarketStore().addCardDefinition()`)
13. Update any market card list components to use store selectors instead of local state
14. Run `pnpm lint` to check for linting issues in updated components
15. Run `pnpm test` to verify component tests still pass
16. Run `pnpm test:e2e` to verify E2E tests still pass with UI changes

## Cleanup and Verification

17. Remove market service exports from `src/features/market/index.ts`
18. Add market store export to `src/store/index.ts`
19. Search codebase for any remaining imports of deleted market service
20. Run `pnpm test` for final unit test verification
21. Run `pnpm test:e2e` for final E2E test verification
22. Run `pnpm lint` for final linting check
23. Run `pnpm build` to verify TypeScript compilation succeeds
```
</example response>

Write a detailed implementation plan.