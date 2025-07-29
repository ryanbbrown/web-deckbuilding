import React from 'react';
import { Player } from '@/features/player/types';
import { Zone, CardInstance } from '@/features/cards/types';
import { CardZone } from './zones/CardZone';
import { CardActionHandlers } from '@/types/ui';

interface PlayerCardProps {
  player: Player;
  onCardClick: (
    card: CardInstance,
    playerId: string,
    zone: Zone,
    event: React.MouseEvent
  ) => void;
  onDrawCard: CardActionHandlers['onDrawCard'];
  onDrawHand: CardActionHandlers['onDrawHand'];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, playerId: string, zone: Zone) => void;
}

export function PlayerCard({
  player,
  onCardClick,
  onDrawCard,
  onDrawHand,
  onDragOver,
  onDrop,
}: PlayerCardProps) {
  return (
    <div
      className="border border-gray-300 bg-white rounded-lg p-6"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, player.playerId, Zone.DISCARD)}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {player.name}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Deck */}
        <CardZone
          zone={Zone.DECK}
          cards={player.deck}
          onCardClick={(card, zone, event) =>
            onCardClick(card, player.playerId, zone, event)
          }
        />

        {/* Discard */}
        <CardZone
          zone={Zone.DISCARD}
          cards={player.discard}
          onCardClick={(card, zone, event) =>
            onCardClick(card, player.playerId, zone, event)
          }
        />

        {/* Play Area */}
        <CardZone
          zone={Zone.PLAYED}
          cards={player.played}
          onCardClick={(card, zone, event) =>
            onCardClick(card, player.playerId, zone, event)
          }
        />

        {/* Hand */}
        <CardZone
          zone={Zone.HAND}
          cards={player.hand}
          onCardClick={(card, zone, event) =>
            onCardClick(card, player.playerId, zone, event)
          }
        />
      </div>

      {/* Player Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onDrawCard(player.playerId)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Draw Card
        </button>
        <button
          onClick={() => onDrawHand(player.playerId)}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
        >
          Draw Hand
        </button>
      </div>
    </div>
  );
}
