import { CardDefinition } from '../../cards/types';
import { shuffleDeck } from '../../player/services';
import { Player } from '../../player/types';
import { Game } from '../types';
import { setupPlayerDeck } from '../../../lib/player-utils';

export function addPlayer(
  game: Game,
  player: Player,
  cardDefinitions: CardDefinition[]
): { game: Game; success: boolean } {
  if (!game.startingDeckComposition) {
    return { game, success: false };
  }

  // Set up player deck using utility
  const deckResult = setupPlayerDeck(
    player,
    game.startingDeckComposition,
    cardDefinitions
  );
  if (!deckResult.success) {
    return { game, success: false };
  }

  // Shuffle the deck
  const shuffledPlayer = shuffleDeck(deckResult.player);

  return {
    game: {
      ...game,
      players: [...game.players, shuffledPlayer],
    },
    success: true,
  };
}
