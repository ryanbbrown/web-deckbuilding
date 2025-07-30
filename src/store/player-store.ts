import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from './logger';
import { CardInstance, Zone } from '../features/cards/types';
import { Player } from '../features/player/types';
import {
  shuffleDeck,
  drawCard,
  drawHand,
  playCard,
  discardCard,
  discardAllInPlay,
  discardAllInHand,
  trashCard,
  moveCardBetweenZones,
  registerCardToPlayer,
} from '../features/player/services/player-service';

interface PlayerState extends Record<string, unknown> {
  players: Record<string, Player>;

  // CRUD actions
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  reset: () => void;

  // Selectors
  getPlayer: (playerId: string) => Player | undefined;
  getAllPlayers: () => Player[];

  // Moved from service
  registerCard: (
    playerId: string,
    card: CardInstance,
    initialZone?: Zone
  ) => void;
  moveCardBetweenZones: (
    playerId: string,
    card: CardInstance,
    fromZone: Zone,
    toZone: Zone
  ) => void;

  // Wrapper actions for service functions
  drawPlayerCard: (playerId: string) => { drawnCard: CardInstance | null };
  drawPlayerHand: (
    playerId: string,
    handSize: number
  ) => { drawnCards: CardInstance[] };
  playPlayerCard: (playerId: string, card: CardInstance) => boolean;
  discardPlayerCard: (
    playerId: string,
    card: CardInstance,
    fromZone?: Zone
  ) => boolean;
  discardAllPlayerInPlay: (playerId: string) => void;
  discardAllPlayerInHand: (playerId: string) => void;
  shufflePlayerDeck: (playerId: string) => void;
  trashPlayerCard: (
    playerId: string,
    card: CardInstance,
    fromZone: Zone
  ) => boolean;
}

const usePlayerStore = create<PlayerState>()(
  persist(
    logger<PlayerState>(
      (set, get) => ({
        players: {},

        // CRUD actions
        addPlayer: (player) => {
          set((state) => ({
            players: { ...state.players, [player.playerId]: player },
          }));
        },

        updatePlayer: (playerId, updates) => {
          set((state) => {
            const player = state.players[playerId];
            if (!player) return state;

            return {
              players: {
                ...state.players,
                [playerId]: { ...player, ...updates },
              },
            };
          });
        },

        removePlayer: (playerId) => {
          set((state) => {
            const newPlayers = { ...state.players };
            delete newPlayers[playerId];
            return { players: newPlayers };
          });
        },

        reset: () => {
          set({ players: {} });
        },

        // Selectors
        getPlayer: (playerId) => {
          return get().players[playerId];
        },

        getAllPlayers: () => {
          return Object.values(get().players);
        },

        // Moved from service - registerCard
        registerCard: (playerId, card, initialZone = Zone.DISCARD) => {
          const player = get().players[playerId];
          if (!player) return;

          const updatedPlayer = registerCardToPlayer(player, card, initialZone);
          get().updatePlayer(playerId, updatedPlayer);
        },

        // Moved from service - moveCardBetweenZones
        moveCardBetweenZones: (playerId, card, fromZone, toZone) => {
          const player = get().players[playerId];
          if (!player) return;

          const updatedPlayer = moveCardBetweenZones(
            player,
            card,
            fromZone,
            toZone
          );
          get().updatePlayer(playerId, updatedPlayer);
        },

        // Wrapper actions for service functions
        drawPlayerCard: (playerId) => {
          const player = get().players[playerId];
          if (!player) return { drawnCard: null };

          const result = drawCard(player);
          get().updatePlayer(playerId, result.player);
          return { drawnCard: result.drawnCard };
        },

        drawPlayerHand: (playerId, handSize) => {
          const player = get().players[playerId];
          if (!player) return { drawnCards: [] };

          const result = drawHand(player, handSize);
          get().updatePlayer(playerId, result.player);
          return { drawnCards: result.drawnCards };
        },

        playPlayerCard: (playerId, card) => {
          const player = get().players[playerId];
          if (!player) return false;

          const result = playCard(player, card);
          if (result.success) {
            get().updatePlayer(playerId, result.player);
          }
          return result.success;
        },

        discardPlayerCard: (playerId, card, fromZone = Zone.HAND) => {
          const player = get().players[playerId];
          if (!player) return false;

          const result = discardCard(player, card, fromZone);
          if (result.success) {
            get().updatePlayer(playerId, result.player);
          }
          return result.success;
        },

        discardAllPlayerInPlay: (playerId) => {
          const player = get().players[playerId];
          if (!player) return;

          const updatedPlayer = discardAllInPlay(player);
          get().updatePlayer(playerId, updatedPlayer);
        },

        discardAllPlayerInHand: (playerId) => {
          const player = get().players[playerId];
          if (!player) return;

          const updatedPlayer = discardAllInHand(player);
          get().updatePlayer(playerId, updatedPlayer);
        },

        shufflePlayerDeck: (playerId) => {
          const player = get().players[playerId];
          if (!player) return;

          const updatedPlayer = shuffleDeck(player);
          get().updatePlayer(playerId, updatedPlayer);
        },

        trashPlayerCard: (playerId, card, fromZone) => {
          const player = get().players[playerId];
          if (!player) return false;

          const result = trashCard(player, card, fromZone);
          if (result.success) {
            get().updatePlayer(playerId, result.player);
          }
          return result.success;
        },
      }),
      'playerStore'
    ),
    {
      name: 'player-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePlayerStore;
