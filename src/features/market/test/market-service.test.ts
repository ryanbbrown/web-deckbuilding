import { describe, it, expect } from 'vitest';
import { createCardDefinition } from '../../cards/services';
import {
  createMarket,
  addCardDefinition,
  removeCardDefinition,
  hasCardDefinition,
  getMarketCards,
} from '../services';

describe('Market Service', () => {
  describe('createMarket', () => {
    it('should create an empty market', () => {
      const market = createMarket();

      expect(market.catalog).toBeInstanceOf(Set);
      expect(market.catalog.size).toBe(0);
    });
  });

  describe('addCardDefinition', () => {
    it('should add a card definition to the market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const updatedMarket = addCardDefinition(market, cardDef);

      expect(updatedMarket.catalog.has(cardDef)).toBe(true);
      expect(updatedMarket.catalog.size).toBe(1);
    });

    it('should not mutate the original market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const updatedMarket = addCardDefinition(market, cardDef);

      expect(market.catalog.size).toBe(0);
      expect(updatedMarket).not.toBe(market);
      expect(updatedMarket.catalog).not.toBe(market.catalog);
    });

    it('should not add duplicate card definitions', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      let updatedMarket = addCardDefinition(market, cardDef);
      updatedMarket = addCardDefinition(updatedMarket, cardDef);

      expect(updatedMarket.catalog.size).toBe(1);
    });
  });

  describe('removeCardDefinition', () => {
    it('should remove a card definition from the market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const marketWithCard = addCardDefinition(market, cardDef);
      const updatedMarket = removeCardDefinition(marketWithCard, cardDef);

      expect(updatedMarket.catalog.has(cardDef)).toBe(false);
      expect(updatedMarket.catalog.size).toBe(0);
    });

    it('should not mutate the original market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const marketWithCard = addCardDefinition(market, cardDef);
      const updatedMarket = removeCardDefinition(marketWithCard, cardDef);

      expect(marketWithCard.catalog.has(cardDef)).toBe(true);
      expect(updatedMarket).not.toBe(marketWithCard);
      expect(updatedMarket.catalog).not.toBe(marketWithCard.catalog);
    });

    it('should handle removing non-existent card gracefully', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const updatedMarket = removeCardDefinition(market, cardDef);

      expect(updatedMarket.catalog.size).toBe(0);
    });
  });

  describe('hasCardDefinition', () => {
    it('should return true if card exists in market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const marketWithCard = addCardDefinition(market, cardDef);

      expect(hasCardDefinition(marketWithCard, cardDef)).toBe(true);
    });

    it('should return false if card does not exist in market', () => {
      const market = createMarket();
      const cardDef = createCardDefinition('Test Card', 'Test text');

      expect(hasCardDefinition(market, cardDef)).toBe(false);
    });
  });

  describe('getMarketCards', () => {
    it('should return empty array for empty market', () => {
      const market = createMarket();
      const cards = getMarketCards(market);

      expect(cards).toEqual([]);
    });

    it('should return array of card definitions', () => {
      const market = createMarket();
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');

      let updatedMarket = addCardDefinition(market, cardDef1);
      updatedMarket = addCardDefinition(updatedMarket, cardDef2);

      const cards = getMarketCards(updatedMarket);

      expect(cards).toHaveLength(2);
      expect(cards).toContain(cardDef1);
      expect(cards).toContain(cardDef2);
    });
  });
});
