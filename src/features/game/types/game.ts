import { Market } from '../../market/types';
import { Player } from '../../player/types';

export interface Game {
  market: Market;
  players: Player[];
  startingDeckComposition: Record<string, number> | null;
  startingHandSize: number;
}
