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