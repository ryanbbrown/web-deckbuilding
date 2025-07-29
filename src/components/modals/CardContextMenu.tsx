import React from 'react';
import { Zone, CardInstance } from '@/features/cards/types';

interface SelectedCard {
  card: CardInstance;
  playerId: string;
  currentZone: Zone;
  position: { x: number; y: number };
}

interface CardContextMenuProps {
  selectedCard: SelectedCard;
  onMoveCard: (toZone: Zone) => void;
  onClose: () => void;
}

export function CardContextMenu({
  selectedCard,
  onMoveCard,
  onClose,
}: CardContextMenuProps) {
  return (
    <div
      className="fixed bg-white rounded-lg p-3 shadow-lg border border-gray-200 z-50"
      style={{
        top: selectedCard.position.y,
        left: selectedCard.position.x,
      }}
    >
      {selectedCard.currentZone !== Zone.PLAYED && (
        <button
          onClick={() => onMoveCard(Zone.PLAYED)}
          className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md mb-1"
        >
          Play Card
        </button>
      )}
      {selectedCard.currentZone !== Zone.DISCARD && (
        <button
          onClick={() => onMoveCard(Zone.DISCARD)}
          className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md mb-1"
        >
          Discard Card
        </button>
      )}
      {selectedCard.currentZone !== Zone.HAND && (
        <button
          onClick={() => onMoveCard(Zone.HAND)}
          className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md mb-1"
        >
          Return to Hand
        </button>
      )}
      <button
        onClick={onClose}
        className="block w-full text-left text-sm text-gray-500 hover:bg-gray-100 p-2 rounded-md border-t border-gray-200 mt-1"
      >
        Cancel
      </button>
    </div>
  );
}
