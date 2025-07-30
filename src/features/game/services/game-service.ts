import { CardDefinition, Zone } from '../../cards/types';
import { createCardInstance } from '../../cards/services';
import { shuffleDeck, registerCardToPlayer } from '../../player/services';
import { Player } from '../../player/types';
import { Game } from '../types';

export function createDefaultGame(): Game {
  return {
    market: { catalog: [] },
    players: [],
    startingDeckComposition: null,
    startingHandSize: 5,
  };
}

export function setupPlayerDeck(
  player: Player,
  deckComposition: Record<string, number>,
  cardDefinitions: CardDefinition[]
): { player: Player; success: boolean } {
  const cardDefMap = new Map(cardDefinitions.map((def) => [def.uid, def]));
  let updatedPlayer = { ...player };

  for (const [cardDefUid, count] of Object.entries(deckComposition)) {
    const cardDef = cardDefMap.get(cardDefUid);
    if (!cardDef) {
      return { player, success: false };
    }

    for (let i = 0; i < count; i++) {
      const cardInstance = createCardInstance(cardDef);
      updatedPlayer = registerCardToPlayer(
        updatedPlayer,
        cardInstance,
        Zone.DECK
      );
    }
  }

  return { player: updatedPlayer, success: true };
}

export function addPlayer(
  game: Game,
  player: Player,
  cardDefinitions: CardDefinition[]
): { game: Game; success: boolean } {
  if (!game.startingDeckComposition) {
    return { game, success: false };
  }

  // Set up player deck
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
