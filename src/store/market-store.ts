import { create } from 'zustand';
import { logger } from './logger';
import { CardDefinition } from '../features/cards/types';

interface MarketState extends Record<string, unknown> {
  catalog: Set<CardDefinition>;
  addCardDefinition: (cardDefinition: CardDefinition) => void;
  removeCardDefinition: (cardDefinition: CardDefinition) => void;
  reset: () => void;
  hasCardDefinition: (cardDefinition: CardDefinition) => boolean;
  getMarketCards: () => CardDefinition[];
}

const useMarketStore = create<MarketState>()(
  logger<MarketState>(
    (set, get) => ({
      catalog: new Set<CardDefinition>(),

      addCardDefinition: (cardDefinition) => {
        set((state) => ({
          catalog: new Set([...state.catalog, cardDefinition]),
        }));
      },

      removeCardDefinition: (cardDefinition) => {
        set((state) => {
          const newCatalog = new Set(state.catalog);
          newCatalog.delete(cardDefinition);
          return { catalog: newCatalog };
        });
      },

      reset: () => {
        set({ catalog: new Set<CardDefinition>() });
      },

      hasCardDefinition: (cardDefinition) => {
        return get().catalog.has(cardDefinition);
      },

      getMarketCards: () => {
        return Array.from(get().catalog);
      },
    }),
    'marketStore'
  )
);

export default useMarketStore;
