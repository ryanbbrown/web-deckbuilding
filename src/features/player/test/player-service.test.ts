import { describe, it, expect } from 'vitest';
import { createCardDefinition, createCardInstance } from '../../cards/services';
import { Zone } from '../../cards/types';
import {
  createPlayer,
  shuffleDeck,
  drawCard,
  drawHand,
  playCard,
  discardCard,
  discardAllInPlay,
  discardAllInHand,
} from '../services';
import usePlayerStore from '../../../store/player-store';

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

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      let player = createPlayer('Test Player');
      const cardDefs = Array.from({ length: 10 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.DECK);
      }

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const originalOrder = currentPlayer.deck.map((c) => c.definition.name);
      const shuffledPlayer = shuffleDeck(currentPlayer);
      const shuffledOrder = shuffledPlayer.deck.map((c) => c.definition.name);

      expect(shuffledPlayer.deck).toHaveLength(10);
      expect(shuffledOrder).not.toEqual(originalOrder);
    });

    it('should not mutate the original player', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.DECK);

      const playerWithCard = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const shuffledPlayer = shuffleDeck(playerWithCard);

      expect(shuffledPlayer).not.toBe(playerWithCard);
      expect(shuffledPlayer.deck).not.toBe(playerWithCard.deck);
    });
  });

  describe('drawCard', () => {
    it('should draw a card from deck to hand', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.DECK);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = drawCard(currentPlayer);

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
      const player = createPlayer('Test Player');
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const cardInstance1 = createCardInstance(cardDef1);
      const cardInstance2 = createCardInstance(cardDef2);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance1, Zone.DISCARD);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance2, Zone.DISCARD);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = drawCard(currentPlayer);

      expect(result.drawnCard).not.toBeNull();
      expect(result.player.deck).toHaveLength(1);
      expect(result.player.hand).toHaveLength(1);
      expect(result.player.discard).toHaveLength(0);
    });
  });

  describe('drawHand', () => {
    it('should discard current hand and played cards, then draw new hand', () => {
      const player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 7 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);

      for (let i = 0; i < 3; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.HAND);
      }

      for (let i = 3; i < 5; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.PLAYED);
      }

      for (let i = 5; i < 7; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.DECK);
      }

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = drawHand(currentPlayer, 5);

      expect(result.player.hand).toHaveLength(5);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(0);
      expect(result.player.deck).toHaveLength(2);
      expect(result.drawnCards).toHaveLength(5);
    });
  });

  describe('playCard', () => {
    it('should move a card from hand to played area', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.HAND);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = playCard(currentPlayer, currentPlayer.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.played).toHaveLength(1);
      expect(result.player.played[0].zone).toBe(Zone.PLAYED);
    });

    it('should return false if card not in hand', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.DECK);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = playCard(currentPlayer, currentPlayer.deck[0]);

      expect(result.success).toBe(false);
      expect(result.player).toBe(currentPlayer);
    });
  });

  describe('discardCard', () => {
    it('should discard a card from hand', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.HAND);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = discardCard(currentPlayer, currentPlayer.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should discard a card from played area', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.PLAYED);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = discardCard(
        currentPlayer,
        currentPlayer.played[0],
        Zone.PLAYED
      );

      expect(result.success).toBe(true);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should return false for invalid zones', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);
      usePlayerStore
        .getState()
        .registerCard(player.playerId, cardInstance, Zone.DECK);

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const result = discardCard(
        currentPlayer,
        currentPlayer.deck[0],
        Zone.DECK
      );

      expect(result.success).toBe(false);
      expect(result.player).toBe(currentPlayer);
    });
  });

  describe('discardAllInPlay', () => {
    it('should discard all cards from played area', () => {
      const player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.PLAYED);
      }

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const updatedPlayer = discardAllInPlay(currentPlayer);

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
      const player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      usePlayerStore.getState().reset();
      usePlayerStore.getState().addPlayer(player);

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        usePlayerStore
          .getState()
          .registerCard(player.playerId, cardInstance, Zone.HAND);
      }

      const currentPlayer = usePlayerStore
        .getState()
        .getPlayer(player.playerId)!;
      const updatedPlayer = discardAllInHand(currentPlayer);

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
