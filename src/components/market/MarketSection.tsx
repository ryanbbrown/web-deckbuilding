import React from 'react';
import { CardDefinition } from '@/features/cards/types';
import { Game } from '@/features/game/types';

interface MarketSectionProps {
  marketCards: CardDefinition[];
  isSelectingDeckComposition: boolean;
  deckComposition: Record<string, number>;
  updateDeckQuantity: (cardUid: string, increment: boolean) => void;
  handleDragStart: (e: React.DragEvent, cardDefinition: CardDefinition) => void;
  onShowAddCardModal: () => void;
  onStartDeckComposition: () => void;
  game: Game | null;
}

export function MarketSection({
  marketCards,
  isSelectingDeckComposition,
  deckComposition,
  updateDeckQuantity,
  handleDragStart,
  onShowAddCardModal,
  onStartDeckComposition,
  game,
}: MarketSectionProps) {
  return (
    <>
      {/* Market Container */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Market</h2>
        <div className="border border-gray-300 bg-white rounded-lg p-4 min-h-32 flex items-center">
          {marketCards.length === 0 ? (
            <p className="text-gray-500 italic">
              No cards in market. Add cards using the panel below.
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto">
              {marketCards.map((card) => (
                <div
                  key={card.uid}
                  className={`flex-shrink-0 bg-white border rounded-lg p-3 w-48 transition-all ${
                    isSelectingDeckComposition
                      ? 'border-blue-400 cursor-pointer hover:bg-blue-50 shadow-md'
                      : 'border-gray-300 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing'
                  }`}
                  onClick={() =>
                    isSelectingDeckComposition &&
                    updateDeckQuantity(card.uid, true)
                  }
                  onKeyDown={(e) => {
                    if (
                      isSelectingDeckComposition &&
                      (e.key === 'Enter' || e.key === ' ')
                    ) {
                      e.preventDefault();
                      updateDeckQuantity(card.uid, true);
                    }
                  }}
                  role={isSelectingDeckComposition ? 'button' : undefined}
                  tabIndex={isSelectingDeckComposition ? 0 : undefined}
                  draggable={!isSelectingDeckComposition}
                  onDragStart={(e) =>
                    !isSelectingDeckComposition && handleDragStart(e, card)
                  }
                >
                  <h3 className="font-medium text-gray-900 mb-1">
                    {card.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{card.text}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    Cost: {card.cost}
                  </p>
                  {isSelectingDeckComposition && deckComposition[card.uid] && (
                    <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Selected: {deckComposition[card.uid]}
                    </div>
                  )}
                  {isSelectingDeckComposition && (
                    <div className="mt-2 text-xs text-blue-600 text-center">
                      Click to add
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Actions Panel */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Market Actions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={onShowAddCardModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isSelectingDeckComposition}
          >
            Add Card to Market
          </button>
          <button
            onClick={onStartDeckComposition}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            disabled={isSelectingDeckComposition}
          >
            {game?.startingDeckComposition &&
            Object.keys(game.startingDeckComposition).length > 0
              ? 'Edit Starting Deck Composition'
              : 'Set Starting Deck Composition'}
          </button>
        </div>
      </div>
    </>
  );
}
