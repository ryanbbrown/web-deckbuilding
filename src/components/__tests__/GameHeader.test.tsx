import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameHeader } from '../GameHeader';
import { Game } from '@/features/game/types';
import useGameStore from '@/store/game-store';
import { vi } from 'vitest';

vi.mock('@/store/game-store');
const mockUseGameStore = vi.mocked(useGameStore);

describe('GameHeader Component', () => {
  const mockReset = vi.fn();
  const mockCreateGame = vi.fn();
  const mockGetState = vi.fn();

  beforeEach(() => {
    mockGetState.mockReturnValue({ createGame: mockCreateGame });
    mockUseGameStore.mockReturnValue({ reset: mockReset });
    Object.assign(mockUseGameStore, { getState: mockGetState });
    mockReset.mockClear();
    mockCreateGame.mockClear();
    mockGetState.mockClear();
  });

  const mockGame: Game = {
    startingHandSize: 5,
    startingDeckComposition: {
      'card-1': 3,
      'card-2': 2,
      'card-3': 1,
    },
    players: [],
    market: { catalog: [] },
  };

  it('renders without crashing with null game', () => {
    render(<GameHeader game={null} playersCount={0} />);
  });

  it('displays the main title', () => {
    render(<GameHeader game={null} playersCount={0} />);
    expect(screen.getByText('Deck Building Game')).toBeInTheDocument();
  });

  describe('when game is null', () => {
    it('shows initializing message', () => {
      render(<GameHeader game={null} playersCount={0} />);
      expect(screen.getByText('Initializing game...')).toBeInTheDocument();
    });

    it('does not show starting deck information', () => {
      render(<GameHeader game={null} playersCount={0} />);
      expect(screen.queryByText(/Starting deck set:/)).not.toBeInTheDocument();
    });

    it('does not show reset button when game is null', () => {
      render(<GameHeader game={null} playersCount={0} />);
      expect(screen.queryByText('Reset Game')).not.toBeInTheDocument();
    });

    it('does not show reset button when game is in initial state', () => {
      const initialGame: Game = {
        startingHandSize: 5,
        startingDeckComposition: null,
        players: [],
        market: { catalog: [] },
      };
      render(<GameHeader game={initialGame} playersCount={0} />);
      expect(screen.queryByText('Reset Game')).not.toBeInTheDocument();
    });
  });

  describe('when game is initialized', () => {
    it('shows game initialized message with player count', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      expect(
        screen.getByText('Game initialized with 2 players')
      ).toBeInTheDocument();
    });

    it('handles zero players correctly', () => {
      render(<GameHeader game={mockGame} playersCount={0} />);
      expect(
        screen.getByText('Game initialized with 0 players')
      ).toBeInTheDocument();
    });

    it('handles single player correctly', () => {
      render(<GameHeader game={mockGame} playersCount={1} />);
      expect(
        screen.getByText('Game initialized with 1 players')
      ).toBeInTheDocument();
    });

    it('shows reset button when game has been modified from initial state', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      expect(screen.getByText('Reset Game')).toBeInTheDocument();
    });
  });

  describe('starting deck composition', () => {
    it('calculates and displays total deck cards correctly', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      // card-1: 3, card-2: 2, card-3: 1 = 6 total
      expect(
        screen.getByText('Starting deck set: 6 cards')
      ).toBeInTheDocument();
    });

    it('does not show deck info when composition is empty', () => {
      const gameWithEmptyDeck: Game = {
        ...mockGame,
        startingDeckComposition: {},
      };
      render(<GameHeader game={gameWithEmptyDeck} playersCount={2} />);
      expect(screen.queryByText(/Starting deck set:/)).not.toBeInTheDocument();
    });

    it('does not show deck info when composition is null', () => {
      const gameWithoutDeck: Game = {
        ...mockGame,
        startingDeckComposition: null,
      };
      render(<GameHeader game={gameWithoutDeck} playersCount={2} />);
      expect(screen.queryByText(/Starting deck set:/)).not.toBeInTheDocument();
    });

    it('handles single card in deck', () => {
      const gameWithSingleCard: Game = {
        ...mockGame,
        startingDeckComposition: { 'single-card': 1 },
      };
      render(<GameHeader game={gameWithSingleCard} playersCount={1} />);
      expect(
        screen.getByText('Starting deck set: 1 cards')
      ).toBeInTheDocument();
    });

    it('handles large deck sizes', () => {
      const gameWithLargeDeck: Game = {
        ...mockGame,
        startingDeckComposition: {
          'card-1': 10,
          'card-2': 15,
          'card-3': 25,
        },
      };
      render(<GameHeader game={gameWithLargeDeck} playersCount={3} />);
      expect(
        screen.getByText('Starting deck set: 50 cards')
      ).toBeInTheDocument();
    });
  });

  describe('Reset button visibility', () => {
    it('shows reset button when players exist', () => {
      const initialGame: Game = {
        startingHandSize: 5,
        startingDeckComposition: null,
        players: [],
        market: { catalog: [] },
      };
      render(<GameHeader game={initialGame} playersCount={1} />);
      expect(screen.getByText('Reset Game')).toBeInTheDocument();
    });

    it('shows reset button when market has cards', () => {
      const gameWithMarket: Game = {
        startingHandSize: 5,
        startingDeckComposition: null,
        players: [],
        market: {
          catalog: [{ name: 'Test Card', text: 'Test', cost: 1, uid: 'test' }],
        },
      };
      render(<GameHeader game={gameWithMarket} playersCount={0} />);
      expect(screen.getByText('Reset Game')).toBeInTheDocument();
    });

    it('shows reset button when deck composition is set', () => {
      const gameWithDeck: Game = {
        startingHandSize: 5,
        startingDeckComposition: { card1: 3 },
        players: [],
        market: { catalog: [] },
      };
      render(<GameHeader game={gameWithDeck} playersCount={0} />);
      expect(screen.getByText('Reset Game')).toBeInTheDocument();
    });

    it('shows reset button when hand size is changed from default', () => {
      const gameWithCustomHandSize: Game = {
        startingHandSize: 7,
        startingDeckComposition: null,
        players: [],
        market: { catalog: [] },
      };
      render(<GameHeader game={gameWithCustomHandSize} playersCount={0} />);
      expect(screen.getByText('Reset Game')).toBeInTheDocument();
    });

    it('does not show reset button initially with default game', () => {
      render(
        <GameHeader
          game={{ ...mockGame, startingDeckComposition: null }}
          playersCount={0}
        />
      );

      expect(screen.queryByText('Reset Game')).not.toBeInTheDocument();
    });
  });

  describe('Reset Game functionality', () => {
    it('opens confirmation modal when reset button is clicked', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);

      fireEvent.click(screen.getByText('Reset Game'));

      expect(screen.getByText('Reset Game?')).toBeInTheDocument();
      expect(
        screen.getByText(/This will permanently delete all players/)
      ).toBeInTheDocument();
    });

    it('closes modal when cancel is clicked', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);

      fireEvent.click(screen.getByText('Reset Game'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Reset Game?')).not.toBeInTheDocument();
    });

    it('calls reset function, creates new game, and closes modal when confirmed', async () => {
      render(<GameHeader game={mockGame} playersCount={2} />);

      fireEvent.click(screen.getByText('Reset Game'));
      fireEvent.click(screen.getAllByText('Reset Game')[1]); // The one in the modal

      expect(mockReset).toHaveBeenCalledTimes(1);
      expect(mockCreateGame).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByText('Reset Game?')).not.toBeInTheDocument();
      });
    });
  });
});
