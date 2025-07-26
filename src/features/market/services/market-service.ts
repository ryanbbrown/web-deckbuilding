import { CardDefinition } from '../../cards/types';
import { Market } from '../types';

export function createMarket(): Market {
  return {
    catalog: new Set<CardDefinition>(),
  };
}

export function addCardDefinition(
  market: Market,
  cardDefinition: CardDefinition
): Market {
  const newCatalog = new Set(market.catalog);
  newCatalog.add(cardDefinition);

  return {
    ...market,
    catalog: newCatalog,
  };
}

export function removeCardDefinition(
  market: Market,
  cardDefinition: CardDefinition
): Market {
  const newCatalog = new Set(market.catalog);
  newCatalog.delete(cardDefinition);

  return {
    ...market,
    catalog: newCatalog,
  };
}

export function hasCardDefinition(
  market: Market,
  cardDefinition: CardDefinition
): boolean {
  return market.catalog.has(cardDefinition);
}

export function getMarketCards(market: Market): CardDefinition[] {
  return Array.from(market.catalog);
}
