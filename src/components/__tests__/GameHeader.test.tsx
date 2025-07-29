import { render, screen } from '@testing-library/react';
import { GameHeader } from '../GameHeader';
import { Game } from '@/features/game/types';

describe('GameHeader Component', () => {
  const mockGame: Game = {
    startingHandSize: 5,
    startingDeckComposition: {
      'card-1': 3,
      'card-2': 2,
      'card-3': 1,
    },
    players: [],
    market: { catalog: new Set() },
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

  describe('component structure and styling', () => {
    it('has correct wrapper styling', () => {
      const { container } = render(
        <GameHeader game={mockGame} playersCount={2} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('mb-6');
    });

    it('has properly styled main heading', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass(
        'text-3xl',
        'font-bold',
        'text-gray-900',
        'mb-2'
      );
    });

    it('displays status text with correct styling', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      const statusText = screen.getByText('Game initialized with 2 players');
      expect(statusText).toHaveClass('text-gray-600');
    });

    it('displays deck info with success styling', () => {
      render(<GameHeader game={mockGame} playersCount={2} />);
      const deckInfo = screen.getByText('Starting deck set: 6 cards');
      expect(deckInfo).toHaveClass('text-sm', 'text-green-600', 'mt-1');
    });
  });
});
