import React from 'react';
import { Game } from '@/features/game/types';

interface GameHeaderProps {
  game: Game | null;
  playersCount: number;
}

export function GameHeader({ game, playersCount }: GameHeaderProps) {
  const totalDeckCards = game?.startingDeckComposition
    ? Object.values(game.startingDeckComposition).reduce(
        (sum, qty) => sum + qty,
        0
      )
    : 0;

  return (
    <div className="mb-6">
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
  );
}
