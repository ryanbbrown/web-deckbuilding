import { describe, it, expect } from 'vitest';
import { createCardDefinition, createCardInstance } from '../../cards/services';
import { Zone } from '../../cards/types';
import {
  createPlayer,
  registerCard,
  shuffleDeck,
  drawCard,
  drawHand,
  playCard,
  discardCard,
  discardAllInPlay,
  discardAllInHand,
} from '../services';

describe('Player Service', () => {
  describe('createPlayer', () => {
    it('should create a player with default values', () => {
      const player = createPlayer('Test Player');

      expect(player.name).toBe('Test Player');
      expect(player.playerId).toBeDefined();
      expect(typeof player.playerId).toBe('string');
      expect(player.allCards).toEqual([]);
      expect(player.deck).toEqual([]);
      expect(player.hand).toEqual([]);
      expect(player.played).toEqual([]);
      expect(player.discard).toEqual([]);
    });

    it('should generate unique player IDs', () => {
      const player1 = createPlayer('Player 1');
      const player2 = createPlayer('Player 2');

      expect(player1.playerId).not.toBe(player2.playerId);
    });
  });

  describe('registerCard', () => {
    it('should register a card to the discard pile by default', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const updatedPlayer = registerCard(player, cardInstance);

      expect(updatedPlayer.allCards).toHaveLength(1);
      expect(updatedPlayer.discard).toHaveLength(1);
      expect(updatedPlayer.discard[0].ownerId).toBe(player.playerId);
      expect(updatedPlayer.discard[0].zone).toBe(Zone.DISCARD);
    });

    it('should register a card to a specific zone', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const updatedPlayer = registerCard(player, cardInstance, Zone.DECK);

      expect(updatedPlayer.deck).toHaveLength(1);
      expect(updatedPlayer.deck[0].zone).toBe(Zone.DECK);
      expect(updatedPlayer.discard).toHaveLength(0);
    });

    it('should not mutate the original player', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const updatedPlayer = registerCard(player, cardInstance);

      expect(player.allCards).toHaveLength(0);
      expect(updatedPlayer).not.toBe(player);
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      let player = createPlayer('Test Player');
      const cardDefs = Array.from({ length: 10 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCard(player, cardInstance, Zone.DECK);
      }

      const originalOrder = player.deck.map((c) => c.definition.name);
      const shuffledPlayer = shuffleDeck(player);
      const shuffledOrder = shuffledPlayer.deck.map((c) => c.definition.name);

      expect(shuffledPlayer.deck).toHaveLength(10);
      expect(shuffledOrder).not.toEqual(originalOrder);
    });

    it('should not mutate the original player', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      const playerWithCard = registerCard(player, cardInstance, Zone.DECK);

      const shuffledPlayer = shuffleDeck(playerWithCard);

      expect(shuffledPlayer).not.toBe(playerWithCard);
      expect(shuffledPlayer.deck).not.toBe(playerWithCard.deck);
    });
  });

  describe('drawCard', () => {
    it('should draw a card from deck to hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.DECK);

      const result = drawCard(player);

      expect(result.drawnCard).not.toBeNull();
      expect(result.drawnCard?.zone).toBe(Zone.HAND);
      expect(result.player.deck).toHaveLength(0);
      expect(result.player.hand).toHaveLength(1);
    });

    it('should return null when no cards available', () => {
      const player = createPlayer('Test Player');

      const result = drawCard(player);

      expect(result.drawnCard).toBeNull();
      expect(result.player).toBe(player);
    });

    it('should shuffle discard into deck when deck is empty', () => {
      let player = createPlayer('Test Player');
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const cardInstance1 = createCardInstance(cardDef1);
      const cardInstance2 = createCardInstance(cardDef2);

      player = registerCard(player, cardInstance1, Zone.DISCARD);
      player = registerCard(player, cardInstance2, Zone.DISCARD);

      const result = drawCard(player);

      expect(result.drawnCard).not.toBeNull();
      expect(result.player.deck).toHaveLength(1);
      expect(result.player.hand).toHaveLength(1);
      expect(result.player.discard).toHaveLength(0);
    });
  });

  describe('drawHand', () => {
    it('should discard current hand and played cards, then draw new hand', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 7 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (let i = 0; i < 3; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCard(player, cardInstance, Zone.HAND);
      }

      for (let i = 3; i < 5; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCard(player, cardInstance, Zone.PLAYED);
      }

      for (let i = 5; i < 7; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCard(player, cardInstance, Zone.DECK);
      }

      const result = drawHand(player, 5);

      expect(result.player.hand).toHaveLength(5);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(0);
      expect(result.player.deck).toHaveLength(2);
      expect(result.drawnCards).toHaveLength(5);
    });
  });

  describe('playCard', () => {
    it('should move a card from hand to played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.HAND);

      const result = playCard(player, player.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.played).toHaveLength(1);
      expect(result.player.played[0].zone).toBe(Zone.PLAYED);
    });

    it('should return false if card not in hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.DECK);

      const result = playCard(player, player.deck[0]);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });
  });

  describe('discardCard', () => {
    it('should discard a card from hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.HAND);

      const result = discardCard(player, player.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should discard a card from played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.PLAYED);

      const result = discardCard(player, player.played[0], Zone.PLAYED);

      expect(result.success).toBe(true);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should return false for invalid zones', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      player = registerCard(player, cardInstance, Zone.DECK);

      const result = discardCard(player, player.deck[0], Zone.DECK);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });
  });

  describe('discardAllInPlay', () => {
    it('should discard all cards from played area', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCard(player, cardInstance, Zone.PLAYED);
      }

      const updatedPlayer = discardAllInPlay(player);

      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(3);
    });

    it('should handle empty played area', () => {
      const player = createPlayer('Test Player');

      const updatedPlayer = discardAllInPlay(player);

      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(0);
    });
  });

  describe('discardAllInHand', () => {
    it('should discard all cards from hand', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCard(player, cardInstance, Zone.HAND);
      }

      const updatedPlayer = discardAllInHand(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(3);
    });

    it('should handle empty hand', () => {
      const player = createPlayer('Test Player');

      const updatedPlayer = discardAllInHand(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(0);
    });
  });
});
