import React, { useState } from 'react';
import { Game } from '@/features/game/types';
import useGameStore from '@/store/game-store';
import Button from '@/components/ui/button';

interface GameHeaderProps {
  game: Game | null;
  playersCount: number;
}

export function GameHeader({ game, playersCount }: GameHeaderProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { reset } = useGameStore();

  const totalDeckCards = game?.startingDeckComposition
    ? Object.values(game.startingDeckComposition).reduce(
        (sum, qty) => sum + qty,
        0
      )
    : 0;

  const isInitialState = (game: Game | null): boolean => {
    if (!game) return true;

    // Check if game state differs from initial state
    const hasPlayers = playersCount > 0;
    const hasMarketCards = game.market?.catalog?.length > 0;
    const hasDeckComposition =
      game.startingDeckComposition !== null &&
      Object.keys(game.startingDeckComposition || {}).length > 0;
    const hasNonDefaultHandSize = game.startingHandSize !== 5;

    return (
      !hasPlayers &&
      !hasMarketCards &&
      !hasDeckComposition &&
      !hasNonDefaultHandSize
    );
  };

  const handleResetGame = () => {
    const { createGame } = useGameStore.getState();
    reset();
    createGame();
    setShowConfirmModal(false);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deck Building Game
          </h1>
          <p className="text-gray-600">
            {game
              ? `Game initialized with ${playersCount} players`
              : 'Initializing game...'}
          </p>
          {game?.startingDeckComposition &&
            Object.keys(game.startingDeckComposition).length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Starting deck set: {totalDeckCards} cards
              </p>
            )}
        </div>
        {game && !isInitialState(game) && (
          <Button
            text="Reset Game"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-white hover:bg-red-600 border border-red-500 hover:border-red-600 h-10 px-4 py-2"
          />
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Game?
            </h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all players, cards, and game
              progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                text="Cancel"
                onClick={() => setShowConfirmModal(false)}
              />
              <Button
                text="Reset Game"
                onClick={handleResetGame}
                className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-white hover:bg-red-600 border border-red-500 hover:border-red-600 h-10 px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
