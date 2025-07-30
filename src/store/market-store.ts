import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from './logger';
import { CardDefinition } from '../features/cards/types';

interface MarketState extends Record<string, unknown> {
  catalog: CardDefinition[];
  addCardDefinition: (cardDefinition: CardDefinition) => void;
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

        addCardDefinition: (cardDefinition) => {
          set((state) => ({
            catalog: [...state.catalog, cardDefinition],
          }));
        },

        removeCardDefinition: (cardDefinition) => {
          set((state) => ({
            catalog: state.catalog.filter((card) => card !== cardDefinition),
          }));
        },

        reset: () => {
          set({ catalog: [] });
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
