import { CardDefinition, CardInstance, Zone } from '../types';

export function createCardDefinition(
  name: string,
  text: string,
  cost: number = 0
): CardDefinition {
  return {
    name,
    text,
    cost,
    uid: crypto.randomUUID(),
  };
}

export function createCardInstance(definition: CardDefinition): CardInstance {
  return {
    definition,
    zone: Zone.MARKET,
    instanceId: crypto.randomUUID(),
  };
}

export function setCardOwner(
  card: CardInstance,
  ownerId: string
): CardInstance {
  return {
    ...card,
    ownerId,
  };
}

export function isValidCardState(card: CardInstance): boolean {
  if (card.ownerId) {
    return [Zone.DECK, Zone.HAND, Zone.PLAYED, Zone.DISCARD].includes(
      card.zone
    );
  } else {
    return card.zone === Zone.MARKET;
  }
}

export function moveCardToZone(card: CardInstance, zone: Zone): CardInstance {
  const movedCard = {
    ...card,
    zone,
  };

  if (!isValidCardState(movedCard)) {
    throw new Error(
      `Invalid card state: ${card.ownerId ? 'owned' : 'unowned'} card cannot be in ${zone}`
    );
  }

  return movedCard;
}
