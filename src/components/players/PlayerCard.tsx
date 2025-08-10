import React, { useState } from 'react';
import { Player } from '@/features/player/types';
import { Zone, CardInstance } from '@/features/cards/types';
import { CardZone } from './zones/CardZone';
import { CardActionHandlers } from '@/types/ui';
import { DeckComposition } from './DeckComposition';
import usePlayerStore from '@/store/player-store';

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
  onDiscardAll: CardActionHandlers['onDiscardAll'];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, playerId: string, zone: Zone) => void;
}

export function PlayerCard({
  player,
  onCardClick,
  onDrawCard,
  onDrawHand,
  onDiscardAll,
  onDragOver,
  onDrop,
}: PlayerCardProps) {
  const [showDeckComposition, setShowDeckComposition] = useState(false);
  const [showAllDiscardCards, setShowAllDiscardCards] = useState(false);
  const { incrementPlayerCoins, decrementPlayerCoins, incrementPlayerTurns } =
    usePlayerStore();
  return (
    <div
      className="border border-gray-300 bg-white rounded-lg p-6"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, player.playerId, Zone.DISCARD)}
      data-testid={`player-section-${player.name.toLowerCase()}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
          <span className="text-sm text-gray-600 font-medium ml-3">
            Turn {player.turns ?? 1}
          </span>
          <button
            onClick={() => incrementPlayerTurns(player.playerId)}
            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-600 transition-colors"
            data-testid={`increment-turns-${player.name.toLowerCase()}`}
            aria-label="Increment turn"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => decrementPlayerCoins(player.playerId)}
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            data-testid={`decrement-coins-${player.name.toLowerCase()}`}
            aria-label="Decrease coins"
          >
            −
          </button>
          <span
            className="text-lg font-semibold text-gray-900 min-w-[4ch] text-center"
            data-testid={`coins-${player.name.toLowerCase()}`}
          >
            {player.coins ?? 0} coins
          </span>
          <button
            onClick={() => incrementPlayerCoins(player.playerId)}
            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-green-600 transition-colors"
            data-testid={`increment-coins-${player.name.toLowerCase()}`}
            aria-label="Increase coins"
          >
            +
          </button>
        </div>
      </div>

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
          showAllCards={showAllDiscardCards}
          onToggleView={() => setShowAllDiscardCards(!showAllDiscardCards)}
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

      {/* Deck Composition Section */}
      {showDeckComposition && <DeckComposition allCards={player.allCards} />}

      {/* Player Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onDrawCard(player.playerId)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          data-testid="draw-card-btn"
        >
          Draw Card
        </button>
        <button
          onClick={() => onDrawHand(player.playerId)}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
          data-testid="draw-hand-btn"
        >
          Draw Hand
        </button>
        <button
          onClick={() => onDiscardAll(player.playerId)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          data-testid="discard-all-btn"
        >
          Discard All
        </button>
        <button
          onClick={() => setShowDeckComposition(!showDeckComposition)}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors"
          data-testid="show-deck-comp-btn"
        >
          {showDeckComposition ? 'Hide Deck Comp' : 'Show Deck Comp'}
        </button>
      </div>
    </div>
  );
}
