import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CardContextMenu } from '../CardContextMenu';
import { Zone, CardInstance } from '@/features/cards/types';

describe('CardContextMenu Component', () => {
  const mockCard: CardInstance = {
    definition: {
      name: 'Test Card',
      text: 'Test card description',
      cost: 2,
      uid: 'test-card-1',
    },
    ownerId: 'player-1',
    zone: Zone.HAND,
    instanceId: 'card-instance-1',
  };

  const baseSelectedCard = {
    card: mockCard,
    playerId: 'player-1',
    currentZone: Zone.HAND,
    position: { x: 100, y: 200 },
  };

  const defaultProps = {
    selectedCard: baseSelectedCard,
    onMoveCard: vi.fn(),
    onTrashCard: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CardContextMenu {...defaultProps} />);
  });

  describe('positioning', () => {
    it('positions the menu at the specified coordinates', () => {
      const { container } = render(<CardContextMenu {...defaultProps} />);
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '200px',
        left: '100px',
      });
    });

    it('handles different position coordinates', () => {
      const selectedCardAtDifferentPosition = {
        ...baseSelectedCard,
        position: { x: 500, y: 750 },
      };

      const { container } = render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardAtDifferentPosition}
        />
      );
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '750px',
        left: '500px',
      });
    });

    it('handles edge case coordinates', () => {
      const selectedCardAtEdge = {
        ...baseSelectedCard,
        position: { x: 0, y: 0 },
      };

      const { container } = render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardAtEdge} />
      );
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '0px',
        left: '0px',
      });
    });
  });

  describe('menu options based on current zone', () => {
    it('shows Play Card option when card is not in PLAYED zone', () => {
      const selectedCardInHand = {
        ...baseSelectedCard,
        currentZone: Zone.HAND,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInHand} />
      );
      expect(screen.getByText('Play Card')).toBeInTheDocument();
    });

    it('does not show Play Card option when card is in PLAYED zone', () => {
      const selectedCardInPlayed = {
        ...baseSelectedCard,
        currentZone: Zone.PLAYED,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInPlayed}
        />
      );
      expect(screen.queryByText('Play Card')).not.toBeInTheDocument();
    });

    it('shows Discard Card option when card is not in DISCARD zone', () => {
      const selectedCardInHand = {
        ...baseSelectedCard,
        currentZone: Zone.HAND,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInHand} />
      );
      expect(screen.getByText('Discard Card')).toBeInTheDocument();
    });

    it('does not show Discard Card option when card is in DISCARD zone', () => {
      const selectedCardInDiscard = {
        ...baseSelectedCard,
        currentZone: Zone.DISCARD,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInDiscard}
        />
      );
      expect(screen.queryByText('Discard Card')).not.toBeInTheDocument();
    });

    it('shows Return to Hand option when card is not in HAND zone', () => {
      const selectedCardInPlayed = {
        ...baseSelectedCard,
        currentZone: Zone.PLAYED,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInPlayed}
        />
      );
      expect(screen.getByText('Return to Hand')).toBeInTheDocument();
    });

    it('does not show Return to Hand option when card is in HAND zone', () => {
      const selectedCardInHand = {
        ...baseSelectedCard,
        currentZone: Zone.HAND,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInHand} />
      );
      expect(screen.queryByText('Return to Hand')).not.toBeInTheDocument();
    });

    it('shows Trash Card option when card is in HAND zone', () => {
      const selectedCardInHand = {
        ...baseSelectedCard,
        currentZone: Zone.HAND,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInHand} />
      );
      expect(screen.getByText('Trash Card')).toBeInTheDocument();
    });

    it('shows Trash Card option when card is in PLAYED zone', () => {
      const selectedCardInPlayed = {
        ...baseSelectedCard,
        currentZone: Zone.PLAYED,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInPlayed}
        />
      );
      expect(screen.getByText('Trash Card')).toBeInTheDocument();
    });

    it('does not show Trash Card option when card is in DECK zone', () => {
      const selectedCardInDeck = {
        ...baseSelectedCard,
        currentZone: Zone.DECK,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInDeck} />
      );
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
    });

    it('does not show Trash Card option when card is in DISCARD zone', () => {
      const selectedCardInDiscard = {
        ...baseSelectedCard,
        currentZone: Zone.DISCARD,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInDiscard}
        />
      );
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
    });

    it('does not show Trash Card option when card is in MARKET zone', () => {
      const selectedCardInMarket = {
        ...baseSelectedCard,
        currentZone: Zone.MARKET,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInMarket}
        />
      );
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
    });

    it('always shows Cancel option', () => {
      render(<CardContextMenu {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('zone-specific option combinations', () => {
    it('shows correct options when card is in HAND zone', () => {
      const selectedCardInHand = {
        ...baseSelectedCard,
        currentZone: Zone.HAND,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInHand} />
      );

      expect(screen.getByText('Play Card')).toBeInTheDocument();
      expect(screen.getByText('Discard Card')).toBeInTheDocument();
      expect(screen.queryByText('Return to Hand')).not.toBeInTheDocument();
      expect(screen.getByText('Trash Card')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows correct options when card is in PLAYED zone', () => {
      const selectedCardInPlayed = {
        ...baseSelectedCard,
        currentZone: Zone.PLAYED,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInPlayed}
        />
      );

      expect(screen.queryByText('Play Card')).not.toBeInTheDocument();
      expect(screen.getByText('Discard Card')).toBeInTheDocument();
      expect(screen.getByText('Return to Hand')).toBeInTheDocument();
      expect(screen.getByText('Trash Card')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows correct options when card is in DISCARD zone', () => {
      const selectedCardInDiscard = {
        ...baseSelectedCard,
        currentZone: Zone.DISCARD,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInDiscard}
        />
      );

      expect(screen.getByText('Play Card')).toBeInTheDocument();
      expect(screen.queryByText('Discard Card')).not.toBeInTheDocument();
      expect(screen.getByText('Return to Hand')).toBeInTheDocument();
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows correct options when card is in DECK zone', () => {
      const selectedCardInDeck = {
        ...baseSelectedCard,
        currentZone: Zone.DECK,
      };

      render(
        <CardContextMenu {...defaultProps} selectedCard={selectedCardInDeck} />
      );

      expect(screen.getByText('Play Card')).toBeInTheDocument();
      expect(screen.getByText('Discard Card')).toBeInTheDocument();
      expect(screen.getByText('Return to Hand')).toBeInTheDocument();
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('action handlers', () => {
    it('calls onMoveCard with PLAYED zone when Play Card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMoveCard = vi.fn();

      render(<CardContextMenu {...defaultProps} onMoveCard={mockOnMoveCard} />);

      const playCardButton = screen.getByText('Play Card');
      await user.click(playCardButton);

      expect(mockOnMoveCard).toHaveBeenCalledWith(Zone.PLAYED);
      expect(mockOnMoveCard).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveCard with DISCARD zone when Discard Card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMoveCard = vi.fn();

      render(<CardContextMenu {...defaultProps} onMoveCard={mockOnMoveCard} />);

      const discardCardButton = screen.getByText('Discard Card');
      await user.click(discardCardButton);

      expect(mockOnMoveCard).toHaveBeenCalledWith(Zone.DISCARD);
      expect(mockOnMoveCard).toHaveBeenCalledTimes(1);
    });

    it('calls onMoveCard with HAND zone when Return to Hand is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMoveCard = vi.fn();
      const selectedCardInPlayed = {
        ...baseSelectedCard,
        currentZone: Zone.PLAYED,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInPlayed}
          onMoveCard={mockOnMoveCard}
        />
      );

      const returnToHandButton = screen.getByText('Return to Hand');
      await user.click(returnToHandButton);

      expect(mockOnMoveCard).toHaveBeenCalledWith(Zone.HAND);
      expect(mockOnMoveCard).toHaveBeenCalledTimes(1);
    });

    it('calls onTrashCard when Trash Card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnTrashCard = vi.fn();

      render(
        <CardContextMenu {...defaultProps} onTrashCard={mockOnTrashCard} />
      );

      const trashCardButton = screen.getByText('Trash Card');
      await user.click(trashCardButton);

      expect(mockOnTrashCard).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<CardContextMenu {...defaultProps} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onMoveCard when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMoveCard = vi.fn();

      render(<CardContextMenu {...defaultProps} onMoveCard={mockOnMoveCard} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnMoveCard).not.toHaveBeenCalled();
    });

    it('does not call onTrashCard when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockOnTrashCard = vi.fn();

      render(
        <CardContextMenu {...defaultProps} onTrashCard={mockOnTrashCard} />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnTrashCard).not.toHaveBeenCalled();
    });
  });

  describe('component styling', () => {
    it('has correct menu container styling', () => {
      const { container } = render(<CardContextMenu {...defaultProps} />);
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveClass(
        'fixed',
        'bg-white',
        'rounded-lg',
        'p-3',
        'shadow-lg',
        'border',
        'border-gray-200',
        'z-50'
      );
    });

    it('has correct action button styling', () => {
      render(<CardContextMenu {...defaultProps} />);

      const playCardButton = screen.getByText('Play Card');
      expect(playCardButton).toHaveClass(
        'block',
        'w-full',
        'text-left',
        'text-sm',
        'text-gray-700',
        'hover:bg-gray-100',
        'p-2',
        'rounded-md',
        'mb-1'
      );
    });

    it('has correct cancel button styling', () => {
      render(<CardContextMenu {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveClass(
        'block',
        'w-full',
        'text-left',
        'text-sm',
        'text-gray-500',
        'hover:bg-gray-100',
        'p-2',
        'rounded-md',
        'border-t',
        'border-gray-200',
        'mt-1'
      );
    });
  });

  describe('accessibility', () => {
    it('has accessible button elements', () => {
      render(<CardContextMenu {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it('has proper button labels', () => {
      render(<CardContextMenu {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Play Card' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Discard Card' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Trash Card' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles MARKET zone correctly', () => {
      const selectedCardInMarket = {
        ...baseSelectedCard,
        currentZone: Zone.MARKET,
      };

      render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardInMarket}
        />
      );

      // Market zone should show all options except the market-specific ones
      expect(screen.getByText('Play Card')).toBeInTheDocument();
      expect(screen.getByText('Discard Card')).toBeInTheDocument();
      expect(screen.getByText('Return to Hand')).toBeInTheDocument();
      expect(screen.queryByText('Trash Card')).not.toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('handles very large position coordinates', () => {
      const selectedCardAtLargePosition = {
        ...baseSelectedCard,
        position: { x: 99999, y: 99999 },
      };

      const { container } = render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardAtLargePosition}
        />
      );
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '99999px',
        left: '99999px',
      });
    });

    it('handles negative position coordinates', () => {
      const selectedCardAtNegativePosition = {
        ...baseSelectedCard,
        position: { x: -100, y: -200 },
      };

      const { container } = render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardAtNegativePosition}
        />
      );
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '-200px',
        left: '-100px',
      });
    });

    it('handles floating point position coordinates', () => {
      const selectedCardAtFloatPosition = {
        ...baseSelectedCard,
        position: { x: 123.456, y: 789.123 },
      };

      const { container } = render(
        <CardContextMenu
          {...defaultProps}
          selectedCard={selectedCardAtFloatPosition}
        />
      );
      const menu = container.firstChild as HTMLElement;

      expect(menu).toHaveStyle({
        top: '789.123px',
        left: '123.456px',
      });
    });
  });
});
