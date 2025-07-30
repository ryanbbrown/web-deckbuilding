import { CardInstance, Zone } from '@/features/cards/types';

export interface CardZoneConfig {
  zone: Zone;
  title: string;
  colorScheme: 'blue' | 'red' | 'green' | 'yellow';
  emptyMessage: string;
  gridSpan?: string;
}

export interface CardActionHandlers {
  onCardClick: (
    card: CardInstance,
    zone: Zone,
    event: React.MouseEvent
  ) => void;
  onDrawCard: (playerId: string) => void;
  onDrawHand: (playerId: string) => void;
  onDiscardAll: (playerId: string) => void;
}

export const ZONE_CONFIGS: Record<Zone, Omit<CardZoneConfig, 'zone'>> = {
  [Zone.DECK]: {
    title: 'Deck',
    colorScheme: 'blue',
    emptyMessage: 'Empty deck',
    gridSpan: 'col-span-1',
  },
  [Zone.DISCARD]: {
    title: 'Discard',
    colorScheme: 'red',
    emptyMessage: 'Empty',
    gridSpan: 'col-span-1',
  },
  [Zone.PLAYED]: {
    title: 'Play Area',
    colorScheme: 'green',
    emptyMessage: 'No cards in play',
    gridSpan: 'col-span-2',
  },
  [Zone.HAND]: {
    title: 'Hand',
    colorScheme: 'yellow',
    emptyMessage: 'No cards in hand',
    gridSpan: 'col-span-2',
  },
  [Zone.MARKET]: {
    title: 'Market',
    colorScheme: 'blue',
    emptyMessage: 'No cards in market',
    gridSpan: 'col-span-1',
  },
};
