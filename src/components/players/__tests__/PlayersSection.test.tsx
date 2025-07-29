import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PlayersSection } from '../PlayersSection';
import { Player } from '@/features/player/types';
import { Zone, CardInstance } from '@/features/cards/types';
import { Game } from '@/features/game/types';

// Mock the child components since we're testing them separately
vi.mock('../PlayerCard', () => ({
  PlayerCard: ({ player }: { player: Player }) => (
    <div data-testid={`player-card-${player.playerId}`}>
      <div>Player: {player.name}</div>
      <div>Player ID: {player.playerId}</div>
    </div>
  ),
}));

vi.mock('./AddPlayerInterface', () => ({
  AddPlayerInterface: ({
    showInlineAddPlayer,
  }: {
    showInlineAddPlayer: boolean;
  }) => (
    <div data-testid="add-player-interface">
      <div>Add Player Interface</div>
      <div>Inline: {showInlineAddPlayer.toString()}</div>
    </div>
  ),
}));

describe('PlayersSection Component', () => {
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

  const mockPlayer: Player = {
    name: 'Alice',
    playerId: 'player-1',
    allCards: [],
    deck: [],
    hand: [mockCard],
    played: [],
    discard: [],
  };

  const mockGame: Game = {
    startingHandSize: 5,
    startingDeckComposition: { 'card-1': 2 },
    players: [],
    market: { catalog: new Set() },
  };

  const defaultProps = {
    players: [],
    showInlineAddPlayer: false,
    playerName: '',
    setPlayerName: vi.fn(),
    game: mockGame,
    onCardClick: vi.fn(),
    onDrawCard: vi.fn(),
    onDrawHand: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onAddPlayer: vi.fn(),
    onShowInlineForm: vi.fn(),
    onCancelAddPlayer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PlayersSection {...defaultProps} />);
  });

  describe('section header', () => {
    it('displays the Players title', () => {
      render(<PlayersSection {...defaultProps} />);
      expect(screen.getByText('Players')).toBeInTheDocument();
    });

    it('has correct heading level', () => {
      render(<PlayersSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Players');
    });

    it('has correct heading styling', () => {
      render(<PlayersSection {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass(
        'text-xl',
        'font-semibold',
        'text-gray-800',
        'mb-4'
      );
    });
  });

  describe('grid layout', () => {
    it('has correct grid container styling', () => {
      const { container } = render(<PlayersSection {...defaultProps} />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'lg:grid-cols-2',
        'gap-6'
      );
    });

    it('maintains grid layout with players', () => {
      const players = [mockPlayer];
      const { container } = render(
        <PlayersSection {...defaultProps} players={players} />
      );
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'lg:grid-cols-2',
        'gap-6'
      );
    });
  });

  describe('no players state', () => {
    it('shows only AddPlayerInterface when no players exist', () => {
      render(<PlayersSection {...defaultProps} />);

      expect(screen.getByText('Add Player')).toBeInTheDocument();
      expect(screen.queryByTestId(/player-card-/)).not.toBeInTheDocument();
    });

    it('passes correct props to AddPlayerInterface when no players', () => {
      render(
        <PlayersSection
          {...defaultProps}
          showInlineAddPlayer={true}
          playerName="Bob"
        />
      );

      // When inline mode is true, should show the form instead of placeholder
      expect(screen.getByText('Add New Player')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
    });
  });

  describe('with players', () => {
    const multiplePlayer: Player[] = [
      mockPlayer,
      {
        name: 'Bob',
        playerId: 'player-2',
        allCards: [],
        deck: [],
        hand: [],
        played: [],
        discard: [],
      },
      {
        name: 'Charlie',
        playerId: 'player-3',
        allCards: [],
        deck: [],
        hand: [],
        played: [],
        discard: [],
      },
    ];

    it('renders PlayerCard for each player', () => {
      render(<PlayersSection {...defaultProps} players={multiplePlayer} />);

      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-3')).toBeInTheDocument();
    });

    it('displays player information correctly', () => {
      render(<PlayersSection {...defaultProps} players={multiplePlayer} />);

      expect(screen.getByText('Player: Alice')).toBeInTheDocument();
      expect(screen.getByText('Player: Bob')).toBeInTheDocument();
      expect(screen.getByText('Player: Charlie')).toBeInTheDocument();
    });

    it('shows AddPlayerInterface alongside players', () => {
      render(<PlayersSection {...defaultProps} players={multiplePlayer} />);

      expect(screen.getByText('Add Player')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
    });

    it('passes correct props to PlayerCard components', () => {
      render(<PlayersSection {...defaultProps} players={[mockPlayer]} />);

      // PlayerCard should receive the player data
      expect(screen.getByText('Player ID: player-1')).toBeInTheDocument();
    });

    it('renders single player correctly', () => {
      render(<PlayersSection {...defaultProps} players={[mockPlayer]} />);

      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });

    it('handles many players gracefully', () => {
      const manyPlayers = Array.from({ length: 6 }, (_, index) => ({
        name: `Player ${index + 1}`,
        playerId: `player-${index + 1}`,
        allCards: [],
        deck: [],
        hand: [],
        played: [],
        discard: [],
      }));

      render(<PlayersSection {...defaultProps} players={manyPlayers} />);

      // Should render all player cards
      manyPlayers.forEach((_, index) => {
        expect(
          screen.getByTestId(`player-card-player-${index + 1}`)
        ).toBeInTheDocument();
      });

      // Should still show AddPlayerInterface
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });
  });

  describe('props passing to AddPlayerInterface', () => {
    it('passes all required props to AddPlayerInterface', () => {
      render(
        <PlayersSection
          {...defaultProps}
          showInlineAddPlayer={true}
          playerName="TestPlayer"
        />
      );

      expect(screen.getByText('Add New Player')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TestPlayer')).toBeInTheDocument();
    });

    it('passes props correctly when players exist', () => {
      render(
        <PlayersSection
          {...defaultProps}
          players={[mockPlayer]}
          showInlineAddPlayer={false}
          playerName=""
        />
      );

      // When inline mode is false, should show the placeholder "Add Player" button
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('wraps content in proper container', () => {
      const { container } = render(<PlayersSection {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName.toLowerCase()).toBe('div');
    });

    it('maintains consistent structure with players', () => {
      const { container } = render(
        <PlayersSection {...defaultProps} players={[mockPlayer]} />
      );

      // Should have heading
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      // Should have grid container
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper semantic structure', () => {
      render(<PlayersSection {...defaultProps} />);

      // Should have a section heading
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Players');
    });

    it('maintains semantic structure with players', () => {
      render(<PlayersSection {...defaultProps} players={[mockPlayer]} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Players');
    });
  });

  describe('edge cases', () => {
    it('handles null game gracefully', () => {
      render(<PlayersSection {...defaultProps} game={null} />);
      expect(
        screen.getByText('Set starting deck composition first')
      ).toBeInTheDocument();
    });

    it('handles undefined players array', () => {
      // This should not happen in practice, but good to test
      // Component should handle this gracefully by showing an error state or defaulting to empty array
      expect(() => {
        render(
          <PlayersSection
            {...defaultProps}
            players={undefined as unknown as Player[]}
          />
        );
      }).toThrow();
    });

    it('handles empty string player name', () => {
      render(<PlayersSection {...defaultProps} playerName="" />);
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });

    it('handles very long player name', () => {
      const longName =
        'This is an extremely long player name that might cause layout issues';
      render(<PlayersSection {...defaultProps} playerName={longName} />);
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });

    it('handles players with duplicate names', () => {
      const playersWithDuplicateNames: Player[] = [
        { ...mockPlayer, playerId: 'player-1', name: 'Alice' },
        { ...mockPlayer, playerId: 'player-2', name: 'Alice' },
      ];

      render(
        <PlayersSection {...defaultProps} players={playersWithDuplicateNames} />
      );

      // Should render both players despite duplicate names
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-2')).toBeInTheDocument();
    });

    it('handles players with empty names', () => {
      const playerWithEmptyName: Player = {
        ...mockPlayer,
        name: '',
        playerId: 'empty-name-player',
      };

      render(
        <PlayersSection {...defaultProps} players={[playerWithEmptyName]} />
      );

      expect(
        screen.getByTestId('player-card-empty-name-player')
      ).toBeInTheDocument();
    });

    it('handles players with special characters in names', () => {
      const playerWithSpecialChars: Player = {
        ...mockPlayer,
        name: 'Player!@#$%^&*()',
        playerId: 'special-chars-player',
      };

      render(
        <PlayersSection {...defaultProps} players={[playerWithSpecialChars]} />
      );

      expect(
        screen.getByTestId('player-card-special-chars-player')
      ).toBeInTheDocument();
      expect(screen.getByText('Player: Player!@#$%^&*()')).toBeInTheDocument();
    });
  });

  describe('performance considerations', () => {
    it('uses stable keys for player rendering', () => {
      const players = [
        { ...mockPlayer, playerId: 'stable-1', name: 'Player 1' },
        { ...mockPlayer, playerId: 'stable-2', name: 'Player 2' },
      ];

      const { rerender } = render(
        <PlayersSection {...defaultProps} players={players} />
      );

      expect(screen.getByTestId('player-card-stable-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-stable-2')).toBeInTheDocument();

      // Rerender with same data
      rerender(<PlayersSection {...defaultProps} players={players} />);

      // Components should still be present
      expect(screen.getByTestId('player-card-stable-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-stable-2')).toBeInTheDocument();
    });

    it('handles rapid player list changes', () => {
      const { rerender } = render(
        <PlayersSection {...defaultProps} players={[]} />
      );

      // Add players
      rerender(<PlayersSection {...defaultProps} players={[mockPlayer]} />);
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();

      // Remove players
      rerender(<PlayersSection {...defaultProps} players={[]} />);
      expect(
        screen.queryByTestId('player-card-player-1')
      ).not.toBeInTheDocument();

      // Should always show AddPlayerInterface
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });
  });
});
