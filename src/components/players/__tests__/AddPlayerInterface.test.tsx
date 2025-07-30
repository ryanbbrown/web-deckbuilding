import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AddPlayerInterface } from '../AddPlayerInterface';
import { Game } from '@/features/game/types';

describe('AddPlayerInterface Component', () => {
  const mockGame: Game = {
    startingHandSize: 5,
    startingDeckComposition: {},
    players: [],
    market: { catalog: [] },
  };

  const defaultProps = {
    showInlineAddPlayer: false,
    playerName: '',
    setPlayerName: vi.fn(),
    game: mockGame,
    onAddPlayer: vi.fn(),
    onShowInlineForm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AddPlayerInterface {...defaultProps} />);
  });

  describe('placeholder mode (showInlineAddPlayer = false)', () => {
    it('shows the placeholder interface when not in inline mode', () => {
      render(<AddPlayerInterface {...defaultProps} />);

      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('Add Player')).toBeInTheDocument();
    });

    describe('with starting deck composition', () => {
      const gameWithStartingDeck: Game = {
        ...mockGame,
        startingDeckComposition: { 'card-1': 2, 'card-2': 3 },
      };

      it('has correct accessibility attributes when clickable', () => {
        render(
          <AddPlayerInterface {...defaultProps} game={gameWithStartingDeck} />
        );

        const placeholder = screen.getByText('Add Player').closest('div');
        expect(placeholder).toHaveAttribute('role', 'button');
        expect(placeholder).toHaveAttribute('tabIndex', '0');
      });

      it('calls onShowInlineForm when clicked', async () => {
        const user = userEvent.setup();
        const mockOnShowInlineForm = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            game={gameWithStartingDeck}
            onShowInlineForm={mockOnShowInlineForm}
          />
        );

        const placeholder = screen
          .getByText('Add Player')
          .closest('div') as HTMLElement;
        await user.click(placeholder);

        expect(mockOnShowInlineForm).toHaveBeenCalledTimes(1);
      });

      it('calls onShowInlineForm when Enter key is pressed', async () => {
        const user = userEvent.setup();
        const mockOnShowInlineForm = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            game={gameWithStartingDeck}
            onShowInlineForm={mockOnShowInlineForm}
          />
        );

        const placeholder = screen
          .getByText('Add Player')
          .closest('div') as HTMLElement;
        placeholder.focus();
        await user.keyboard('{Enter}');

        expect(mockOnShowInlineForm).toHaveBeenCalledTimes(1);
      });

      it('calls onShowInlineForm when Space key is pressed', async () => {
        const user = userEvent.setup();
        const mockOnShowInlineForm = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            game={gameWithStartingDeck}
            onShowInlineForm={mockOnShowInlineForm}
          />
        );

        const placeholder = screen
          .getByText('Add Player')
          .closest('div') as HTMLElement;
        placeholder.focus();
        await user.keyboard(' ');

        expect(mockOnShowInlineForm).toHaveBeenCalledTimes(1);
      });

      it('does not show warning message when starting deck exists', () => {
        render(
          <AddPlayerInterface {...defaultProps} game={gameWithStartingDeck} />
        );

        expect(
          screen.queryByText('Set starting deck composition first')
        ).not.toBeInTheDocument();
      });
    });

    describe('without starting deck composition', () => {
      it('does not have accessibility attributes when disabled', () => {
        render(<AddPlayerInterface {...defaultProps} />);

        const placeholder = screen.getByText('Add Player').closest('div');
        expect(placeholder).not.toHaveAttribute('role');
        expect(placeholder).not.toHaveAttribute('tabIndex');
      });

      it('shows warning message when no starting deck', () => {
        render(<AddPlayerInterface {...defaultProps} />);

        expect(
          screen.getByText('Set starting deck composition first')
        ).toBeInTheDocument();
      });

      it('does not call onShowInlineForm when clicked', async () => {
        const user = userEvent.setup();
        const mockOnShowInlineForm = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            onShowInlineForm={mockOnShowInlineForm}
          />
        );

        const placeholder = screen
          .getByText('Add Player')
          .closest('div') as HTMLElement;
        await user.click(placeholder);

        expect(mockOnShowInlineForm).not.toHaveBeenCalled();
      });

      it('handles null game gracefully', () => {
        render(<AddPlayerInterface {...defaultProps} game={null} />);

        expect(
          screen.getByText('Set starting deck composition first')
        ).toBeInTheDocument();
      });

      it('handles game with null startingDeckComposition', () => {
        const gameWithNullComposition = {
          ...mockGame,
          startingDeckComposition: null,
        };

        render(
          <AddPlayerInterface
            {...defaultProps}
            game={gameWithNullComposition}
          />
        );

        expect(
          screen.getByText('Set starting deck composition first')
        ).toBeInTheDocument();
      });
    });
  });

  describe('inline form mode (showInlineAddPlayer = true)', () => {
    it('shows the form interface when in inline mode', () => {
      render(
        <AddPlayerInterface {...defaultProps} showInlineAddPlayer={true} />
      );

      expect(screen.getByText('Add New Player')).toBeInTheDocument();
      expect(screen.getByLabelText('Player Name')).toBeInTheDocument();
      expect(screen.getByText('Add Player')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('displays current player name value', () => {
      render(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={true}
          playerName="Alice"
        />
      );

      const nameInput = screen.getByDisplayValue('Alice');
      expect(nameInput).toBeInTheDocument();
    });

    it('shows placeholder in name input', () => {
      render(
        <AddPlayerInterface {...defaultProps} showInlineAddPlayer={true} />
      );

      const nameInput = screen.getByLabelText('Player Name');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter player name');
    });

    describe('form interactions', () => {
      it('calls setPlayerName when name input changes', async () => {
        const user = userEvent.setup();
        const mockSetPlayerName = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            showInlineAddPlayer={true}
            setPlayerName={mockSetPlayerName}
          />
        );

        const nameInput = screen.getByLabelText('Player Name');
        await user.type(nameInput, 'Bob');

        // user.type calls setPlayerName for each character typed (B, o, b)
        expect(mockSetPlayerName).toHaveBeenCalledTimes(3);
        expect(mockSetPlayerName).toHaveBeenNthCalledWith(1, 'B');
        expect(mockSetPlayerName).toHaveBeenNthCalledWith(2, 'o');
        expect(mockSetPlayerName).toHaveBeenNthCalledWith(3, 'b');
      });

      it('calls onAddPlayer when Add Player button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnAddPlayer = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            showInlineAddPlayer={true}
            onAddPlayer={mockOnAddPlayer}
          />
        );

        const addButton = screen.getByRole('button', { name: 'Add Player' });
        await user.click(addButton);

        expect(mockOnAddPlayer).toHaveBeenCalledTimes(1);
      });

      it('calls onCancel when Cancel button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnCancel = vi.fn();

        render(
          <AddPlayerInterface
            {...defaultProps}
            showInlineAddPlayer={true}
            onCancel={mockOnCancel}
          />
        );

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await user.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('form accessibility', () => {
      it('has proper form structure with labels', () => {
        render(
          <AddPlayerInterface {...defaultProps} showInlineAddPlayer={true} />
        );

        const input = screen.getByLabelText('Player Name');
        expect(input).toHaveAttribute('id', 'player-name');

        const label = screen.getByText('Player Name');
        expect(label).toHaveAttribute('for', 'player-name');
      });

      it('has semantic heading', () => {
        render(
          <AddPlayerInterface {...defaultProps} showInlineAddPlayer={true} />
        );

        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent('Add New Player');
      });

      it('has accessible buttons', () => {
        render(
          <AddPlayerInterface {...defaultProps} showInlineAddPlayer={true} />
        );

        expect(
          screen.getByRole('button', { name: 'Add Player' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty starting deck composition as falsy', () => {
      const gameWithEmptyComposition = {
        ...mockGame,
        startingDeckComposition: {},
      };

      render(
        <AddPlayerInterface {...defaultProps} game={gameWithEmptyComposition} />
      );

      expect(
        screen.getByText('Set starting deck composition first')
      ).toBeInTheDocument();
    });

    it('handles very long player names gracefully', async () => {
      const user = userEvent.setup();
      const mockSetPlayerName = vi.fn();

      render(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={true}
          setPlayerName={mockSetPlayerName}
        />
      );

      const nameInput = screen.getByLabelText('Player Name');
      const longName =
        'This is an extremely long player name that might cause issues';

      await user.type(nameInput, longName);
      // user.type calls setPlayerName for each character, so check if it was called
      expect(mockSetPlayerName).toHaveBeenCalledTimes(longName.length);
    });

    it('handles special characters in player names', async () => {
      const user = userEvent.setup();
      const mockSetPlayerName = vi.fn();

      render(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={true}
          setPlayerName={mockSetPlayerName}
        />
      );

      const nameInput = screen.getByLabelText('Player Name');
      const specialName = 'Player!@#$%^&*()_+-=';

      await user.type(nameInput, specialName);
      // user.type calls setPlayerName for each character, so check if it was called
      expect(mockSetPlayerName).toHaveBeenCalledTimes(specialName.length);
    });

    it('maintains form state when switching between modes', () => {
      const { rerender } = render(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={true}
          playerName="Alice"
        />
      );

      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();

      // Switch to placeholder mode
      rerender(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={false}
          playerName="Alice"
        />
      );

      expect(screen.getByText('Add Player')).toBeInTheDocument();

      // Switch back to form mode
      rerender(
        <AddPlayerInterface
          {...defaultProps}
          showInlineAddPlayer={true}
          playerName="Alice"
        />
      );

      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    });
  });
});
