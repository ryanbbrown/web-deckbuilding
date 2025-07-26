import { CardDefinition, Zone } from '../../cards/types';
import { createCardInstance } from '../../cards/services';
import { createMarket, addCardDefinition } from '../../market/services';
import { registerCard, shuffleDeck } from '../../player/services';
import { Player } from '../../player/types';
import { Game } from '../types';

export function createGame(): Game {
  return {
    market: createMarket(),
    players: [],
    startingDeckComposition: null,
    startingHandSize: 5,
  };
}

export function addCardToMarket(
  game: Game,
  cardDefinition: CardDefinition
): Game {
  return {
    ...game,
    market: addCardDefinition(game.market, cardDefinition),
  };
}

export function setStartingDeckComposition(
  game: Game,
  composition: Record<string, number>
): Game {
  return {
    ...game,
    startingDeckComposition: composition,
  };
}

export function setStartingHandSize(game: Game, size: number): Game {
  return {
    ...game,
    startingHandSize: size,
  };
}

export function addPlayer(
  game: Game,
  player: Player,
  cardDefinitions: CardDefinition[]
): { game: Game; success: boolean } {
  if (!game.startingDeckComposition) {
    return { game, success: false };
  }

  const cardDefMap = new Map(cardDefinitions.map((def) => [def.uid, def]));
  let updatedPlayer = player;

  for (const [cardDefUid, count] of Object.entries(
    game.startingDeckComposition
  )) {
    const cardDef = cardDefMap.get(cardDefUid);
    if (!cardDef) {
      return { game, success: false };
    }

    for (let i = 0; i < count; i++) {
      const cardInstance = createCardInstance(cardDef);
      updatedPlayer = registerCard(updatedPlayer, cardInstance, Zone.DECK);
    }
  }

  updatedPlayer = shuffleDeck(updatedPlayer);

  return {
    game: {
      ...game,
      players: [...game.players, updatedPlayer],
    },
    success: true,
  };
}

export function updatePlayer(game: Game, updatedPlayer: Player): Game {
  return {
    ...game,
    players: game.players.map((p) =>
      p.playerId === updatedPlayer.playerId ? updatedPlayer : p
    ),
  };
}

export function getPlayer(game: Game, playerId: string): Player | null {
  return game.players.find((p) => p.playerId === playerId) || null;
}
