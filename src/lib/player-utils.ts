import { CardDefinition, CardInstance, Zone } from '../features/cards/types';
import { Player } from '../features/player/types';
import { createCardInstance, moveCardToZone } from '../features/cards/services';

export function moveCardBetweenZones(
  player: Player,
  card: CardInstance,
  fromZone: Zone,
  toZone: Zone
): Player {
  const movedCard = moveCardToZone(card, toZone);

  const removeFromZone = (cards: CardInstance[]): CardInstance[] =>
    cards.filter((c) => c.instanceId !== card.instanceId);

  const addToZone = (cards: CardInstance[]): CardInstance[] => [
    ...cards,
    movedCard,
  ];

  let updatedPlayer = {
    ...player,
    allCards: player.allCards.map((c) =>
      c.instanceId === card.instanceId ? movedCard : c
    ),
  };

  // Remove from source zone
  switch (fromZone) {
    case Zone.DECK:
      updatedPlayer.deck = removeFromZone(player.deck);
      break;
    case Zone.HAND:
      updatedPlayer.hand = removeFromZone(player.hand);
      break;
    case Zone.PLAYED:
      updatedPlayer.played = removeFromZone(player.played);
      break;
    case Zone.DISCARD:
      updatedPlayer.discard = removeFromZone(player.discard);
      break;
  }

  // Add to destination zone
  switch (toZone) {
    case Zone.DECK:
      updatedPlayer.deck = addToZone(updatedPlayer.deck);
      break;
    case Zone.HAND:
      updatedPlayer.hand = addToZone(updatedPlayer.hand);
      break;
    case Zone.PLAYED:
      updatedPlayer.played = addToZone(updatedPlayer.played);
      break;
    case Zone.DISCARD:
      updatedPlayer.discard = addToZone(updatedPlayer.discard);
      break;
  }

  return updatedPlayer;
}

export function setupPlayerDeck(
  player: Player,
  deckComposition: Record<string, number>,
  cardDefinitions: CardDefinition[]
): { player: Player; success: boolean } {
  const cardDefMap = new Map(cardDefinitions.map((def) => [def.uid, def]));
  let updatedPlayer = { ...player };

  for (const [cardDefUid, count] of Object.entries(deckComposition)) {
    const cardDef = cardDefMap.get(cardDefUid);
    if (!cardDef) {
      return { player, success: false };
    }

    for (let i = 0; i < count; i++) {
      const cardInstance = createCardInstance(cardDef);
      updatedPlayer = registerCardToPlayer(
        updatedPlayer,
        cardInstance,
        Zone.DECK
      );
    }
  }

  return { player: updatedPlayer, success: true };
}

export function registerCardToPlayer(
  player: Player,
  card: CardInstance,
  initialZone: Zone = Zone.DISCARD
): Player {
  const ownedCard = {
    ...card,
    ownerId: player.playerId,
    zone: initialZone,
  };

  const updatedPlayer = {
    ...player,
    allCards: [...player.allCards, ownedCard],
  };

  switch (initialZone) {
    case Zone.DECK:
      return { ...updatedPlayer, deck: [...player.deck, ownedCard] };
    case Zone.HAND:
      return { ...updatedPlayer, hand: [...player.hand, ownedCard] };
    case Zone.PLAYED:
      return { ...updatedPlayer, played: [...player.played, ownedCard] };
    case Zone.DISCARD:
      return { ...updatedPlayer, discard: [...player.discard, ownedCard] };
    default:
      return updatedPlayer;
  }
}
