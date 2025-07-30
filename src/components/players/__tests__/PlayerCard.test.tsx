import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PlayerCard } from '../PlayerCard';
import { Player } from '@/features/player/types';
import { Zone, CardInstance } from '@/features/cards/types';

// Mock the CardZone component since we're testing it separately
vi.mock('../zones/CardZone', () => ({
  CardZone: ({
    zone,
    cards,
    onCardClick,
  }: {
    zone: string;
    cards: CardInstance[];
    onCardClick: (
      card: CardInstance,
      zone: string,
      e: React.MouseEvent
    ) => void;
  }) => (
    <div data-testid={`card-zone-${zone}`}>
      <div>Zone: {zone}</div>
      <div>Card count: {cards.length}</div>
      {cards.map((card: CardInstance) => (
        <button
          key={card.instanceId}
          onClick={(e) => onCardClick(card, zone, e)}
          data-testid={`card-${card.instanceId}`}
        >
          {card.definition.name}
        </button>
      ))}
    </div>
  ),
}));

describe('PlayerCard Component', () => {
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
    instanceId: 'card-instance-1',
  };

  const mockPlayer: Player = {
    name: 'Test Player',
    playerId: 'player-1',
    allCards: [],
    deck: [mockCard],
    hand: [],
    played: [],
    discard: [],
  };

  const defaultProps = {
    player: mockPlayer,
    onCardClick: vi.fn(),
    onDrawCard: vi.fn(),
    onDrawHand: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PlayerCard {...defaultProps} />);
  });

  describe('player information display', () => {
    it('displays the player name', () => {
      render(<PlayerCard {...defaultProps} />);
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    it('displays the player name as a heading', () => {
      render(<PlayerCard {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Player');
    });

    it('handles players with different names', () => {
      const differentPlayer = {
        ...mockPlayer,
        name: 'Alice the Magnificent',
        playerId: 'player-2',
      };

      render(<PlayerCard {...defaultProps} player={differentPlayer} />);
      expect(screen.getByText('Alice the Magnificent')).toBeInTheDocument();
    });
  });

  describe('card zones rendering', () => {
    it('renders all four card zones', () => {
      render(<PlayerCard {...defaultProps} />);

      expect(screen.getByTestId(`card-zone-${Zone.DECK}`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`card-zone-${Zone.DISCARD}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`card-zone-${Zone.PLAYED}`)
      ).toBeInTheDocument();
      expect(screen.getByTestId(`card-zone-${Zone.HAND}`)).toBeInTheDocument();
    });

    it('passes correct cards to each zone', () => {
      const playerWithCards: Player = {
        name: 'Card Player',
        playerId: 'player-2',
        allCards: [],
        deck: [{ ...mockCard, instanceId: 'deck-card', zone: Zone.DECK }],
        hand: [{ ...mockCard, instanceId: 'hand-card', zone: Zone.HAND }],
        played: [{ ...mockCard, instanceId: 'played-card', zone: Zone.PLAYED }],
        discard: [
          { ...mockCard, instanceId: 'discard-card', zone: Zone.DISCARD },
        ],
      };

      render(<PlayerCard {...defaultProps} player={playerWithCards} />);

      // Each zone should show 1 card
      const zones = screen.getAllByText('Card count: 1');
      expect(zones).toHaveLength(4);
    });

    it('passes correct onCardClick handler to each zone', async () => {
      const user = userEvent.setup();
      const mockOnCardClick = vi.fn();

      const playerWithHandCard: Player = {
        ...mockPlayer,
        hand: [mockCard],
        deck: [],
      };

      render(
        <PlayerCard
          {...defaultProps}
          player={playerWithHandCard}
          onCardClick={mockOnCardClick}
        />
      );

      const handCard = screen.getByTestId('card-card-instance-1');
      await user.click(handCard);

      expect(mockOnCardClick).toHaveBeenCalledWith(
        mockCard,
        'player-1',
        Zone.HAND,
        expect.any(Object)
      );
    });
  });

  describe('player action buttons', () => {
    it('renders Draw Card button', () => {
      render(<PlayerCard {...defaultProps} />);
      expect(screen.getByText('Draw Card')).toBeInTheDocument();
    });

    it('renders Draw Hand button', () => {
      render(<PlayerCard {...defaultProps} />);
      expect(screen.getByText('Draw Hand')).toBeInTheDocument();
    });

    it('calls onDrawCard with correct playerId when Draw Card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnDrawCard = vi.fn();

      render(<PlayerCard {...defaultProps} onDrawCard={mockOnDrawCard} />);

      const drawCardButton = screen.getByText('Draw Card');
      await user.click(drawCardButton);

      expect(mockOnDrawCard).toHaveBeenCalledWith('player-1');
      expect(mockOnDrawCard).toHaveBeenCalledTimes(1);
    });

    it('calls onDrawHand with correct playerId when Draw Hand is clicked', async () => {
      const user = userEvent.setup();
      const mockOnDrawHand = vi.fn();

      render(<PlayerCard {...defaultProps} onDrawHand={mockOnDrawHand} />);

      const drawHandButton = screen.getByText('Draw Hand');
      await user.click(drawHandButton);

      expect(mockOnDrawHand).toHaveBeenCalledWith('player-1');
      expect(mockOnDrawHand).toHaveBeenCalledTimes(1);
    });
  });

  describe('drag and drop functionality', () => {
    it('handles onDragOver event on the container', () => {
      const mockOnDragOver = vi.fn();
      const { container } = render(
        <PlayerCard {...defaultProps} onDragOver={mockOnDragOver} />
      );

      const playerContainer = container.firstChild as HTMLElement;
      const dragEvent = new Event('dragover', { bubbles: true });

      playerContainer.dispatchEvent(dragEvent);
      expect(mockOnDragOver).toHaveBeenCalled();
    });

    it('handles onDrop event with correct parameters', () => {
      const mockOnDrop = vi.fn();
      const { container } = render(
        <PlayerCard {...defaultProps} onDrop={mockOnDrop} />
      );

      const playerContainer = container.firstChild as HTMLElement;
      const dropEvent = new Event('drop', { bubbles: true }) as DragEvent;

      playerContainer.dispatchEvent(dropEvent);
      expect(mockOnDrop).toHaveBeenCalledWith(
        expect.any(Object),
        'player-1',
        Zone.DISCARD
      );
    });

    it('defaults drop zone to DISCARD', () => {
      const mockOnDrop = vi.fn();
      const { container } = render(
        <PlayerCard {...defaultProps} onDrop={mockOnDrop} />
      );

      const playerContainer = container.firstChild as HTMLElement;
      const dropEvent = new Event('drop', { bubbles: true }) as DragEvent;

      playerContainer.dispatchEvent(dropEvent);

      const mockCall = mockOnDrop.mock.calls[0];
      const playerId = mockCall?.[1] as string;
      const zone = mockCall?.[2] as string;
      expect(playerId).toBe('player-1');
      expect(zone).toBe(Zone.DISCARD);
    });
  });

  describe('accessibility', () => {
    it('has proper semantic structure', () => {
      render(<PlayerCard {...defaultProps} />);

      // Should have a heading for player name
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      // Should have buttons for actions
      const drawCardButton = screen.getByRole('button', { name: 'Draw Card' });
      const drawHandButton = screen.getByRole('button', { name: 'Draw Hand' });

      expect(drawCardButton).toBeInTheDocument();
      expect(drawHandButton).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<PlayerCard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Draw Card' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Draw Hand' })
      ).toBeInTheDocument();
    });
  });

  describe('edge cases and error handling', () => {
    it('handles player with empty name', () => {
      const playerWithEmptyName = {
        ...mockPlayer,
        name: '',
      };

      render(<PlayerCard {...defaultProps} player={playerWithEmptyName} />);

      // Should still render, even with empty name
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('');
    });

    it('handles player with all empty zones', () => {
      const emptyPlayer: Player = {
        name: 'Empty Player',
        playerId: 'empty-player',
        allCards: [],
        deck: [],
        hand: [],
        played: [],
        discard: [],
      };

      render(<PlayerCard {...defaultProps} player={emptyPlayer} />);

      // All zones should show 0 cards
      const cardCounts = screen.getAllByText('Card count: 0');
      expect(cardCounts).toHaveLength(4);
    });

    it('handles player with many cards in each zone', () => {
      const manyCards = Array.from({ length: 10 }, (_, index) => ({
        ...mockCard,
        instanceId: `card-${index}`,
        definition: { ...mockCard.definition, name: `Card ${index}` },
      }));

      const playerWithManyCards: Player = {
        name: 'Rich Player',
        playerId: 'rich-player',
        allCards: [],
        deck: [...manyCards],
        hand: [...manyCards],
        played: [...manyCards],
        discard: [...manyCards],
      };

      render(<PlayerCard {...defaultProps} player={playerWithManyCards} />);

      // All zones should show 10 cards
      const cardCounts = screen.getAllByText('Card count: 10');
      expect(cardCounts).toHaveLength(4);
    });

    it('handles very long player names gracefully', () => {
      const longNamePlayer = {
        ...mockPlayer,
        name: 'This is an extremely long player name that might cause layout issues in the UI',
      };

      render(<PlayerCard {...defaultProps} player={longNamePlayer} />);

      expect(
        screen.getByText(
          'This is an extremely long player name that might cause layout issues in the UI'
        )
      ).toBeInTheDocument();
    });
  });
});
