import { describe, it, expect } from 'vitest';
import { createCardDefinition } from '../../cards/services';
import { createPlayer } from '../../player/services';
import {
  createGame,
  addCardToMarket,
  setStartingDeckComposition,
  setStartingHandSize,
  addPlayer,
  updatePlayer,
  getPlayer,
} from '../services';

describe('Game Service', () => {
  describe('createGame', () => {
    it('should create a game with default values', () => {
      const game = createGame();

      expect(game.market.catalog.size).toBe(0);
      expect(game.players).toEqual([]);
      expect(game.startingDeckComposition).toBeNull();
      expect(game.startingHandSize).toBe(5);
    });
  });

  describe('addCardToMarket', () => {
    it('should add a card definition to the market', () => {
      const game = createGame();
      const cardDef = createCardDefinition('Test Card', 'Test text');

      const updatedGame = addCardToMarket(game, cardDef);

      expect(updatedGame.market.catalog.has(cardDef)).toBe(true);
      expect(updatedGame.market.catalog.size).toBe(1);
    });

    it('should not mutate the original game', () => {
      const game = createGame();
      const cardDef = createCardDefinition('Test Card', 'Test text');

      const updatedGame = addCardToMarket(game, cardDef);

      expect(game.market.catalog.size).toBe(0);
      expect(updatedGame).not.toBe(game);
    });
  });

  describe('setStartingDeckComposition', () => {
    it('should set the starting deck composition', () => {
      const game = createGame();
      const cardDef = createCardDefinition('Copper', 'Basic treasure');
      const composition = { [cardDef.uid]: 7 };

      const updatedGame = setStartingDeckComposition(game, composition);

      expect(updatedGame.startingDeckComposition).toEqual(composition);
    });

    it('should not mutate the original game', () => {
      const game = createGame();
      const composition = { 'card-1': 7 };

      const updatedGame = setStartingDeckComposition(game, composition);

      expect(game.startingDeckComposition).toBeNull();
      expect(updatedGame).not.toBe(game);
    });
  });

  describe('setStartingHandSize', () => {
    it('should set the starting hand size', () => {
      const game = createGame();

      const updatedGame = setStartingHandSize(game, 7);

      expect(updatedGame.startingHandSize).toBe(7);
    });

    it('should not mutate the original game', () => {
      const game = createGame();

      const updatedGame = setStartingHandSize(game, 7);

      expect(game.startingHandSize).toBe(5);
      expect(updatedGame).not.toBe(game);
    });
  });

  describe('addPlayer', () => {
    it('should add a player with starting deck', () => {
      const game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');

      const composition = {
        [copperCard.uid]: 7,
        [estateCard.uid]: 3,
      };

      const gameWithComposition = setStartingDeckComposition(game, composition);
      const result = addPlayer(gameWithComposition, player, [
        copperCard,
        estateCard,
      ]);

      expect(result.success).toBe(true);
      expect(result.game.players).toHaveLength(1);
      expect(result.game.players[0].deck).toHaveLength(10);
      expect(result.game.players[0].allCards).toHaveLength(10);
    });

    it('should fail if starting deck composition not set', () => {
      const game = createGame();
      const player = createPlayer('Test Player');

      const result = addPlayer(game, player, []);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should fail if card definition not found', () => {
      const game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { 'missing-card-uid': 7 };
      const gameWithComposition = setStartingDeckComposition(game, composition);

      const result = addPlayer(gameWithComposition, player, [copperCard]);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should not mutate the original game', () => {
      const game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 7 };
      const gameWithComposition = setStartingDeckComposition(game, composition);

      const result = addPlayer(gameWithComposition, player, [copperCard]);

      expect(gameWithComposition.players).toHaveLength(0);
      expect(result.game).not.toBe(gameWithComposition);
    });
  });

  describe('updatePlayer', () => {
    it('should update an existing player', () => {
      let game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 1 };
      game = setStartingDeckComposition(game, composition);

      const addResult = addPlayer(game, player, [copperCard]);
      game = addResult.game;

      const updatedPlayer = { ...game.players[0], name: 'Updated Player' };
      const updatedGame = updatePlayer(game, updatedPlayer);

      expect(updatedGame.players[0].name).toBe('Updated Player');
      expect(updatedGame.players[0].playerId).toBe(player.playerId);
    });

    it('should not affect other players', () => {
      let game = createGame();
      const player1 = createPlayer('Player 1');
      const player2 = createPlayer('Player 2');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 1 };
      game = setStartingDeckComposition(game, composition);

      let addResult = addPlayer(game, player1, [copperCard]);
      game = addResult.game;
      addResult = addPlayer(game, player2, [copperCard]);
      game = addResult.game;

      const updatedPlayer1 = { ...game.players[0], name: 'Updated Player 1' };
      const updatedGame = updatePlayer(game, updatedPlayer1);

      expect(updatedGame.players[0].name).toBe('Updated Player 1');
      expect(updatedGame.players[1].name).toBe('Player 2');
    });

    it('should not mutate the original game', () => {
      let game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 1 };
      game = setStartingDeckComposition(game, composition);

      const addResult = addPlayer(game, player, [copperCard]);
      game = addResult.game;

      const updatedPlayer = { ...game.players[0], name: 'Updated Player' };
      const updatedGame = updatePlayer(game, updatedPlayer);

      expect(game.players[0].name).toBe('Test Player');
      expect(updatedGame).not.toBe(game);
    });
  });

  describe('getPlayer', () => {
    it('should return a player by ID', () => {
      let game = createGame();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 1 };
      game = setStartingDeckComposition(game, composition);

      const addResult = addPlayer(game, player, [copperCard]);
      game = addResult.game;

      const foundPlayer = getPlayer(game, player.playerId);

      expect(foundPlayer).not.toBeNull();
      expect(foundPlayer?.playerId).toBe(player.playerId);
      expect(foundPlayer?.name).toBe('Test Player');
    });

    it('should return null if player not found', () => {
      const game = createGame();

      const foundPlayer = getPlayer(game, 'non-existent-id');

      expect(foundPlayer).toBeNull();
    });
  });
});
