import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner Component', () => {
  const defaultProps = {
    message: 'Something went wrong!',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ErrorBanner {...defaultProps} />);
  });

  it('displays the provided error message', () => {
    const customMessage = 'Database connection failed';
    render(<ErrorBanner {...defaultProps} message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays the warning icon', () => {
    render(<ErrorBanner {...defaultProps} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders the close button', () => {
    render(<ErrorBanner {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('×');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<ErrorBanner {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('different error messages', () => {
    const testMessages = [
      'Network error occurred',
      'Invalid input provided',
      'Server is temporarily unavailable',
    ];

    testMessages.forEach((message) => {
      it(`displays "${message}" correctly`, () => {
        render(<ErrorBanner {...defaultProps} message={message} />);
        expect(screen.getByText(message)).toBeInTheDocument();
      });
    });
  });
});
