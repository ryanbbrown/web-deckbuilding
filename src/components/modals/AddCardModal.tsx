import React from 'react';

interface CardForm {
  name: string;
  text: string;
  cost: number;
}

interface AddCardModalProps {
  cardForm: CardForm;
  setCardForm: React.Dispatch<React.SetStateAction<CardForm>>;
  onAddCard: () => void;
  onClose: () => void;
}

export function AddCardModal({
  cardForm,
  setCardForm,
  onAddCard,
  onClose,
}: AddCardModalProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Card to Market
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="card-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="card-name"
              type="text"
              value={cardForm.name}
              onChange={(e) =>
                setCardForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Card name"
            />
          </div>
          <div>
            <label
              htmlFor="card-text"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Text
            </label>
            <textarea
              id="card-text"
              value={cardForm.text}
              onChange={(e) =>
                setCardForm((prev) => ({ ...prev, text: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Card description"
              rows={3}
            />
          </div>
          <div>
            <label
              htmlFor="card-cost"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cost
            </label>
            <input
              id="card-cost"
              type="number"
              value={cardForm.cost}
              onChange={(e) =>
                setCardForm((prev) => ({
                  ...prev,
                  cost: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onAddCard}
            disabled={!cardForm.name.trim() || !cardForm.text.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Card
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
