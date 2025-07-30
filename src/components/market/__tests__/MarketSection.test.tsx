import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MarketSection } from '../MarketSection';
import { CardDefinition } from '@/features/cards/types';
import { Game } from '@/features/game/types';

describe('MarketSection Component', () => {
  const mockCardDefinition: CardDefinition = {
    name: 'Fire Bolt',
    text: 'Deal 3 damage to any target',
    cost: 2,
    uid: 'fire-bolt-1',
  };

  const mockGame: Game = {
    startingHandSize: 5,
    startingDeckComposition: {},
    players: [],
    market: { catalog: [] },
  };

  const defaultProps = {
    marketCards: [],
    isSelectingDeckComposition: false,
    deckComposition: {},
    updateDeckQuantity: vi.fn(),
    handleDragStart: vi.fn(),
    onShowAddCardModal: vi.fn(),
    onShowBulkAddCardModal: vi.fn(),
    onStartDeckComposition: vi.fn(),
    game: mockGame,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MarketSection {...defaultProps} />);
  });

  describe('market header and empty state', () => {
    it('displays the market title', () => {
      render(<MarketSection {...defaultProps} />);
      expect(screen.getByText('Market')).toBeInTheDocument();
    });

    it('shows empty market message when no cards', () => {
      render(<MarketSection {...defaultProps} />);
      expect(
        screen.getByText('No cards in market. Add cards using the panel below.')
      ).toBeInTheDocument();
    });
  });

  describe('market cards display', () => {
    it('displays cards when market has cards', () => {
      const marketCards = [mockCardDefinition];
      render(<MarketSection {...defaultProps} marketCards={marketCards} />);

      expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
      expect(
        screen.getByText('Deal 3 damage to any target')
      ).toBeInTheDocument();
      expect(screen.getByText('Cost: 2')).toBeInTheDocument();
    });

    it('displays multiple cards correctly', () => {
      const marketCards = [
        mockCardDefinition,
        {
          ...mockCardDefinition,
          name: 'Ice Shard',
          uid: 'ice-shard-1',
          cost: 1,
        },
        {
          ...mockCardDefinition,
          name: 'Lightning Strike',
          uid: 'lightning-1',
          cost: 3,
        },
      ];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);

      expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
      expect(screen.getByText('Ice Shard')).toBeInTheDocument();
      expect(screen.getByText('Lightning Strike')).toBeInTheDocument();
    });

    it('displays card costs correctly', () => {
      const marketCards = [
        { ...mockCardDefinition, cost: 0 },
        {
          ...mockCardDefinition,
          name: 'Expensive Card',
          uid: 'expensive-1',
          cost: 10,
        },
      ];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);

      expect(screen.getByText('Cost: 0')).toBeInTheDocument();
      expect(screen.getByText('Cost: 10')).toBeInTheDocument();
    });
  });

  describe('normal mode (not selecting deck composition)', () => {
    it('calls handleDragStart when dragging a card', () => {
      const mockHandleDragStart = vi.fn();
      const marketCards = [mockCardDefinition];

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          handleDragStart={mockHandleDragStart}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      const dragEvent = new Event('dragstart', { bubbles: true }) as DragEvent;

      cardElement.dispatchEvent(dragEvent);
      expect(mockHandleDragStart).toHaveBeenCalled();
    });

    it('makes cards draggable in normal mode', () => {
      const marketCards = [mockCardDefinition];
      render(<MarketSection {...defaultProps} marketCards={marketCards} />);

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      expect(cardElement).toHaveAttribute('draggable', 'true');
    });
  });

  describe('deck composition selection mode', () => {
    it('makes cards non-draggable in deck composition mode', () => {
      const marketCards = [mockCardDefinition];
      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      expect(cardElement).toHaveAttribute('draggable', 'false');
    });

    it('shows "Click to add" message in deck composition mode', () => {
      const marketCards = [mockCardDefinition];
      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
        />
      );

      expect(screen.getByText('Click to add')).toBeInTheDocument();
    });

    it('calls updateDeckQuantity when clicking a card in deck composition mode', async () => {
      const user = userEvent.setup();
      const mockUpdateDeckQuantity = vi.fn();
      const marketCards = [mockCardDefinition];

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          updateDeckQuantity={mockUpdateDeckQuantity}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      await user.click(cardElement);

      expect(mockUpdateDeckQuantity).toHaveBeenCalledWith('fire-bolt-1', true);
    });

    it('handles keyboard interactions in deck composition mode', async () => {
      const user = userEvent.setup();
      const mockUpdateDeckQuantity = vi.fn();
      const marketCards = [mockCardDefinition];

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          updateDeckQuantity={mockUpdateDeckQuantity}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      cardElement.focus();
      await user.keyboard('{Enter}');

      expect(mockUpdateDeckQuantity).toHaveBeenCalledWith('fire-bolt-1', true);
    });

    it('handles space key in deck composition mode', async () => {
      const user = userEvent.setup();
      const mockUpdateDeckQuantity = vi.fn();
      const marketCards = [mockCardDefinition];

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          updateDeckQuantity={mockUpdateDeckQuantity}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      cardElement.focus();
      await user.keyboard(' ');

      expect(mockUpdateDeckQuantity).toHaveBeenCalledWith('fire-bolt-1', true);
    });

    it('shows selected card count in deck composition mode', () => {
      const marketCards = [mockCardDefinition];
      const deckComposition = { 'fire-bolt-1': 3 };

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          deckComposition={deckComposition}
        />
      );

      expect(screen.getByText('Selected: 3')).toBeInTheDocument();
    });

    it('does not show selected count when card not in deck composition', () => {
      const marketCards = [mockCardDefinition];
      const deckComposition = {};

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          deckComposition={deckComposition}
        />
      );

      expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
    });

    it('has correct accessibility attributes in deck composition mode', () => {
      const marketCards = [mockCardDefinition];

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
        />
      );

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      expect(cardElement).toHaveAttribute('role', 'button');
      expect(cardElement).toHaveAttribute('tabIndex', '0');
    });

    it('does not have accessibility attributes in normal mode', () => {
      const marketCards = [mockCardDefinition];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);

      const cardElement = screen
        .getByText('Fire Bolt')
        .closest('div') as HTMLElement;
      expect(cardElement).not.toHaveAttribute('role');
      expect(cardElement).not.toHaveAttribute('tabIndex');
    });
  });

  describe('action buttons', () => {
    it('renders Add Card to Market button', () => {
      render(<MarketSection {...defaultProps} />);
      expect(screen.getByText('Add Card to Market')).toBeInTheDocument();
    });

    it('calls onShowAddCardModal when Add Card button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnShowAddCardModal = vi.fn();

      render(
        <MarketSection
          {...defaultProps}
          onShowAddCardModal={mockOnShowAddCardModal}
        />
      );

      const addCardButton = screen.getByText('Add Card to Market');
      await user.click(addCardButton);

      expect(mockOnShowAddCardModal).toHaveBeenCalledTimes(1);
    });

    it('disables Add Card button when selecting deck composition', () => {
      render(
        <MarketSection {...defaultProps} isSelectingDeckComposition={true} />
      );

      const addCardButton = screen.getByText('Add Card to Market');
      expect(addCardButton).toBeDisabled();
    });

    it('renders Add Multiple Cards to Market button', () => {
      render(<MarketSection {...defaultProps} />);
      expect(
        screen.getByText('Add Multiple Cards to Market')
      ).toBeInTheDocument();
    });

    it('calls onShowBulkAddCardModal when Add Multiple Cards button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnShowBulkAddCardModal = vi.fn();

      render(
        <MarketSection
          {...defaultProps}
          onShowBulkAddCardModal={mockOnShowBulkAddCardModal}
        />
      );

      const bulkAddButton = screen.getByText('Add Multiple Cards to Market');
      await user.click(bulkAddButton);

      expect(mockOnShowBulkAddCardModal).toHaveBeenCalledTimes(1);
    });

    it('disables Add Multiple Cards button when selecting deck composition', () => {
      render(
        <MarketSection {...defaultProps} isSelectingDeckComposition={true} />
      );

      const bulkAddButton = screen.getByText('Add Multiple Cards to Market');
      expect(bulkAddButton).toBeDisabled();
    });

    it('renders Set Starting Deck Composition button when no composition exists', () => {
      render(<MarketSection {...defaultProps} />);
      expect(
        screen.getByText('Set Starting Deck Composition')
      ).toBeInTheDocument();
    });

    it('renders Edit Starting Deck Composition button when composition exists', () => {
      const gameWithComposition = {
        ...mockGame,
        startingDeckComposition: { 'card-1': 2 },
      };

      render(<MarketSection {...defaultProps} game={gameWithComposition} />);
      expect(
        screen.getByText('Edit Starting Deck Composition')
      ).toBeInTheDocument();
    });

    it('calls onStartDeckComposition when deck composition button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnStartDeckComposition = vi.fn();

      render(
        <MarketSection
          {...defaultProps}
          onStartDeckComposition={mockOnStartDeckComposition}
        />
      );

      const deckCompositionButton = screen.getByText(
        'Set Starting Deck Composition'
      );
      await user.click(deckCompositionButton);

      expect(mockOnStartDeckComposition).toHaveBeenCalledTimes(1);
    });

    it('disables deck composition button when selecting deck composition', () => {
      render(
        <MarketSection {...defaultProps} isSelectingDeckComposition={true} />
      );

      const deckCompositionButton = screen.getByText(
        'Set Starting Deck Composition'
      );
      expect(deckCompositionButton).toBeDisabled();
    });
  });

  describe('edge cases and error handling', () => {
    it('handles null game gracefully', () => {
      render(<MarketSection {...defaultProps} game={null} />);
      expect(
        screen.getByText('Set Starting Deck Composition')
      ).toBeInTheDocument();
    });

    it('handles cards with very long names', () => {
      const longNameCard = {
        ...mockCardDefinition,
        name: 'This is an extremely long card name that might cause layout issues',
        uid: 'long-name-card',
      };
      const marketCards = [longNameCard];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);
      expect(
        screen.getByText(
          'This is an extremely long card name that might cause layout issues'
        )
      ).toBeInTheDocument();
    });

    it('handles cards with empty text', () => {
      const emptyTextCard = {
        ...mockCardDefinition,
        text: '',
        uid: 'empty-text-card',
      };
      const marketCards = [emptyTextCard];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);
      expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
    });

    it('handles very high cost cards', () => {
      const expensiveCard = {
        ...mockCardDefinition,
        cost: 999,
        uid: 'expensive-card',
      };
      const marketCards = [expensiveCard];

      render(<MarketSection {...defaultProps} marketCards={marketCards} />);
      expect(screen.getByText('Cost: 999')).toBeInTheDocument();
    });

    it('handles large deck composition quantities', () => {
      const marketCards = [mockCardDefinition];
      const largeDeckComposition = { 'fire-bolt-1': 50 };

      render(
        <MarketSection
          {...defaultProps}
          marketCards={marketCards}
          isSelectingDeckComposition={true}
          deckComposition={largeDeckComposition}
        />
      );

      expect(screen.getByText('Selected: 50')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<MarketSection {...defaultProps} />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'Market' })
      ).toBeInTheDocument();
    });

    it('has accessible buttons', () => {
      render(<MarketSection {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Add Card to Market' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Set Starting Deck Composition' })
      ).toBeInTheDocument();
    });
  });
});
