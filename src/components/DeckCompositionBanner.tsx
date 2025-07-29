import React from 'react';

interface DeckCompositionBannerProps {
  deckComposition: Record<string, number>;
  totalDeckSize: number;
  getCardNameFromUid: (uid: string) => string;
  updateDeckQuantity: (cardUid: string, increment: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function DeckCompositionBanner({
  deckComposition,
  totalDeckSize,
  getCardNameFromUid,
  updateDeckQuantity,
  onSave,
  onCancel,
}: DeckCompositionBannerProps) {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            Setting Starting Deck Composition
          </h3>
          <p className="text-sm text-blue-700">
            Click cards below to add/remove them from the starting deck
          </p>
          {totalDeckSize > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              Current deck size: {totalDeckSize} cards
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Save Composition
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      {Object.keys(deckComposition).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(deckComposition).map(([cardUid, quantity]) => {
            const cardName = getCardNameFromUid(cardUid);
            return (
              <div
                key={cardUid}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>
                  {cardName}: {quantity}
                </span>
                <button
                  onClick={() => updateDeckQuantity(cardUid, false)}
                  className="w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                >
                  -
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
