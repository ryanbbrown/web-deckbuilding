import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CardZone } from '../CardZone';
import { Zone, CardInstance } from '@/features/cards/types';

describe('CardZone Component', () => {
  const mockCardDefinition = {
    name: 'Test Card',
    text: 'Test card description',
    cost: 2,
    uid: 'test-card-1',
  };

  const mockCard: CardInstance = {
    definition: mockCardDefinition,
    ownerId: 'player-1',
    zone: Zone.HAND,
    instanceId: 'instance-1',
  };

  const mockCards: CardInstance[] = [
    mockCard,
    {
      definition: {
        ...mockCardDefinition,
        name: 'Second Card',
        uid: 'test-card-2',
      },
      ownerId: 'player-1',
      zone: Zone.HAND,
      instanceId: 'instance-2',
    },
  ];

  const defaultProps = {
    zone: Zone.HAND,
    cards: [],
    onCardClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CardZone {...defaultProps} />);
  });

  describe('zone headers and configuration', () => {
    it('displays correct title and card count for each zone', () => {
      const testCases = [
        { zone: Zone.DECK, title: 'Deck' },
        { zone: Zone.HAND, title: 'Hand' },
        { zone: Zone.PLAYED, title: 'Play Area' },
        { zone: Zone.DISCARD, title: 'Discard' },
        { zone: Zone.MARKET, title: 'Market' },
      ];

      testCases.forEach(({ zone, title }) => {
        const { unmount } = render(
          <CardZone zone={zone} cards={mockCards} onCardClick={vi.fn()} />
        );

        expect(screen.getByText(`${title} (2)`)).toBeInTheDocument();
        unmount();
      });
    });

    it('displays correct card count', () => {
      render(<CardZone {...defaultProps} cards={mockCards} />);
      expect(screen.getByText('Hand (2)')).toBeInTheDocument();
    });

    it('shows zero count when no cards', () => {
      render(<CardZone {...defaultProps} />);
      expect(screen.getByText('Hand (0)')).toBeInTheDocument();
    });
  });

  describe('deck zone behavior', () => {
    it('shows "Cards available" when deck has cards', () => {
      render(
        <CardZone zone={Zone.DECK} cards={mockCards} onCardClick={vi.fn()} />
      );
      expect(screen.getByText('Cards available')).toBeInTheDocument();
    });

    it('shows empty message when deck is empty', () => {
      render(<CardZone zone={Zone.DECK} cards={[]} onCardClick={vi.fn()} />);
      expect(screen.getByText('Empty deck')).toBeInTheDocument();
    });
  });

  describe('discard zone behavior', () => {
    it('shows most recent card when discard has cards', () => {
      render(
        <CardZone zone={Zone.DISCARD} cards={mockCards} onCardClick={vi.fn()} />
      );
      expect(screen.getByText('Second Card')).toBeInTheDocument();
    });

    it('shows empty message when discard is empty', () => {
      render(<CardZone zone={Zone.DISCARD} cards={[]} onCardClick={vi.fn()} />);
      expect(screen.getByText('Empty')).toBeInTheDocument();
    });
  });

  describe('hand and play area behavior', () => {
    it('displays individual clickable cards in hand', () => {
      render(
        <CardZone zone={Zone.HAND} cards={mockCards} onCardClick={vi.fn()} />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Second Card')).toBeInTheDocument();
    });

    it('displays individual clickable cards in play area', () => {
      render(
        <CardZone zone={Zone.PLAYED} cards={mockCards} onCardClick={vi.fn()} />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Second Card')).toBeInTheDocument();
    });

    it('shows empty message when hand is empty', () => {
      render(<CardZone zone={Zone.HAND} cards={[]} onCardClick={vi.fn()} />);
      expect(screen.getByText('No cards in hand')).toBeInTheDocument();
    });

    it('shows empty message when play area is empty', () => {
      render(<CardZone zone={Zone.PLAYED} cards={[]} onCardClick={vi.fn()} />);
      expect(screen.getByText('No cards in play')).toBeInTheDocument();
    });
  });

  describe('card interactions', () => {
    it('calls onCardClick when a card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCardClick = vi.fn();

      render(
        <CardZone
          zone={Zone.HAND}
          cards={[mockCard]}
          onCardClick={mockOnCardClick}
        />
      );

      const cardElement = screen.getByText('Test Card');
      await user.click(cardElement);

      expect(mockOnCardClick).toHaveBeenCalledWith(
        mockCard,
        Zone.HAND,
        expect.any(Object)
      );
    });

    it('calls onCardClick when Enter key is pressed on a card', async () => {
      const user = userEvent.setup();
      const mockOnCardClick = vi.fn();

      render(
        <CardZone
          zone={Zone.HAND}
          cards={[mockCard]}
          onCardClick={mockOnCardClick}
        />
      );

      const cardElement = screen.getByText('Test Card');
      cardElement.focus();
      await user.keyboard('{Enter}');

      expect(mockOnCardClick).toHaveBeenCalledWith(
        mockCard,
        Zone.HAND,
        expect.any(Object)
      );
    });

    it('calls onCardClick when Space key is pressed on a card', async () => {
      const user = userEvent.setup();
      const mockOnCardClick = vi.fn();

      render(
        <CardZone
          zone={Zone.HAND}
          cards={[mockCard]}
          onCardClick={mockOnCardClick}
        />
      );

      const cardElement = screen.getByText('Test Card');
      cardElement.focus();
      await user.keyboard(' ');

      expect(mockOnCardClick).toHaveBeenCalledWith(
        mockCard,
        Zone.HAND,
        expect.any(Object)
      );
    });

    it('does not trigger onCardClick for deck cards', () => {
      const mockOnCardClick = vi.fn();
      render(
        <CardZone
          zone={Zone.DECK}
          cards={mockCards}
          onCardClick={mockOnCardClick}
        />
      );

      // Deck should show "Cards available" but not individual clickable cards
      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
      expect(screen.getByText('Cards available')).toBeInTheDocument();
    });

    it('does not trigger onCardClick for discard cards', () => {
      const mockOnCardClick = vi.fn();
      render(
        <CardZone
          zone={Zone.DISCARD}
          cards={mockCards}
          onCardClick={mockOnCardClick}
        />
      );

      // Discard should show most recent card name but not as clickable
      const discardCard = screen.getByText('Second Card');
      expect(discardCard).not.toHaveAttribute('data-card-clickable');
    });
  });

  describe('accessibility', () => {
    it('has proper accessibility attributes for clickable cards', () => {
      render(
        <CardZone zone={Zone.HAND} cards={[mockCard]} onCardClick={vi.fn()} />
      );

      const cardElement = screen.getByText('Test Card');
      expect(cardElement).toHaveAttribute('role', 'button');
      expect(cardElement).toHaveAttribute('tabIndex', '0');
      expect(cardElement).toHaveAttribute('data-card-clickable', 'true');
    });

    it('has correct heading structure', () => {
      render(<CardZone {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Hand (0)');
    });
  });

  describe('edge cases', () => {
    it('handles single card correctly', () => {
      render(
        <CardZone zone={Zone.HAND} cards={[mockCard]} onCardClick={vi.fn()} />
      );

      expect(screen.getByText('Hand (1)')).toBeInTheDocument();
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('handles many cards correctly', () => {
      const manyCards = Array.from({ length: 10 }, (_, index) => ({
        ...mockCard,
        instanceId: `instance-${index}`,
        definition: {
          ...mockCard.definition,
          name: `Card ${index}`,
          uid: `card-${index}`,
        },
      }));

      render(
        <CardZone zone={Zone.HAND} cards={manyCards} onCardClick={vi.fn()} />
      );

      expect(screen.getByText('Hand (10)')).toBeInTheDocument();
      expect(screen.getByText('Card 0')).toBeInTheDocument();
      expect(screen.getByText('Card 9')).toBeInTheDocument();
    });

    it('handles cards with long names', () => {
      const longNameCard = {
        ...mockCard,
        definition: {
          ...mockCard.definition,
          name: 'This is a very long card name that might cause layout issues',
        },
      };

      render(
        <CardZone
          zone={Zone.HAND}
          cards={[longNameCard]}
          onCardClick={vi.fn()}
        />
      );

      expect(
        screen.getByText(
          'This is a very long card name that might cause layout issues'
        )
      ).toBeInTheDocument();
    });
  });
});
