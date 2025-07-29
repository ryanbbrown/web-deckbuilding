import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCardDefinition,
  createCardInstance,
} from '../features/cards/services';
import { createPlayer } from '../features/player/services';
import { Zone } from '../features/cards/types';
import usePlayerStore from './player-store';

describe('Player Store', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
  });

  describe('CRUD operations', () => {
    describe('addPlayer', () => {
      it('should add a player to the store', () => {
        const player = createPlayer('Test Player');
        const { addPlayer, getPlayer } = usePlayerStore.getState();

        addPlayer(player);

        const retrievedPlayer = getPlayer(player.playerId);
        expect(retrievedPlayer).toEqual(player);
      });

      it('should handle multiple players', () => {
        const player1 = createPlayer('Player 1');
        const player2 = createPlayer('Player 2');
        const { addPlayer, getAllPlayers } = usePlayerStore.getState();

        addPlayer(player1);
        addPlayer(player2);

        const allPlayers = getAllPlayers();
        expect(allPlayers).toHaveLength(2);
        expect(allPlayers).toContain(player1);
        expect(allPlayers).toContain(player2);
      });
    });

    describe('updatePlayer', () => {
      it('should update a player in the store', () => {
        const player = createPlayer('Test Player');
        const { addPlayer, updatePlayer, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        updatePlayer(player.playerId, { name: 'Updated Name' });

        const updatedPlayer = getPlayer(player.playerId);
        expect(updatedPlayer?.name).toBe('Updated Name');
        expect(updatedPlayer?.playerId).toBe(player.playerId);
      });

      it('should handle non-existent player gracefully', () => {
        const { updatePlayer, getAllPlayers } = usePlayerStore.getState();

        updatePlayer('non-existent', { name: 'Test' });

        expect(getAllPlayers()).toHaveLength(0);
      });
    });

    describe('removePlayer', () => {
      it('should remove a player from the store', () => {
        const player = createPlayer('Test Player');
        const { addPlayer, removePlayer, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        expect(getPlayer(player.playerId)).toBeDefined();

        removePlayer(player.playerId);
        expect(getPlayer(player.playerId)).toBeUndefined();
      });
    });

    describe('reset', () => {
      it('should clear all players', () => {
        const player1 = createPlayer('Player 1');
        const player2 = createPlayer('Player 2');
        const { addPlayer, reset, getAllPlayers } = usePlayerStore.getState();

        addPlayer(player1);
        addPlayer(player2);
        expect(getAllPlayers()).toHaveLength(2);

        reset();
        expect(getAllPlayers()).toHaveLength(0);
      });
    });
  });

  describe('registerCard', () => {
    it('should register a card to the discard pile by default', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      const { addPlayer, registerCard, getPlayer } = usePlayerStore.getState();

      addPlayer(player);
      registerCard(player.playerId, cardInstance);

      const updatedPlayer = getPlayer(player.playerId)!;
      expect(updatedPlayer.allCards).toHaveLength(1);
      expect(updatedPlayer.discard).toHaveLength(1);
      expect(updatedPlayer.discard[0].ownerId).toBe(player.playerId);
      expect(updatedPlayer.discard[0].zone).toBe(Zone.DISCARD);
    });

    it('should register a card to a specific zone', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      const { addPlayer, registerCard, getPlayer } = usePlayerStore.getState();

      addPlayer(player);
      registerCard(player.playerId, cardInstance, Zone.DECK);

      const updatedPlayer = getPlayer(player.playerId)!;
      expect(updatedPlayer.deck).toHaveLength(1);
      expect(updatedPlayer.deck[0].zone).toBe(Zone.DECK);
      expect(updatedPlayer.discard).toHaveLength(0);
    });

    it('should handle non-existent player gracefully', () => {
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      const { registerCard, getAllPlayers } = usePlayerStore.getState();

      registerCard('non-existent', cardInstance);

      expect(getAllPlayers()).toHaveLength(0);
    });
  });

  describe('moveCardBetweenZones', () => {
    it('should move a card between zones', () => {
      const player = createPlayer('Test Player');
      const cardDef = createCardDefinition('Test Card', 'Test text');
      const cardInstance = createCardInstance(cardDef);
      const { addPlayer, registerCard, moveCardBetweenZones, getPlayer } =
        usePlayerStore.getState();

      addPlayer(player);
      registerCard(player.playerId, cardInstance, Zone.DECK);

      const updatedPlayer = getPlayer(player.playerId)!;
      const card = updatedPlayer.deck[0];

      moveCardBetweenZones(player.playerId, card, Zone.DECK, Zone.HAND);

      const finalPlayer = getPlayer(player.playerId)!;
      expect(finalPlayer.deck).toHaveLength(0);
      expect(finalPlayer.hand).toHaveLength(1);
      expect(finalPlayer.hand[0].zone).toBe(Zone.HAND);
    });
  });

  describe('wrapper actions', () => {
    describe('drawPlayerCard', () => {
      it('should draw a card from deck to hand', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, drawPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.DECK);

        const result = drawPlayerCard(player.playerId);

        expect(result.drawnCard).not.toBeNull();
        expect(result.drawnCard?.zone).toBe(Zone.HAND);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.deck).toHaveLength(0);
        expect(updatedPlayer.hand).toHaveLength(1);
      });

      it('should return null for non-existent player', () => {
        const { drawPlayerCard } = usePlayerStore.getState();

        const result = drawPlayerCard('non-existent');

        expect(result.drawnCard).toBeNull();
      });
    });

    describe('playPlayerCard', () => {
      it('should move a card from hand to played area', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, playPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.HAND);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.hand[0];

        const success = playPlayerCard(player.playerId, card);

        expect(success).toBe(true);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.hand).toHaveLength(0);
        expect(updatedPlayer.played).toHaveLength(1);
        expect(updatedPlayer.played[0].zone).toBe(Zone.PLAYED);
      });

      it('should return false for non-existent player', () => {
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { playPlayerCard } = usePlayerStore.getState();

        const success = playPlayerCard('non-existent', cardInstance);

        expect(success).toBe(false);
      });
    });

    describe('discardPlayerCard', () => {
      it('should discard a card from hand', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, discardPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.HAND);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.hand[0];

        const success = discardPlayerCard(player.playerId, card);

        expect(success).toBe(true);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.hand).toHaveLength(0);
        expect(updatedPlayer.discard).toHaveLength(1);
      });

      it('should return false for non-existent player', () => {
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { discardPlayerCard } = usePlayerStore.getState();

        const success = discardPlayerCard('non-existent', cardInstance);

        expect(success).toBe(false);
      });
    });

    describe('discardAllPlayerInPlay', () => {
      it('should discard all cards from played area', () => {
        const player = createPlayer('Test Player');
        const cardDefs = Array.from({ length: 3 }, (_, i) =>
          createCardDefinition(`Card ${i}`, `Text ${i}`)
        );
        const { addPlayer, registerCard, discardAllPlayerInPlay, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);

        for (const cardDef of cardDefs) {
          const cardInstance = createCardInstance(cardDef);
          registerCard(player.playerId, cardInstance, Zone.PLAYED);
        }

        discardAllPlayerInPlay(player.playerId);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.played).toHaveLength(0);
        expect(updatedPlayer.discard).toHaveLength(3);
      });
    });

    describe('discardAllPlayerInHand', () => {
      it('should discard all cards from hand', () => {
        const player = createPlayer('Test Player');
        const cardDefs = Array.from({ length: 3 }, (_, i) =>
          createCardDefinition(`Card ${i}`, `Text ${i}`)
        );
        const { addPlayer, registerCard, discardAllPlayerInHand, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);

        for (const cardDef of cardDefs) {
          const cardInstance = createCardInstance(cardDef);
          registerCard(player.playerId, cardInstance, Zone.HAND);
        }

        discardAllPlayerInHand(player.playerId);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.hand).toHaveLength(0);
        expect(updatedPlayer.discard).toHaveLength(3);
      });
    });

    describe('shufflePlayerDeck', () => {
      it('should shuffle the player deck', () => {
        const player = createPlayer('Test Player');
        const cardDefs = Array.from({ length: 10 }, (_, i) =>
          createCardDefinition(`Card ${i}`, `Text ${i}`)
        );
        const { addPlayer, registerCard, shufflePlayerDeck, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);

        for (const cardDef of cardDefs) {
          const cardInstance = createCardInstance(cardDef);
          registerCard(player.playerId, cardInstance, Zone.DECK);
        }

        const beforeShuffle = getPlayer(player.playerId)!;
        const originalOrder = beforeShuffle.deck.map((c) => c.definition.name);

        shufflePlayerDeck(player.playerId);

        const afterShuffle = getPlayer(player.playerId)!;
        const shuffledOrder = afterShuffle.deck.map((c) => c.definition.name);

        expect(afterShuffle.deck).toHaveLength(10);
        expect(shuffledOrder).not.toEqual(originalOrder);
      });
    });

    describe('trashPlayerCard', () => {
      it('should completely remove a card from hand', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, trashPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.HAND);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.hand[0];

        const success = trashPlayerCard(player.playerId, card, Zone.HAND);

        expect(success).toBe(true);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.hand).toHaveLength(0);
        expect(updatedPlayer.allCards).toHaveLength(0);
      });

      it('should completely remove a card from played area', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, trashPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.PLAYED);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.played[0];

        const success = trashPlayerCard(player.playerId, card, Zone.PLAYED);

        expect(success).toBe(true);

        const updatedPlayer = getPlayer(player.playerId)!;
        expect(updatedPlayer.played).toHaveLength(0);
        expect(updatedPlayer.allCards).toHaveLength(0);
      });

      it('should return false for non-existent player', () => {
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { trashPlayerCard } = usePlayerStore.getState();

        const success = trashPlayerCard(
          'non-existent',
          cardInstance,
          Zone.HAND
        );

        expect(success).toBe(false);
      });

      it('should return false if card not in specified zone', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, trashPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.HAND);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.hand[0];

        const success = trashPlayerCard(player.playerId, card, Zone.PLAYED);

        expect(success).toBe(false);

        const unchangedPlayer = getPlayer(player.playerId)!;
        expect(unchangedPlayer.hand).toHaveLength(1);
        expect(unchangedPlayer.allCards).toHaveLength(1);
      });

      it('should return false when trying to trash from deck', () => {
        const player = createPlayer('Test Player');
        const cardDef = createCardDefinition('Test Card', 'Test text');
        const cardInstance = createCardInstance(cardDef);
        const { addPlayer, registerCard, trashPlayerCard, getPlayer } =
          usePlayerStore.getState();

        addPlayer(player);
        registerCard(player.playerId, cardInstance, Zone.DECK);

        const currentPlayer = getPlayer(player.playerId)!;
        const card = currentPlayer.deck[0];

        const success = trashPlayerCard(player.playerId, card, Zone.DECK);

        expect(success).toBe(false);

        const unchangedPlayer = getPlayer(player.playerId)!;
        expect(unchangedPlayer.deck).toHaveLength(1);
        expect(unchangedPlayer.allCards).toHaveLength(1);
      });
    });
  });
});
