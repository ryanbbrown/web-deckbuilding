import React from 'react';
import { Game } from '@/features/game/types';

interface AddPlayerInterfaceProps {
  showInlineAddPlayer: boolean;
  playerName: string;
  setPlayerName: (name: string) => void;
  game: Game | null;
  onAddPlayer: () => void;
  onShowInlineForm: () => void;
  onCancel: () => void;
}

export function AddPlayerInterface({
  showInlineAddPlayer,
  playerName,
  setPlayerName,
  game,
  onAddPlayer,
  onShowInlineForm,
  onCancel,
}: AddPlayerInterfaceProps) {
  const hasStartingDeck =
    game?.startingDeckComposition &&
    Object.keys(game.startingDeckComposition).length > 0;

  if (showInlineAddPlayer) {
    return (
      <div className="border border-gray-300 bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add New Player
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="player-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Player Name
            </label>
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter player name"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onAddPlayer}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Player
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (hasStartingDeck) {
          onShowInlineForm();
        }
      }}
      onKeyDown={(e) => {
        if (hasStartingDeck && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onShowInlineForm();
        }
      }}
      role={hasStartingDeck ? 'button' : undefined}
      tabIndex={hasStartingDeck ? 0 : undefined}
      className={`border border-gray-300 bg-white rounded-lg p-12 flex flex-col items-center justify-center min-h-48 transition-colors ${
        hasStartingDeck
          ? 'cursor-pointer hover:bg-gray-50'
          : 'cursor-not-allowed opacity-60'
      }`}
    >
      <div className="text-6xl text-gray-400 mb-4">+</div>
      <p className="text-lg text-gray-600">Add Player</p>
      {!hasStartingDeck && (
        <p className="text-sm text-red-500 mt-2">
          Set starting deck composition first
        </p>
      )}
    </div>
  );
}
