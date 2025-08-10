import { describe, it, expect } from 'vitest';
import { createCardDefinition, createCardInstance } from '../../cards/services';
import { Zone } from '../../cards/types';
import {
  createPlayer,
  shuffleDeck,
  drawCard,
  drawHand,
  playCard,
  discardCard,
  discardAllInPlay,
  discardAllInHand,
  discardAll,
  trashCard,
  moveCardBetweenZones,
  registerCardToPlayer,
  incrementCoins,
  decrementCoins,
} from '../services';

describe('Player Service', () => {
  describe('createPlayer', () => {
    it('should create a player with default values', () => {
      const player = createPlayer('Test Player');

      expect(player.name).toBe('Test Player');
      expect(player.playerId).toBeDefined();
      expect(typeof player.playerId).toBe('string');
      expect(player.coins).toBe(0);
      expect(player.allCards).toEqual([]);
      expect(player.deck).toEqual([]);
      expect(player.hand).toEqual([]);
      expect(player.played).toEqual([]);
      expect(player.discard).toEqual([]);
    });

    it('should generate unique player IDs', () => {
      const player1 = createPlayer('Player 1');
      const player2 = createPlayer('Player 2');

      expect(player1.playerId).not.toBe(player2.playerId);
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      let player = createPlayer('Test Player');
      const cardDefs = Array.from({ length: 10 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      }

      const originalOrder = player.deck.map((c) => c.definition.name);
      const shuffledPlayer = shuffleDeck(player);
      const shuffledOrder = shuffledPlayer.deck.map((c) => c.definition.name);

      expect(shuffledPlayer.deck).toHaveLength(10);
      expect(shuffledOrder).not.toEqual(originalOrder);
    });

    it('should not mutate the original player', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const shuffledPlayer = shuffleDeck(player);

      expect(shuffledPlayer).not.toBe(player);
      expect(shuffledPlayer.deck).not.toBe(player.deck);
    });
  });

  describe('drawCard', () => {
    it('should draw a card from deck to hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = drawCard(player);

      expect(result.drawnCard).not.toBeNull();
      expect(result.drawnCard?.zone).toBe(Zone.HAND);
      expect(result.player.deck).toHaveLength(0);
      expect(result.player.hand).toHaveLength(1);
    });

    it('should return null when no cards available', () => {
      const player = createPlayer('Test Player');

      const result = drawCard(player);

      expect(result.drawnCard).toBeNull();
      expect(result.player).toBe(player);
    });

    it('should shuffle discard into deck when deck is empty', () => {
      let player = createPlayer('Test Player');
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const cardInstance1 = createCardInstance(cardDef1);
      const cardInstance2 = createCardInstance(cardDef2);

      player = registerCardToPlayer(player, cardInstance1, Zone.DISCARD);
      player = registerCardToPlayer(player, cardInstance2, Zone.DISCARD);

      const result = drawCard(player);

      expect(result.drawnCard).not.toBeNull();
      expect(result.player.deck).toHaveLength(1);
      expect(result.player.hand).toHaveLength(1);
      expect(result.player.discard).toHaveLength(0);
    });
  });

  describe('drawHand', () => {
    it('should discard current hand and played cards, then draw new hand', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 7 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (let i = 0; i < 3; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      }

      for (let i = 3; i < 5; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      }

      for (let i = 5; i < 7; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      }

      const result = drawHand(player, 5);

      expect(result.player.hand).toHaveLength(5);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(0);
      expect(result.player.deck).toHaveLength(2);
      expect(result.drawnCards).toHaveLength(5);
    });
  });

  describe('playCard', () => {
    it('should move a card from hand to played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const result = playCard(player, player.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.played).toHaveLength(1);
      expect(result.player.played[0].zone).toBe(Zone.PLAYED);
    });

    it('should return false if card not in hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = playCard(player, player.deck[0]);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });
  });

  describe('discardCard', () => {
    it('should discard a card from hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const result = discardCard(player, player.hand[0]);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should discard a card from played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      const result = discardCard(player, player.played[0], Zone.PLAYED);

      expect(result.success).toBe(true);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(1);
    });

    it('should return false for invalid zones', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = discardCard(player, player.deck[0], Zone.DECK);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });
  });

  describe('discardAllInPlay', () => {
    it('should discard all cards from played area', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      }

      const updatedPlayer = discardAllInPlay(player);

      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(3);
    });

    it('should handle empty played area', () => {
      const player = createPlayer('Test Player');

      const updatedPlayer = discardAllInPlay(player);

      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(0);
    });
  });

  describe('discardAllInHand', () => {
    it('should discard all cards from hand', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 3 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      }

      const updatedPlayer = discardAllInHand(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(3);
    });

    it('should handle empty hand', () => {
      const player = createPlayer('Test Player');

      const updatedPlayer = discardAllInHand(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(0);
    });
  });

  describe('discardAll', () => {
    it('should discard all cards from both hand and played area', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 5 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (let i = 0; i < 3; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      }

      for (let i = 3; i < 5; i++) {
        const cardInstance = createCardInstance(cardDefs[i]);
        player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      }

      const updatedPlayer = discardAll(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(5);
    });

    it('should handle empty hand and played area', () => {
      const player = createPlayer('Test Player');

      const updatedPlayer = discardAll(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(0);
    });

    it('should handle only cards in hand', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 2 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      }

      const updatedPlayer = discardAll(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(2);
    });

    it('should handle only cards in played area', () => {
      let player = createPlayer('Test Player');

      const cardDefs = Array.from({ length: 2 }, (_, i) =>
        createCardDefinition(`Card ${i}`, `Text ${i}`)
      );

      for (const cardDef of cardDefs) {
        const cardInstance = createCardInstance(cardDef);
        player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      }

      const updatedPlayer = discardAll(player);

      expect(updatedPlayer.hand).toHaveLength(0);
      expect(updatedPlayer.played).toHaveLength(0);
      expect(updatedPlayer.discard).toHaveLength(2);
    });
  });

  describe('trashCard', () => {
    it('should completely remove a card from hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const result = trashCard(player, player.hand[0], Zone.HAND);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(0);
      expect(result.player.allCards).toHaveLength(0);
      expect(result.player.deck).toHaveLength(0);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.discard).toHaveLength(0);
    });

    it('should completely remove a card from played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      const result = trashCard(player, player.played[0], Zone.PLAYED);

      expect(result.success).toBe(true);
      expect(result.player.played).toHaveLength(0);
      expect(result.player.allCards).toHaveLength(0);
    });

    it('should return false when trying to trash from deck', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = trashCard(player, player.deck[0], Zone.DECK);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
      expect(result.player.deck).toHaveLength(1);
      expect(result.player.allCards).toHaveLength(1);
    });

    it('should completely remove a card from discard pile', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DISCARD);
      const result = trashCard(player, player.discard[0], Zone.DISCARD);

      expect(result.success).toBe(true);
      expect(result.player.discard).toHaveLength(0);
      expect(result.player.allCards).toHaveLength(0);
    });

    it('should return false if card not in specified zone', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = trashCard(player, player.deck[0], Zone.HAND);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });

    it('should return false when trying to trash from market zone', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = trashCard(player, cardInstance, Zone.MARKET);

      expect(result.success).toBe(false);
      expect(result.player).toBe(player);
    });

    it('should preserve other cards when trashing one card', () => {
      let player = createPlayer('Test Player');
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const cardInstance1 = createCardInstance(cardDef1);
      const cardInstance2 = createCardInstance(cardDef2);

      player = registerCardToPlayer(player, cardInstance1, Zone.HAND);
      player = registerCardToPlayer(player, cardInstance2, Zone.HAND);

      const result = trashCard(player, player.hand[0], Zone.HAND);

      expect(result.success).toBe(true);
      expect(result.player.hand).toHaveLength(1);
      expect(result.player.allCards).toHaveLength(1);
      expect(result.player.hand[0].definition.name).toBe('Card 2');
    });
  });

  describe('moveCardBetweenZones', () => {
    it('should move a card from deck to hand', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DECK);
      const result = moveCardBetweenZones(
        player,
        player.deck[0],
        Zone.DECK,
        Zone.HAND
      );

      expect(result.deck).toHaveLength(0);
      expect(result.hand).toHaveLength(1);
      expect(result.hand[0].zone).toBe(Zone.HAND);
      expect(result.allCards).toHaveLength(1);
      expect(result.allCards[0].zone).toBe(Zone.HAND);
    });

    it('should move a card from hand to played area', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const result = moveCardBetweenZones(
        player,
        player.hand[0],
        Zone.HAND,
        Zone.PLAYED
      );

      expect(result.hand).toHaveLength(0);
      expect(result.played).toHaveLength(1);
      expect(result.played[0].zone).toBe(Zone.PLAYED);
    });

    it('should move a card from played to discard', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.PLAYED);
      const result = moveCardBetweenZones(
        player,
        player.played[0],
        Zone.PLAYED,
        Zone.DISCARD
      );

      expect(result.played).toHaveLength(0);
      expect(result.discard).toHaveLength(1);
      expect(result.discard[0].zone).toBe(Zone.DISCARD);
    });

    it('should move a card from discard to deck', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.DISCARD);
      const result = moveCardBetweenZones(
        player,
        player.discard[0],
        Zone.DISCARD,
        Zone.DECK
      );

      expect(result.discard).toHaveLength(0);
      expect(result.deck).toHaveLength(1);
      expect(result.deck[0].zone).toBe(Zone.DECK);
    });

    it('should update allCards zone when moving between zones', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const originalCardId = player.hand[0].instanceId;

      const result = moveCardBetweenZones(
        player,
        player.hand[0],
        Zone.HAND,
        Zone.PLAYED
      );
      const movedCard = result.allCards.find(
        (c) => c.instanceId === originalCardId
      );

      expect(movedCard?.zone).toBe(Zone.PLAYED);
    });

    it('should not mutate the original player', () => {
      let player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      player = registerCardToPlayer(player, cardInstance, Zone.HAND);
      const result = moveCardBetweenZones(
        player,
        player.hand[0],
        Zone.HAND,
        Zone.PLAYED
      );

      expect(result).not.toBe(player);
      expect(result.hand).not.toBe(player.hand);
      expect(result.played).not.toBe(player.played);
    });
  });

  describe('registerCardToPlayer', () => {
    it('should add a card to discard by default', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance);

      expect(result.discard).toHaveLength(1);
      expect(result.allCards).toHaveLength(1);
      expect(result.discard[0].ownerId).toBe(player.playerId);
      expect(result.discard[0].zone).toBe(Zone.DISCARD);
    });

    it('should add a card to the specified zone', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance, Zone.HAND);

      expect(result.hand).toHaveLength(1);
      expect(result.allCards).toHaveLength(1);
      expect(result.hand[0].ownerId).toBe(player.playerId);
      expect(result.hand[0].zone).toBe(Zone.HAND);
    });

    it('should add a card to the deck when specified', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance, Zone.DECK);

      expect(result.deck).toHaveLength(1);
      expect(result.allCards).toHaveLength(1);
      expect(result.deck[0].ownerId).toBe(player.playerId);
      expect(result.deck[0].zone).toBe(Zone.DECK);
    });

    it('should add a card to the played area when specified', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance, Zone.PLAYED);

      expect(result.played).toHaveLength(1);
      expect(result.allCards).toHaveLength(1);
      expect(result.played[0].ownerId).toBe(player.playerId);
      expect(result.played[0].zone).toBe(Zone.PLAYED);
    });

    it('should set the card owner ID', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance, Zone.HAND);

      expect(result.hand[0].ownerId).toBe(player.playerId);
      expect(result.allCards[0].ownerId).toBe(player.playerId);
    });

    it('should not mutate the original player', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);

      const result = registerCardToPlayer(player, cardInstance, Zone.HAND);

      expect(result).not.toBe(player);
      expect(result.hand).not.toBe(player.hand);
      expect(result.allCards).not.toBe(player.allCards);
    });

    it('should handle multiple cards in the same zone', () => {
      let player = createPlayer('Test Player');
      const cardDef1 = createCardDefinition('Card 1', 'Text 1');
      const cardDef2 = createCardDefinition('Card 2', 'Text 2');
      const cardInstance1 = createCardInstance(cardDef1);
      const cardInstance2 = createCardInstance(cardDef2);

      player = registerCardToPlayer(player, cardInstance1, Zone.HAND);
      player = registerCardToPlayer(player, cardInstance2, Zone.HAND);

      expect(player.hand).toHaveLength(2);
      expect(player.allCards).toHaveLength(2);
      expect(player.hand[0].definition.name).toBe('Card 1');
      expect(player.hand[1].definition.name).toBe('Card 2');
    });
  });

  describe('Coin Management', () => {
    describe('incrementCoins', () => {
      it('should increment coins by 1 by default', () => {
        const player = createPlayer('Test Player');

        const updatedPlayer = incrementCoins(player);

        expect(updatedPlayer.coins).toBe(1);
        expect(player.coins).toBe(0); // original should be unchanged
      });

      it('should increment coins by specified amount', () => {
        const player = createPlayer('Test Player');

        const updatedPlayer = incrementCoins(player, 5);

        expect(updatedPlayer.coins).toBe(5);
      });

      it('should handle incrementing from a non-zero amount', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 10 };

        const updatedPlayer = incrementCoins(player, 3);

        expect(updatedPlayer.coins).toBe(13);
      });

      it('should handle negative increment amounts', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 5 };

        const updatedPlayer = incrementCoins(player, -2);

        expect(updatedPlayer.coins).toBe(3);
      });

      it('should preserve all other player properties', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const playerWithCard = registerCardToPlayer(
          player,
          cardInstance,
          Zone.HAND
        );

        const updatedPlayer = incrementCoins(playerWithCard, 2);

        expect(updatedPlayer.name).toBe(playerWithCard.name);
        expect(updatedPlayer.playerId).toBe(playerWithCard.playerId);
        expect(updatedPlayer.hand).toEqual(playerWithCard.hand);
        expect(updatedPlayer.allCards).toEqual(playerWithCard.allCards);
        expect(updatedPlayer.coins).toBe(2);
      });
    });

    describe('decrementCoins', () => {
      it('should decrement coins by 1 by default', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 5 };

        const updatedPlayer = decrementCoins(player);

        expect(updatedPlayer.coins).toBe(4);
        expect(player.coins).toBe(5); // original should be unchanged
      });

      it('should decrement coins by specified amount', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 10 };

        const updatedPlayer = decrementCoins(player, 3);

        expect(updatedPlayer.coins).toBe(7);
      });

      it('should allow coins to go negative', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 2 };

        const updatedPlayer = decrementCoins(player, 5);

        expect(updatedPlayer.coins).toBe(-3);
      });

      it('should decrement from zero to negative', () => {
        const player = createPlayer('Test Player');

        const updatedPlayer = decrementCoins(player, 2);

        expect(updatedPlayer.coins).toBe(-2);
      });

      it('should handle negative decrement amounts (effectively increment)', () => {
        let player = createPlayer('Test Player');
        player = { ...player, coins: 5 };

        const updatedPlayer = decrementCoins(player, -3);

        expect(updatedPlayer.coins).toBe(8);
      });

      it('should preserve all other player properties', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const playerWithCard = registerCardToPlayer(
          player,
          cardInstance,
          Zone.HAND
        );
        const playerWithCoins = { ...playerWithCard, coins: 10 };

        const updatedPlayer = decrementCoins(playerWithCoins, 3);

        expect(updatedPlayer.name).toBe(playerWithCoins.name);
        expect(updatedPlayer.playerId).toBe(playerWithCoins.playerId);
        expect(updatedPlayer.hand).toEqual(playerWithCoins.hand);
        expect(updatedPlayer.allCards).toEqual(playerWithCoins.allCards);
        expect(updatedPlayer.coins).toBe(7);
      });
    });
  });
});
