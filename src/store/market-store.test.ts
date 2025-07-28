import { describe, it, expect, beforeEach } from 'vitest';
import { createCardDefinition } from '../features/cards/services';
import useMarketStore from './market-store';

describe('Market Store', () => {
  beforeEach(() => {
    useMarketStore.getState().reset();
  });

  describe('initial state', () => {
    it('should start with an empty catalog', () => {
      const { catalog } = useMarketStore.getState();

      expect(catalog).toBeInstanceOf(Set);
      expect(catalog.size).toBe(0);
    });
  });

  describe('addCardDefinition', () => {
    it('should add a card definition to the market', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition, hasCardDefinition } =
        useMarketStore.getState();

      addCardDefinition(cardDef);

      expect(hasCardDefinition(cardDef)).toBe(true);
      expect(useMarketStore.getState().catalog.size).toBe(1);
    });

    it('should not add duplicate card definitions', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition } = useMarketStore.getState();

      addCardDefinition(cardDef);
      addCardDefinition(cardDef);

      expect(useMarketStore.getState().catalog.size).toBe(1);
    });
  });

  describe('removeCardDefinition', () => {
    it('should remove a card definition from the market', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition, removeCardDefinition, hasCardDefinition } =
        useMarketStore.getState();

      addCardDefinition(cardDef);
      expect(hasCardDefinition(cardDef)).toBe(true);

      removeCardDefinition(cardDef);
      expect(useMarketStore.getState().hasCardDefinition(cardDef)).toBe(false);
      expect(useMarketStore.getState().catalog.size).toBe(0);
    });

    it('should handle removing non-existent card gracefully', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { removeCardDefinition } = useMarketStore.getState();

      removeCardDefinition(cardDef);

      expect(useMarketStore.getState().catalog.size).toBe(0);
    });
  });

  describe('hasCardDefinition', () => {
    it('should return true if card exists in market', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition, hasCardDefinition } =
        useMarketStore.getState();

      addCardDefinition(cardDef);

      expect(hasCardDefinition(cardDef)).toBe(true);
    });

    it('should return false if card does not exist in market', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { hasCardDefinition } = useMarketStore.getState();

      expect(hasCardDefinition(cardDef)).toBe(false);
    });
  });

  describe('getMarketCards', () => {
    it('should return empty array for empty market', () => {
      const { getMarketCards } = useMarketStore.getState();
      const cards = getMarketCards();

      expect(cards).toEqual([]);
    });

    it('should return array of card definitions', () => {
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const { addCardDefinition, getMarketCards } = useMarketStore.getState();

      addCardDefinition(cardDef1);
      addCardDefinition(cardDef2);

      const cards = getMarketCards();

      expect(cards).toHaveLength(2);
      expect(cards).toContain(cardDef1);
      expect(cards).toContain(cardDef2);
    });
  });

  describe('reset', () => {
    it('should clear all card definitions', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition, reset } = useMarketStore.getState();

      addCardDefinition(cardDef);
      expect(useMarketStore.getState().catalog.size).toBe(1);

      reset();
      expect(useMarketStore.getState().catalog.size).toBe(0);
    });
  });
});
