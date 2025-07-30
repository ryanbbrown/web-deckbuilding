import { describe, it, expect } from 'vitest';
import { createCardDefinition } from '../../cards/services';
import { createPlayer } from '../../player/services';
import { addPlayer, createDefaultGame, setupPlayerDeck } from '../services';

describe('Game Service', () => {
  describe('createDefaultGame', () => {
    it('should create a game with default values', () => {
      const game = createDefaultGame();

      expect(game.market).toEqual({ catalog: new Set() });
      expect(game.players).toEqual([]);
      expect(game.startingDeckComposition).toBeNull();
      expect(game.startingHandSize).toBe(5);
    });

    it('should create a new game object on each call', () => {
      const game1 = createDefaultGame();
      const game2 = createDefaultGame();

      expect(game1).not.toBe(game2);
      expect(game1.market).not.toBe(game2.market);
      expect(game1.players).not.toBe(game2.players);
    });
  });

  describe('setupPlayerDeck', () => {
    it('should set up player deck with correct cards', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');

      const composition = {
        [copperCard.uid]: 7,
        [estateCard.uid]: 3,
      };

      const result = setupPlayerDeck(player, composition, [
        copperCard,
        estateCard,
      ]);

      expect(result.success).toBe(true);
      expect(result.player.deck).toHaveLength(10);
      expect(result.player.allCards).toHaveLength(10);

      // Check card counts
      const copperCount = result.player.allCards.filter(
        (card) => card.definition.uid === copperCard.uid
      ).length;
      const estateCount = result.player.allCards.filter(
        (card) => card.definition.uid === estateCard.uid
      ).length;

      expect(copperCount).toBe(7);
      expect(estateCount).toBe(3);
    });

    it('should fail if card definition not found', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { 'missing-card-uid': 7 };

      const result = setupPlayerDeck(player, composition, [copperCard]);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player); // Should return original player on failure
    });

    it('should handle empty composition', () => {
      const player = createPlayer('Test Player');
      const composition = {};

      const result = setupPlayerDeck(player, composition, []);

      expect(result.success).toBe(true);
      expect(result.player.deck).toHaveLength(0);
      expect(result.player.allCards).toHaveLength(0);
    });

    it('should not mutate the original player', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 5 };

      const result = setupPlayerDeck(player, composition, [copperCard]);

      expect(result.player).not.toBe(player);
      expect(player.deck).toHaveLength(0); // Original player unchanged
      expect(result.player.deck).toHaveLength(5); // New player has cards
    });

    it('should handle multiple card types with different quantities', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');
      const silverCard = createCardDefinition('Silver', 'Better treasure');

      const composition = {
        [copperCard.uid]: 4,
        [estateCard.uid]: 2,
        [silverCard.uid]: 1,
      };

      const result = setupPlayerDeck(player, composition, [
        copperCard,
        estateCard,
        silverCard,
      ]);

      expect(result.success).toBe(true);
      expect(result.player.deck).toHaveLength(7);

      // Verify each card type exists in correct quantities
      const copperCount = result.player.allCards.filter(
        (c) => c.definition.uid === copperCard.uid
      ).length;
      const estateCount = result.player.allCards.filter(
        (c) => c.definition.uid === estateCard.uid
      ).length;
      const silverCount = result.player.allCards.filter(
        (c) => c.definition.uid === silverCard.uid
      ).length;

      expect(copperCount).toBe(4);
      expect(estateCount).toBe(2);
      expect(silverCount).toBe(1);
    });
  });

  describe('addPlayer', () => {
    it('should add a player with starting deck', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');

      const composition = {
        [copperCard.uid]: 7,
        [estateCard.uid]: 3,
      };

      const game = {
        ...createDefaultGame(),
        startingDeckComposition: composition,
      };

      const result = addPlayer(game, player, [copperCard, estateCard]);

      expect(result.success).toBe(true);
      expect(result.game.players).toHaveLength(1);

      // Check that returned player has the correct cards
      const returnedPlayer = result.game.players[0];
      expect(returnedPlayer.deck).toHaveLength(10);
      expect(returnedPlayer.allCards).toHaveLength(10);
    });

    it('should fail if starting deck composition not set', () => {
      const game = createDefaultGame(); // null composition by default
      const player = createPlayer('Test Player');

      const result = addPlayer(game, player, []);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should fail if card definition not found', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { 'missing-card-uid': 7 };
      const game = {
        ...createDefaultGame(),
        startingDeckComposition: composition,
      };

      const result = addPlayer(game, player, [copperCard]);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should not mutate the original game', () => {
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 7 };
      const game = {
        ...createDefaultGame(),
        startingDeckComposition: composition,
      };

      const result = addPlayer(game, player, [copperCard]);

      expect(game.players).toHaveLength(0);
      expect(result.game).not.toBe(game);
    });
  });
});
