import { CardInstance, Zone } from '../../cards/types';
import { Player } from '../types';
import { moveCardToZone } from '../../cards/services';

export function createPlayer(name: string): Player {
  return {
    name,
    playerId: crypto.randomUUID(),
    coins: 0,
    turns: 1,
    allCards: [],
    deck: [],
    hand: [],
    played: [],
    discard: [],
  };
}

export function shuffleDeck(player: Player): Player {
  const shuffledDeck = [...player.deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  return {
    ...player,
    deck: shuffledDeck,
  };
}

export function drawCard(player: Player): {
  player: Player;
  drawnCard: CardInstance | null;
} {
  let updatedPlayer = player;

  if (updatedPlayer.deck.length === 0 && updatedPlayer.discard.length > 0) {
    while (updatedPlayer.discard.length > 0) {
      const card = updatedPlayer.discard[updatedPlayer.discard.length - 1];
      updatedPlayer = moveCardBetweenZones(
        updatedPlayer,
        card,
        Zone.DISCARD,
        Zone.DECK
      );
    }
    updatedPlayer = shuffleDeck(updatedPlayer);
  }

  if (updatedPlayer.deck.length > 0) {
    const card = updatedPlayer.deck[updatedPlayer.deck.length - 1];
    updatedPlayer = moveCardBetweenZones(
      updatedPlayer,
      card,
      Zone.DECK,
      Zone.HAND
    );
    const drawnCard = updatedPlayer.hand[updatedPlayer.hand.length - 1];
    return { player: updatedPlayer, drawnCard };
  }

  return { player: updatedPlayer, drawnCard: null };
}

export function drawHand(
  player: Player,
  handSize: number
): { player: Player; drawnCards: CardInstance[] } {
  let updatedPlayer = discardAllInPlay(player);
  updatedPlayer = discardAllInHand(updatedPlayer);

  const drawnCards: CardInstance[] = [];
  for (let i = 0; i < handSize; i++) {
    const result = drawCard(updatedPlayer);
    updatedPlayer = result.player;
    if (result.drawnCard) {
      drawnCards.push(result.drawnCard);
    } else {
      break;
    }
  }

  // Auto-increment turns every time hand is drawn
  updatedPlayer = incrementTurns(updatedPlayer);

  return { player: updatedPlayer, drawnCards };
}

export function playCard(
  player: Player,
  card: CardInstance
): { player: Player; success: boolean } {
  if (player.hand.some((c) => c.instanceId === card.instanceId)) {
    const updatedPlayer = moveCardBetweenZones(
      player,
      card,
      Zone.HAND,
      Zone.PLAYED
    );
    return { player: updatedPlayer, success: true };
  }
  return { player, success: false };
}

export function discardCard(
  player: Player,
  card: CardInstance,
  fromZone: Zone = Zone.HAND
): { player: Player; success: boolean } {
  if (fromZone !== Zone.HAND && fromZone !== Zone.PLAYED) {
    return { player, success: false };
  }

  const zoneCards = fromZone === Zone.HAND ? player.hand : player.played;
  if (zoneCards.some((c) => c.instanceId === card.instanceId)) {
    const updatedPlayer = moveCardBetweenZones(
      player,
      card,
      fromZone,
      Zone.DISCARD
    );
    return { player: updatedPlayer, success: true };
  }
  return { player, success: false };
}

export function discardAllInPlay(player: Player): Player {
  let updatedPlayer = player;
  const playedCards = [...player.played];

  for (const card of playedCards) {
    updatedPlayer = moveCardBetweenZones(
      updatedPlayer,
      card,
      Zone.PLAYED,
      Zone.DISCARD
    );
  }

  return updatedPlayer;
}

export function discardAllInHand(player: Player): Player {
  let updatedPlayer = player;
  const handCards = [...player.hand];

  for (const card of handCards) {
    updatedPlayer = moveCardBetweenZones(
      updatedPlayer,
      card,
      Zone.HAND,
      Zone.DISCARD
    );
  }

  return updatedPlayer;
}

export function discardAll(player: Player): Player {
  let updatedPlayer = discardAllInPlay(player);
  updatedPlayer = discardAllInHand(updatedPlayer);
  return updatedPlayer;
}

export function trashCard(
  player: Player,
  card: CardInstance,
  fromZone: Zone
): { player: Player; success: boolean } {
  // Cards can only be trashed from hand, played area, or discard pile
  if (fromZone === Zone.DECK || fromZone === Zone.MARKET) {
    return { player, success: false };
  }

  // Get the zone cards based on fromZone
  let zoneCards: CardInstance[];
  switch (fromZone) {
    case Zone.HAND:
      zoneCards = player.hand;
      break;
    case Zone.PLAYED:
      zoneCards = player.played;
      break;
    case Zone.DISCARD:
      zoneCards = player.discard;
      break;
    default:
      return { player, success: false };
  }

  // Check if card exists in the specified zone
  if (!zoneCards.some((c) => c.instanceId === card.instanceId)) {
    return { player, success: false };
  }

  // Remove card from player entirely
  const removeFromZone = (cards: CardInstance[]): CardInstance[] =>
    cards.filter((c) => c.instanceId !== card.instanceId);

  let updatedPlayer = {
    ...player,
    allCards: player.allCards.filter((c) => c.instanceId !== card.instanceId),
  };

  // Remove from source zone
  switch (fromZone) {
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

  return { player: updatedPlayer, success: true };
}

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

export function incrementCoins(player: Player, amount: number = 1): Player {
  return {
    ...player,
    coins: player.coins + amount,
  };
}

export function decrementCoins(player: Player, amount: number = 1): Player {
  return {
    ...player,
    coins: player.coins - amount,
  };
}

export function incrementTurns(player: Player): Player {
  return {
    ...player,
    turns: player.turns + 1,
  };
}
