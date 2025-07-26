import { CardInstance, Zone } from '../../cards/types';
import { setCardOwner, moveCardToZone } from '../../cards/services';
import { Player } from '../types';

export function createPlayer(name: string): Player {
  return {
    name,
    playerId: crypto.randomUUID(),
    allCards: [],
    deck: [],
    hand: [],
    played: [],
    discard: [],
  };
}

export function registerCard(
  player: Player,
  card: CardInstance,
  initialZone: Zone = Zone.DISCARD
): Player {
  const ownedCard = setCardOwner(card, player.playerId);
  const zonedCard = moveCardToZone(ownedCard, initialZone);

  const updatedPlayer = {
    ...player,
    allCards: [...player.allCards, zonedCard],
  };

  switch (initialZone) {
    case Zone.DECK:
      return { ...updatedPlayer, deck: [...player.deck, zonedCard] };
    case Zone.HAND:
      return { ...updatedPlayer, hand: [...player.hand, zonedCard] };
    case Zone.PLAYED:
      return { ...updatedPlayer, played: [...player.played, zonedCard] };
    case Zone.DISCARD:
      return { ...updatedPlayer, discard: [...player.discard, zonedCard] };
    default:
      return updatedPlayer;
  }
}

function moveCardBetweenZones(
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
