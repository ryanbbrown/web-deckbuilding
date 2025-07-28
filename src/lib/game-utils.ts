import { Game } from '../features/game/types';

export function createDefaultGame(): Game {
  return {
    market: { catalog: new Set() },
    players: [],
    startingDeckComposition: null,
    startingHandSize: 5,
  };
}
