import { CardInstance } from '../../cards/types';

export interface Player {
  name: string;
  playerId: string;
  coins: number;
  allCards: CardInstance[];
  deck: CardInstance[];
  hand: CardInstance[];
  played: CardInstance[];
  discard: CardInstance[];
}
