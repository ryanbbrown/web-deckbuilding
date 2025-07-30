import React from 'react';
import { Player } from '@/features/player/types';
import { Zone, CardInstance } from '@/features/cards/types';
import { Game } from '@/features/game/types';
import { PlayerCard } from './PlayerCard';
import { AddPlayerInterface } from './AddPlayerInterface';

interface PlayersSectionProps {
  players: Player[];
  showInlineAddPlayer: boolean;
  playerName: string;
  setPlayerName: (name: string) => void;
  game: Game | null;
  onCardClick: (
    card: CardInstance,
    playerId: string,
    zone: Zone,
    event: React.MouseEvent
  ) => void;
  onDrawCard: (playerId: string) => void;
  onDrawHand: (playerId: string) => void;
  onDiscardAll: (playerId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, playerId: string, zone: Zone) => void;
  onAddPlayer: () => void;
  onShowInlineForm: () => void;
  onCancelAddPlayer: () => void;
}

export function PlayersSection({
  players,
  showInlineAddPlayer,
  playerName,
  setPlayerName,
  game,
  onCardClick,
  onDrawCard,
  onDrawHand,
  onDiscardAll,
  onDragOver,
  onDrop,
  onAddPlayer,
  onShowInlineForm,
  onCancelAddPlayer,
}: PlayersSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Players</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {players.length === 0 ? (
          <AddPlayerInterface
            showInlineAddPlayer={showInlineAddPlayer}
            playerName={playerName}
            setPlayerName={setPlayerName}
            game={game}
            onAddPlayer={onAddPlayer}
            onShowInlineForm={onShowInlineForm}
            onCancel={onCancelAddPlayer}
          />
        ) : (
          <>
            {players.map((player) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                onCardClick={onCardClick}
                onDrawCard={onDrawCard}
                onDrawHand={onDrawHand}
                onDiscardAll={onDiscardAll}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
            ))}
            <AddPlayerInterface
              showInlineAddPlayer={showInlineAddPlayer}
              playerName={playerName}
              setPlayerName={setPlayerName}
              game={game}
              onAddPlayer={onAddPlayer}
              onShowInlineForm={onShowInlineForm}
              onCancel={onCancelAddPlayer}
            />
          </>
        )}
      </div>
    </div>
  );
}
