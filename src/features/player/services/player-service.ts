import { CardInstance, Zone } from '../../cards/types';
import { Player } from '../types';
import { moveCardBetweenZones } from '../../../lib/player-utils';

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
