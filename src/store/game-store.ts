import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from './logger';
import { Game } from '../features/game/types';
import { Player } from '../features/player/types';
import { CardDefinition } from '../features/cards/types';
import {
  addPlayer,
  createDefaultGame,
} from '../features/game/services/game-service';
import useMarketStore from './market-store';
import usePlayerStore from './player-store';
import { multiplayerManager } from '../lib/multiplayer/multiplayerManager';

export interface GameState extends Record<string, unknown> {
  game: Game | null;

  // Multiplayer state
  roomId: string | null;
  isConnected: boolean;

  // Actions
  createGame: () => void;
  setStartingDeckComposition: (composition: Record<string, number>) => void;
  setStartingHandSize: (size: number) => void;
  reset: () => void;

  // Multiplayer actions
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;

  // Coordination actions
  addCardToMarket: (cardDefinition: CardDefinition) => void;
  addMultipleCardsToMarket: (cardDefinitions: CardDefinition[]) => void;
  addPlayerToGame: (
    player: Player,
    cardDefinitions: CardDefinition[]
  ) => boolean;

  // Selectors
  getGame: () => Game | null;
  getPlayer: (playerId: string) => Player | null;
  getAllPlayers: () => Player[];
}

const useGameStore = create<GameState>()(
  persist(
    logger<GameState>(
      (set, get) => ({
        game: null,

        // Multiplayer state
        roomId: null,
        isConnected: false,

        createGame: () => {
          set({
            game: createDefaultGame(),
          });
        },

        setStartingDeckComposition: (composition) => {
          set((state) => {
            if (!state.game) return state;
            return {
              game: {
                ...state.game,
                startingDeckComposition: composition,
              },
            };
          });
        },

        setStartingHandSize: (size) => {
          set((state) => {
            if (!state.game) return state;
            return {
              game: {
                ...state.game,
                startingHandSize: size,
              },
            };
          });
        },

        reset: () => {
          set({ game: null });
          useMarketStore.getState().reset();
          usePlayerStore.getState().reset();
        },

        // Coordination actions
        addCardToMarket: (cardDefinition) => {
          const currentGame = get().game;
          if (!currentGame) return;

          useMarketStore.getState().addCardDefinition(cardDefinition);

          set((state) => {
            if (!state.game) return state;
            return {
              game: {
                ...state.game,
                market: {
                  catalog: useMarketStore.getState().catalog,
                },
              },
            };
          });
        },

        addMultipleCardsToMarket: (cardDefinitions) => {
          const currentGame = get().game;
          if (!currentGame) return;

          useMarketStore.getState().addMultipleCardDefinitions(cardDefinitions);

          set((state) => {
            if (!state.game) return state;
            return {
              game: {
                ...state.game,
                market: {
                  catalog: useMarketStore.getState().catalog,
                },
              },
            };
          });
        },

        addPlayerToGame: (player, cardDefinitions) => {
          const currentGame = get().game;
          if (!currentGame) return false;

          const result = addPlayer(currentGame, player, cardDefinitions);

          if (result.success) {
            // Add player to player store
            usePlayerStore
              .getState()
              .addPlayer(result.game.players[result.game.players.length - 1]);

            // Update game state
            set({
              game: {
                ...result.game,
                players: [], // Players are now managed by player store
              },
            });
          }

          return result.success;
        },

        // Multiplayer actions
        createRoom: async () => {
          // Initialize multiplayer manager with all stores
          multiplayerManager.setStores({
            gameStore: useGameStore,
            marketStore: useMarketStore,
            playerStore: usePlayerStore,
          });

          const roomId = await multiplayerManager.createRoom();

          set({
            roomId,
            isConnected: true,
          });

          return roomId;
        },

        joinRoom: async (roomId: string) => {
          // Initialize multiplayer manager with all stores
          multiplayerManager.setStores({
            gameStore: useGameStore,
            marketStore: useMarketStore,
            playerStore: usePlayerStore,
          });

          await multiplayerManager.joinRoom(roomId);

          set({
            roomId,
            isConnected: true,
          });
        },

        leaveRoom: () => {
          multiplayerManager.leaveRoom();

          set({
            roomId: null,
            isConnected: false,
          });
        },

        // Selectors
        getGame: () => {
          return get().game;
        },

        getPlayer: (playerId) => {
          return usePlayerStore.getState().getPlayer(playerId) || null;
        },

        getAllPlayers: () => {
          return usePlayerStore.getState().getAllPlayers();
        },
      }),
      'gameStore'
    ),
    {
      name: 'game-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameStore;
