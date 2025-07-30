import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AddCardModal } from '../AddCardModal';

describe('AddCardModal Component', () => {
  const defaultCardForm = {
    name: '',
    text: '',
    cost: 0,
  };

  const defaultProps = {
    cardForm: defaultCardForm,
    setCardForm: vi.fn(),
    onAddCard: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AddCardModal {...defaultProps} />);
  });

  it('displays the modal title', () => {
    render(<AddCardModal {...defaultProps} />);

    expect(screen.getByText('Add Card to Market')).toBeInTheDocument();
  });

  describe('form fields', () => {
    it('renders all form fields with correct labels', () => {
      render(<AddCardModal {...defaultProps} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Text')).toBeInTheDocument();
      expect(screen.getByLabelText('Cost')).toBeInTheDocument();
    });

    it('displays current form values', () => {
      const populatedForm = {
        name: 'Fire Spell',
        text: 'Deal 3 damage',
        cost: 2,
      };

      render(<AddCardModal {...defaultProps} cardForm={populatedForm} />);

      expect(screen.getByDisplayValue('Fire Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Deal 3 damage')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    });

    it('shows correct placeholders', () => {
      render(<AddCardModal {...defaultProps} />);

      expect(screen.getByPlaceholderText('Card name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Card description')
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('calls setCardForm when name input changes', async () => {
      const user = userEvent.setup();
      render(<AddCardModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'Lightning Bolt');

      expect(defaultProps.setCardForm).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('calls setCardForm when text input changes', async () => {
      const user = userEvent.setup();
      render(<AddCardModal {...defaultProps} />);

      const textInput = screen.getByLabelText('Text');
      await user.type(textInput, 'A powerful spell');

      expect(defaultProps.setCardForm).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('calls setCardForm when cost input changes', async () => {
      const user = userEvent.setup();
      render(<AddCardModal {...defaultProps} />);

      const costInput = screen.getByLabelText('Cost');
      await user.clear(costInput);
      await user.type(costInput, '5');

      expect(defaultProps.setCardForm).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('calls setCardForm when name input changes', async () => {
      const user = userEvent.setup();
      let mockSetCardForm = vi.fn();

      render(<AddCardModal {...defaultProps} setCardForm={mockSetCardForm} />);

      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'T');

      // setCardForm should be called once for the typed character
      expect(mockSetCardForm).toHaveBeenCalledTimes(1);
      expect(mockSetCardForm).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls setCardForm when text input changes', async () => {
      const user = userEvent.setup();
      let mockSetCardForm = vi.fn();

      render(<AddCardModal {...defaultProps} setCardForm={mockSetCardForm} />);

      const textInput = screen.getByLabelText('Text');
      await user.type(textInput, 'T');

      // setCardForm should be called once for the typed character
      expect(mockSetCardForm).toHaveBeenCalledTimes(1);
      expect(mockSetCardForm).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls setCardForm when cost input changes', async () => {
      const user = userEvent.setup();
      let mockSetCardForm = vi.fn();

      render(<AddCardModal {...defaultProps} setCardForm={mockSetCardForm} />);

      const costInput = screen.getByLabelText('Cost');
      await user.clear(costInput);
      await user.type(costInput, '7');

      // setCardForm should be called for clear and type actions
      expect(mockSetCardForm).toHaveBeenCalled();
      expect(mockSetCardForm).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles invalid cost input by defaulting to 0', async () => {
      const user = userEvent.setup();
      let mockSetCardForm = vi.fn();

      render(<AddCardModal {...defaultProps} setCardForm={mockSetCardForm} />);

      const costInput = screen.getByLabelText('Cost');
      await user.clear(costInput);
      await user.type(costInput, 'invalid');

      // Get the function passed to setCardForm and test it
      const updateFunction = mockSetCardForm.mock.calls[0][0] as (prev: {
        name: string;
        text: string;
        cost: number;
      }) => { name: string; text: string; cost: number };
      const result = updateFunction({ name: '', text: '', cost: 0 });

      expect(result).toEqual({
        name: '',
        text: '',
        cost: 0,
      });
    });
  });

  describe('action buttons', () => {
    it('renders Add Card and Cancel buttons', () => {
      render(<AddCardModal {...defaultProps} />);

      expect(screen.getByText('Add Card')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onAddCard when Add Card button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddCardModal {...defaultProps} />);

      const addButton = screen.getByText('Add Card');
      await user.click(addButton);

      expect(defaultProps.onAddCard).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddCardModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('form validation attributes', () => {
    it('has correct input types', () => {
      render(<AddCardModal {...defaultProps} />);

      const nameInput = screen.getByLabelText('Name');
      const textInput = screen.getByLabelText('Text');
      const costInput = screen.getByLabelText('Cost');

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(textInput.tagName.toLowerCase()).toBe('textarea');
      expect(costInput).toHaveAttribute('type', 'number');
    });

    it('has correct input attributes', () => {
      render(<AddCardModal {...defaultProps} />);

      const costInput = screen.getByLabelText('Cost');
      expect(costInput).toHaveAttribute('min', '0');

      const textInput = screen.getByLabelText('Text');
      expect(textInput).toHaveAttribute('rows', '3');
    });

    it('has correct input ids and for attributes', () => {
      render(<AddCardModal {...defaultProps} />);

      const nameLabel = screen.getByText('Name');
      const textLabel = screen.getByText('Text');
      const costLabel = screen.getByText('Cost');

      expect(nameLabel).toHaveAttribute('for', 'card-name');
      expect(textLabel).toHaveAttribute('for', 'card-text');
      expect(costLabel).toHaveAttribute('for', 'card-cost');

      expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'card-name');
      expect(screen.getByLabelText('Text')).toHaveAttribute('id', 'card-text');
      expect(screen.getByLabelText('Cost')).toHaveAttribute('id', 'card-cost');
    });
  });

  describe('accessibility', () => {
    it('has proper form structure with labels', () => {
      render(<AddCardModal {...defaultProps} />);

      // All inputs should be properly labeled
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Text')).toBeInTheDocument();
      expect(screen.getByLabelText('Cost')).toBeInTheDocument();
    });

    it('has semantic heading', () => {
      render(<AddCardModal {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Add Card to Market');
    });
  });
});
