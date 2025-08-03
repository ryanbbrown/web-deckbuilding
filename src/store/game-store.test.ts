import { describe, it, expect, beforeEach } from 'vitest';
import { createCardDefinition } from '../features/cards/services';
import { createPlayer } from '../features/player/services';
import useGameStore from './game-store';
import useMarketStore from './market-store';
import usePlayerStore from './player-store';

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  describe('initial state', () => {
    it('should start with no game', () => {
      const { game } = useGameStore.getState();
      expect(game).toBe(null);
    });
  });

  describe('createGame', () => {
    it('should create a new game with default values', () => {
      const { createGame, getGame } = useGameStore.getState();

      createGame();
      const game = getGame();

      expect(game).toBeDefined();
      expect(game?.market.catalog).toBeInstanceOf(Array);
      expect(game?.market.catalog.length).toBe(0);
      expect(game?.players).toEqual([]);
      expect(game?.startingDeckComposition).toBe(null);
      expect(game?.startingHandSize).toBe(5);
    });
  });

  describe('setStartingDeckComposition', () => {
    it('should set starting deck composition when game exists', () => {
      const { createGame, setStartingDeckComposition, getGame } =
        useGameStore.getState();
      const composition = { 'card-1': 7, 'card-2': 3 };

      createGame();
      setStartingDeckComposition(composition);

      const game = getGame();
      expect(game?.startingDeckComposition).toEqual(composition);
    });

    it('should not change state when no game exists', () => {
      const { setStartingDeckComposition, getGame } = useGameStore.getState();
      const composition = { 'card-1': 7, 'card-2': 3 };

      setStartingDeckComposition(composition);

      const game = getGame();
      expect(game).toBe(null);
    });
  });

  describe('setStartingHandSize', () => {
    it('should set starting hand size when game exists', () => {
      const { createGame, setStartingHandSize, getGame } =
        useGameStore.getState();

      createGame();
      setStartingHandSize(7);

      const game = getGame();
      expect(game?.startingHandSize).toBe(7);
    });

    it('should not change state when no game exists', () => {
      const { setStartingHandSize, getGame } = useGameStore.getState();

      setStartingHandSize(7);

      const game = getGame();
      expect(game).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset game to null and clear all stores', () => {
      const { createGame, reset, getGame } = useGameStore.getState();

      // Setup some state
      createGame();
      useMarketStore
        .getState()
        .addCardDefinition(createCardDefinition('Test', 'Test'));
      usePlayerStore.getState().addPlayer(createPlayer('Test Player'));

      // Verify state exists
      expect(getGame()).toBeDefined();
      expect(useMarketStore.getState().catalog.length).toBe(1);
      expect(usePlayerStore.getState().getAllPlayers()).toHaveLength(1);

      // Reset
      reset();

      // Verify everything is cleared
      expect(getGame()).toBe(null);
      expect(useMarketStore.getState().catalog.length).toBe(0);
      expect(usePlayerStore.getState().getAllPlayers()).toHaveLength(0);
    });
  });

  describe('addCardToMarket', () => {
    it('should add card to market and sync game state', () => {
      const { createGame, addCardToMarket, getGame } = useGameStore.getState();
      const cardDef = createCardDefinition('Test Card', 'Test text');

      createGame();
      addCardToMarket(cardDef);

      const game = getGame();
      expect(useMarketStore.getState().hasCardDefinition(cardDef)).toBe(true);
      expect(game?.market.catalog.includes(cardDef)).toBe(true);
    });

    it('should not add card when no game exists', () => {
      const { addCardToMarket } = useGameStore.getState();
      const cardDef = createCardDefinition('Test Card', 'Test text');

      addCardToMarket(cardDef);

      expect(useMarketStore.getState().hasCardDefinition(cardDef)).toBe(false);
    });
  });

  describe('addMultipleCardsToMarket', () => {
    it('should add multiple cards to market and sync game state', () => {
      const { createGame, addMultipleCardsToMarket, getGame } =
        useGameStore.getState();
      const cardDef1 = createCardDefinition('Card 1', 'First test card');
      const cardDef2 = createCardDefinition('Card 2', 'Second test card');
      const cardDef3 = createCardDefinition('Card 3', 'Third test card');
      const cards = [cardDef1, cardDef2, cardDef3];

      createGame();
      addMultipleCardsToMarket(cards);

      const game = getGame();

      // Verify all cards are in market store
      expect(useMarketStore.getState().hasCardDefinition(cardDef1)).toBe(true);
      expect(useMarketStore.getState().hasCardDefinition(cardDef2)).toBe(true);
      expect(useMarketStore.getState().hasCardDefinition(cardDef3)).toBe(true);

      // Verify all cards are in game state
      expect(game?.market.catalog.includes(cardDef1)).toBe(true);
      expect(game?.market.catalog.includes(cardDef2)).toBe(true);
      expect(game?.market.catalog.includes(cardDef3)).toBe(true);

      // Verify total count
      expect(game?.market.catalog).toHaveLength(3);
      expect(useMarketStore.getState().catalog).toHaveLength(3);
    });

    it('should add cards to existing market cards', () => {
      const { createGame, addCardToMarket, addMultipleCardsToMarket, getGame } =
        useGameStore.getState();
      const existingCard = createCardDefinition(
        'Existing Card',
        'Already in market'
      );
      const newCard1 = createCardDefinition('New Card 1', 'First new card');
      const newCard2 = createCardDefinition('New Card 2', 'Second new card');

      createGame();
      addCardToMarket(existingCard);
      addMultipleCardsToMarket([newCard1, newCard2]);

      const game = getGame();

      // Verify all cards are present
      expect(game?.market.catalog).toHaveLength(3);
      expect(game?.market.catalog.includes(existingCard)).toBe(true);
      expect(game?.market.catalog.includes(newCard1)).toBe(true);
      expect(game?.market.catalog.includes(newCard2)).toBe(true);
    });

    it('should handle empty array gracefully', () => {
      const { createGame, addMultipleCardsToMarket, getGame } =
        useGameStore.getState();

      createGame();
      const initialGame = getGame();
      const initialCatalogLength = initialGame?.market.catalog.length || 0;

      addMultipleCardsToMarket([]);

      const game = getGame();
      expect(game?.market.catalog).toHaveLength(initialCatalogLength);
    });

    it('should not add cards when no game exists', () => {
      const { addMultipleCardsToMarket } = useGameStore.getState();
      const cardDef1 = createCardDefinition('Test Card 1', 'Test text 1');
      const cardDef2 = createCardDefinition('Test Card 2', 'Test text 2');

      addMultipleCardsToMarket([cardDef1, cardDef2]);

      expect(useMarketStore.getState().hasCardDefinition(cardDef1)).toBe(false);
      expect(useMarketStore.getState().hasCardDefinition(cardDef2)).toBe(false);
      expect(useMarketStore.getState().catalog).toHaveLength(0);
    });
  });

  describe('addPlayerToGame', () => {
    it('should add player with starting deck when composition is set', () => {
      const {
        createGame,
        setStartingDeckComposition,
        addPlayerToGame,
        getAllPlayers,
      } = useGameStore.getState();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');
      const estateCard = createCardDefinition('Estate', 'Basic victory');

      const composition = {
        [copperCard.uid]: 7,
        [estateCard.uid]: 3,
      };

      createGame();
      setStartingDeckComposition(composition);

      const result = addPlayerToGame(player, [copperCard, estateCard]);

      expect(result).toBe(true);
      expect(getAllPlayers()).toHaveLength(1);

      const addedPlayer = getAllPlayers()[0];
      expect(addedPlayer.name).toBe('Test Player');
      expect(addedPlayer.allCards).toHaveLength(10);
      expect(addedPlayer.deck).toHaveLength(10);
    });

    it('should fail when no starting deck composition is set', () => {
      const { createGame, addPlayerToGame, getAllPlayers } =
        useGameStore.getState();
      const player = createPlayer('Test Player');

      createGame();

      const result = addPlayerToGame(player, []);

      expect(result).toBe(false);
      expect(getAllPlayers()).toHaveLength(0);
    });

    it('should fail when no game exists', () => {
      const { addPlayerToGame } = useGameStore.getState();
      const player = createPlayer('Test Player');

      const result = addPlayerToGame(player, []);

      expect(result).toBe(false);
    });

    it('should fail when card definition not found', () => {
      const {
        createGame,
        setStartingDeckComposition,
        addPlayerToGame,
        getAllPlayers,
      } = useGameStore.getState();
      const player = createPlayer('Test Player');
      const copperCard = createCardDefinition('Copper', 'Basic treasure');

      const composition = { 'missing-card-uid': 7 };

      createGame();
      setStartingDeckComposition(composition);

      const result = addPlayerToGame(player, [copperCard]);

      expect(result).toBe(false);
      expect(getAllPlayers()).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    describe('getGame', () => {
      it('should return null when no game exists', () => {
        const { getGame } = useGameStore.getState();
        expect(getGame()).toBe(null);
      });

      it('should return game when it exists', () => {
        const { createGame, getGame } = useGameStore.getState();

        createGame();
        const game = getGame();

        expect(game).toBeDefined();
        expect(game?.startingHandSize).toBe(5);
      });
    });

    describe('getPlayer', () => {
      it('should return null when player does not exist', () => {
        const { getPlayer } = useGameStore.getState();
        expect(getPlayer('non-existent-id')).toBe(null);
      });

      it('should return player when it exists', () => {
        const {
          createGame,
          setStartingDeckComposition,
          addPlayerToGame,
          getPlayer,
        } = useGameStore.getState();
        const player = createPlayer('Test Player');
        const copperCard = createCardDefinition('Copper', 'Basic treasure');

        const composition = { [copperCard.uid]: 7 };

        createGame();
        setStartingDeckComposition(composition);
        addPlayerToGame(player, [copperCard]);

        const retrievedPlayer = getPlayer(player.playerId);
        expect(retrievedPlayer).toBeDefined();
        expect(retrievedPlayer?.name).toBe('Test Player');
      });
    });

    describe('getAllPlayers', () => {
      it('should return empty array when no players exist', () => {
        const { getAllPlayers } = useGameStore.getState();
        expect(getAllPlayers()).toEqual([]);
      });

      it('should return all players when they exist', () => {
        const {
          createGame,
          setStartingDeckComposition,
          addPlayerToGame,
          getAllPlayers,
        } = useGameStore.getState();
        const player1 = createPlayer('Player 1');
        const player2 = createPlayer('Player 2');
        const copperCard = createCardDefinition('Copper', 'Basic treasure');

        const composition = { [copperCard.uid]: 7 };

        createGame();
        setStartingDeckComposition(composition);
        addPlayerToGame(player1, [copperCard]);
        addPlayerToGame(player2, [copperCard]);

        const players = getAllPlayers();
        expect(players).toHaveLength(2);
        expect(players.map((p) => p.name)).toContain('Player 1');
        expect(players.map((p) => p.name)).toContain('Player 2');
      });
    });
  });
});
