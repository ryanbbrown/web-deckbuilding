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

      expect(catalog).toBeInstanceOf(Array);
      expect(catalog.length).toBe(0);
    });
  });

  describe('addCardDefinition', () => {
    it('should add a card definition to the market', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition, hasCardDefinition } =
        useMarketStore.getState();

      addCardDefinition(cardDef);

      expect(hasCardDefinition(cardDef)).toBe(true);
      expect(useMarketStore.getState().catalog.length).toBe(1);
    });

    it('should allow duplicate card definitions (since UIDs make them unique)', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { addCardDefinition } = useMarketStore.getState();

      addCardDefinition(cardDef);
      addCardDefinition(cardDef);

      expect(useMarketStore.getState().catalog.length).toBe(2);
    });
  });

  describe('addMultipleCardDefinitions', () => {
    it('should add multiple card definitions to the market', () => {
      const cardDef1 = createCardDefinition('Card 1', 'Text 1', 1);
      const cardDef2 = createCardDefinition('Card 2', 'Text 2', 2);
      const cardDef3 = createCardDefinition('Card 3', 'Text 3', 3);
      const { addMultipleCardDefinitions, hasCardDefinition } =
        useMarketStore.getState();

      addMultipleCardDefinitions([cardDef1, cardDef2, cardDef3]);

      expect(hasCardDefinition(cardDef1)).toBe(true);
      expect(hasCardDefinition(cardDef2)).toBe(true);
      expect(hasCardDefinition(cardDef3)).toBe(true);
      expect(useMarketStore.getState().catalog.length).toBe(3);
    });

    it('should add multiple cards to existing catalog', () => {
      const existingCard = createCardDefinition('Existing', 'Already there', 0);
      const newCard1 = createCardDefinition('New 1', 'First new', 1);
      const newCard2 = createCardDefinition('New 2', 'Second new', 2);
      const { addCardDefinition, addMultipleCardDefinitions } =
        useMarketStore.getState();

      addCardDefinition(existingCard);
      expect(useMarketStore.getState().catalog.length).toBe(1);

      addMultipleCardDefinitions([newCard1, newCard2]);
      expect(useMarketStore.getState().catalog.length).toBe(3);
    });

    it('should handle empty array gracefully', () => {
      const { addMultipleCardDefinitions } = useMarketStore.getState();

      addMultipleCardDefinitions([]);

      expect(useMarketStore.getState().catalog.length).toBe(0);
    });

    it('should handle single card in array', () => {
      const cardDef = createCardDefinition('Single Card', 'Only one', 1);
      const { addMultipleCardDefinitions, hasCardDefinition } =
        useMarketStore.getState();

      addMultipleCardDefinitions([cardDef]);

      expect(hasCardDefinition(cardDef)).toBe(true);
      expect(useMarketStore.getState().catalog.length).toBe(1);
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
      expect(useMarketStore.getState().catalog.length).toBe(0);
    });

    it('should handle removing non-existent card gracefully', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const { removeCardDefinition } = useMarketStore.getState();

      removeCardDefinition(cardDef);

      expect(useMarketStore.getState().catalog.length).toBe(0);
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
      expect(useMarketStore.getState().catalog.length).toBe(1);

      reset();
      expect(useMarketStore.getState().catalog.length).toBe(0);
    });
  });
});
