import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from './logger';
import { CardDefinition } from '../features/cards/types';

export interface MarketState extends Record<string, unknown> {
  catalog: CardDefinition[];

  // Multiplayer state
  roomId: string | null;
  isConnected: boolean;

  addCardDefinition: (cardDefinition: CardDefinition) => void;
  addMultipleCardDefinitions: (cardDefinitions: CardDefinition[]) => void;
  removeCardDefinition: (cardDefinition: CardDefinition) => void;
  reset: () => void;
  hasCardDefinition: (cardDefinition: CardDefinition) => boolean;
  getMarketCards: () => CardDefinition[];
}

const useMarketStore = create<MarketState>()(
  persist(
    logger<MarketState>(
      (set, get) => ({
        catalog: [],

        // Multiplayer state
        roomId: null,
        isConnected: false,

        addCardDefinition: (cardDefinition) => {
          set((state) => ({
            catalog: [...state.catalog, cardDefinition],
          }));
        },

        addMultipleCardDefinitions: (cardDefinitions) => {
          set((state) => ({
            catalog: [...state.catalog, ...cardDefinitions],
          }));
        },

        removeCardDefinition: (cardDefinition) => {
          set((state) => ({
            catalog: state.catalog.filter((card) => card !== cardDefinition),
          }));
        },

        reset: () => {
          set({
            catalog: [],
            roomId: null,
            isConnected: false,
          });
        },

        hasCardDefinition: (cardDefinition) => {
          return get().catalog.includes(cardDefinition);
        },

        getMarketCards: () => {
          return get().catalog;
        },
      }),
      'marketStore'
    ),
    {
      name: 'market-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useMarketStore;
