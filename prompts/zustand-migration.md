# Zustand Migration Plan

## Architecture
- Keep centralized `/src/store/` folder with separate domain stores (game, market, player)
- Services keep business logic, stores handle state mutations and selectors
- Stores create wrapper actions for service functions that update state

## Market Domain (No Service Dependencies)

- [ ] Create `src/store/market-store.ts` with actions: `addCardDefinition`, `removeCardDefinition`, `reset` and selectors: `hasCardDefinition`, `getMarketCards`
- [ ] Delete entire `src/features/market/services/` folder (all functions moved to market store)
- [ ] Create `src/store/market-store.test.ts` converting tests from `src/features/market/test/market-service.test.ts` to use `useMarketStore.getState()` pattern
- [ ] Delete `src/features/market/test/market-service.test.ts`

## Player Domain (Store + Service Integration)

- [ ] Create `src/store/player-store.ts` with actions: `addPlayer`, `updatePlayer`, `removePlayer`, `registerCard`, `moveCardBetweenZones`, `reset` and selectors: `getPlayer`, `getAllPlayers`
- [ ] Add wrapper actions in player store for service functions: `drawPlayerCard`, `drawPlayerHand`, `playPlayerCard`, `discardPlayerCard`, `discardAllPlayerInPlay`, `discardAllPlayerInHand`, `shufflePlayerDeck` (these call service functions and update state)
- [ ] Remove from `src/features/player/services/player-service.ts`: `registerCard`, `moveCardBetweenZones` (keep: `createPlayer`, `shuffleDeck`, `drawCard`, `drawHand`, `playCard`, `discardCard`, `discardAllInPlay`, `discardAllInHand`)
- [ ] Create `src/store/player-store.test.ts` for player CRUD and wrapper actions
- [ ] Update `src/features/player/test/player-service.test.ts` to remove tests for moved functions, keep tests for remaining business logic

## Game Domain (Store Coordination)

- [ ] Update `src/store/game-store.ts` to add `setStartingDeckComposition`, `setStartingHandSize`, `reset` and coordinate with other stores for `addCardToMarket`, `addPlayerToGame`
- [ ] Add wrapper action in game store for `addPlayerToGame` that calls service `addPlayer` function and coordinates with player store
- [ ] Remove from `src/features/game/services/game-service.ts`: `createGame`, `addCardToMarket`, `setStartingDeckComposition`, `setStartingHandSize`, `updatePlayer`, `getPlayer` (keep only `addPlayer` with complex business logic)
- [ ] Update `src/features/game/test/game-service.test.ts` to only test `addPlayer` function

## Component Updates

- [ ] Update all components to import from stores instead of services (e.g., `useMarketStore` instead of market service functions)
- [ ] Change component usage from service calls to store wrapper actions (no more manual state updates needed)

## Cleanup

- [ ] Remove exports from deleted service files in any index files
- [ ] Add exports for new store files
- [ ] Verify all tests pass and no circular imports exist
