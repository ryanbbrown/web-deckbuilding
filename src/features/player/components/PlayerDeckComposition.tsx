import React from 'react';
import { CardInstance } from '@/features/cards/types';

interface PlayerDeckCompositionProps {
  allCards: CardInstance[];
}

export function PlayerDeckComposition({
  allCards,
}: PlayerDeckCompositionProps) {
  const getCardCounts = (cards: CardInstance[]): Record<string, number> => {
    return cards.reduce(
      (counts, card) => {
        const cardName = card.definition.name;
        counts[cardName] = (counts[cardName] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
  };

  const cardCounts = getCardCounts(allCards);
  const compositionText = Object.entries(cardCounts)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ');

  if (allCards.length === 0) {
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded border text-sm text-gray-600">
        No cards in deck
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded border">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Deck Composition:
      </h4>
      <p className="text-sm text-gray-600">{compositionText}</p>
    </div>
  );
}
