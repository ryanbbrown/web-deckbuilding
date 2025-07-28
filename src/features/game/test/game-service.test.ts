import { describe, it, expect, beforeEach } from 'vitest';
import { createCardDefinition } from '../../cards/services';
import { createPlayer } from '../../player/services';
import { addPlayer } from '../services';
import usePlayerStore from '../../../store/player-store';
import useGameStore from '../../../store/game-store';

describe('Game Service', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
    useGameStore.getState().reset();
  });

  describe('addPlayer', () => {
    it('should add a player with starting deck', () => {
      useGameStore.getState().createGame();

      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');

      const composition = {
        [copperCard.uid]: 7,
        [estateCard.uid]: 3,
      };

      useGameStore.getState().setStartingDeckComposition(composition);
      const gameWithComposition = useGameStore.getState().getGame()!;

      usePlayerStore.getState().addPlayer(player);

      const result = addPlayer(gameWithComposition, player, [
        copperCard,
        estateCard,
      ]);

      expect(result.success).toBe(true);
      expect(result.game.players).toHaveLength(1);

      // Check that returned player has the correct cards
      const returnedPlayer = result.game.players[0];
      expect(returnedPlayer.deck).toHaveLength(10);
      expect(returnedPlayer.allCards).toHaveLength(10);
    });

    it('should fail if starting deck composition not set', () => {
      useGameStore.getState().createGame();
      const game = useGameStore.getState().getGame()!;

      const player = createPlayer('Test Player');

      const result = addPlayer(game, player, []);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should fail if card definition not found', () => {
      useGameStore.getState().createGame();

      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { 'missing-card-uid': 7 };
      useGameStore.getState().setStartingDeckComposition(composition);
      const gameWithComposition = useGameStore.getState().getGame()!;

      usePlayerStore.getState().addPlayer(player);

      const result = addPlayer(gameWithComposition, player, [copperCard]);

      expect(result.success).toBe(false);
      expect(result.game.players).toHaveLength(0);
    });

    it('should not mutate the original game', () => {
      useGameStore.getState().createGame();

      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { [copperCard.uid]: 7 };
      useGameStore.getState().setStartingDeckComposition(composition);
      const gameWithComposition = useGameStore.getState().getGame()!;

      usePlayerStore.getState().addPlayer(player);

      const result = addPlayer(gameWithComposition, player, [copperCard]);

      expect(gameWithComposition.players).toHaveLength(0);
      expect(result.game).not.toBe(gameWithComposition);
    });
  });
});
