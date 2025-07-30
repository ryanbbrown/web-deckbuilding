import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DeckCompositionBanner } from '../DeckCompositionBanner';

describe('DeckCompositionBanner Component', () => {
  const defaultProps = {
    deckComposition: {
      'card-1': 3,
      'card-2': 2,
      'card-3': 1,
    },
    totalDeckSize: 6,
    getCardNameFromUid: vi.fn((uid: string) => {
      const parts = uid.split('-');
      return parts.length > 1 ? `Card ${parts[1]}` : `Card ${uid}`;
    }),
    updateDeckQuantity: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DeckCompositionBanner {...defaultProps} />);
  });

  it('displays the main title and instructions', () => {
    render(<DeckCompositionBanner {...defaultProps} />);

    expect(
      screen.getByText('Setting Starting Deck Composition')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Click cards below to add/remove them from the starting deck'
      )
    ).toBeInTheDocument();
  });

  it('displays current deck size when totalDeckSize > 0', () => {
    render(<DeckCompositionBanner {...defaultProps} />);

    expect(screen.getByText('Current deck size: 6 cards')).toBeInTheDocument();
  });

  it('does not display deck size when totalDeckSize is 0', () => {
    render(<DeckCompositionBanner {...defaultProps} totalDeckSize={0} />);

    expect(screen.queryByText(/Current deck size:/)).not.toBeInTheDocument();
  });

  it('renders Save Composition and Cancel buttons', () => {
    render(<DeckCompositionBanner {...defaultProps} />);

    expect(screen.getByText('Save Composition')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSave when Save Composition button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeckCompositionBanner {...defaultProps} />);

    const saveButton = screen.getByText('Save Composition');
    await user.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeckCompositionBanner {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  describe('deck composition display', () => {
    it('displays deck composition cards when composition is not empty', () => {
      render(<DeckCompositionBanner {...defaultProps} />);

      expect(screen.getByText('Card 1: 3')).toBeInTheDocument();
      expect(screen.getByText('Card 2: 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3: 1')).toBeInTheDocument();
    });

    it('does not display deck composition when composition is empty', () => {
      render(<DeckCompositionBanner {...defaultProps} deckComposition={{}} />);

      expect(screen.queryByText(/Card \d+:/)).not.toBeInTheDocument();
    });

    it('calls getCardNameFromUid for each card in composition', () => {
      render(<DeckCompositionBanner {...defaultProps} />);

      expect(defaultProps.getCardNameFromUid).toHaveBeenCalledWith('card-1');
      expect(defaultProps.getCardNameFromUid).toHaveBeenCalledWith('card-2');
      expect(defaultProps.getCardNameFromUid).toHaveBeenCalledWith('card-3');
      expect(defaultProps.getCardNameFromUid).toHaveBeenCalledTimes(3);
    });

    it('renders remove buttons for each card in composition', () => {
      render(<DeckCompositionBanner {...defaultProps} />);

      const removeButtons = screen.getAllByText('-');
      expect(removeButtons).toHaveLength(3);
    });

    it('calls updateDeckQuantity with correct parameters when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeckCompositionBanner {...defaultProps} />);

      const removeButtons = screen.getAllByText('-');
      await user.click(removeButtons[0]);

      expect(defaultProps.updateDeckQuantity).toHaveBeenCalledWith(
        'card-1',
        false
      );
    });
  });

  describe('edge cases', () => {
    it('handles single card in composition', () => {
      const singleCardProps = {
        ...defaultProps,
        deckComposition: { 'single-card': 1 },
        totalDeckSize: 1,
      };

      render(<DeckCompositionBanner {...singleCardProps} />);

      expect(
        screen.getByText('Current deck size: 1 cards')
      ).toBeInTheDocument();
      expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('handles large quantities correctly', () => {
      const largeQuantityProps = {
        ...defaultProps,
        deckComposition: { 'mega-card': 99 },
        totalDeckSize: 99,
      };

      render(<DeckCompositionBanner {...largeQuantityProps} />);

      expect(screen.getByText('Card card: 99')).toBeInTheDocument();
      expect(
        screen.getByText('Current deck size: 99 cards')
      ).toBeInTheDocument();
    });
  });
});
