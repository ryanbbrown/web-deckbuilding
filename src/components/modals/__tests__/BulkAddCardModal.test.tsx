import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkAddCardModal } from '../BulkAddCardModal';
import * as marketService from '@/features/market/services';

// Mock the market service
vi.mock('@/features/market/services', () => ({
  processBulkCardInput: vi.fn(),
}));

const mockProcessBulkCardInput = vi.mocked(marketService.processBulkCardInput);

describe('BulkAddCardModal', () => {
  const mockOnAddCards = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BulkAddCardModal onAddCards={mockOnAddCards} onClose={mockOnClose} />
    );
  };

  it('should render the modal with correct title and elements', () => {
    renderComponent();

    expect(
      screen.getByText('Add Multiple Cards to Market')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Data/)).toBeInTheDocument();
    expect(
      screen.getByText(/Format: name\|description\|cost/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Cards' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should show example text in placeholder and example section', () => {
    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    expect(textarea).toHaveAttribute('placeholder');
    expect(textarea.getAttribute('placeholder')).toContain(
      'Copper|Basic treasure card|1'
    );

    expect(screen.getByText('Example:')).toBeInTheDocument();
    expect(
      screen.getByText(/Copper\|Basic treasure card\|1/)
    ).toBeInTheDocument();
  });

  it('should disable Add Cards button when input is empty', () => {
    renderComponent();

    const addButton = screen.getByRole('button', { name: 'Add Cards' });
    expect(addButton).toBeDisabled();
  });

  it('should enable Add Cards button when input has content', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    await user.type(textarea, 'Test Card|Test Description|1');

    expect(addButton).not.toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should process input and call onAddCards when Add Cards is clicked', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      cards: [
        {
          name: 'Test Card',
          text: 'Test Description',
          cost: 1,
          uid: 'test-uid',
        },
      ],
      errors: [],
      totalLines: 1,
      successfulLines: 1,
    };

    mockProcessBulkCardInput.mockReturnValue(mockResult);

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    await user.type(textarea, 'Test Card|Test Description|1');
    await user.click(addButton);

    expect(mockProcessBulkCardInput).toHaveBeenCalledWith(
      'Test Card|Test Description|1'
    );
    expect(mockOnAddCards).toHaveBeenCalledWith(mockResult);
  });

  it('should close modal and clear input when processing is successful', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      cards: [
        {
          name: 'Test Card',
          text: 'Test Description',
          cost: 1,
          uid: 'test-uid',
        },
      ],
      errors: [],
      totalLines: 1,
      successfulLines: 1,
    };

    mockProcessBulkCardInput.mockReturnValue(mockResult);

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    await user.type(textarea, 'Test Card|Test Description|1');
    await user.click(addButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('');
  });

  it('should not close modal when processing has errors', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: false,
      cards: [],
      errors: ['Line 1: Card name cannot be empty'],
      totalLines: 1,
      successfulLines: 0,
    };

    mockProcessBulkCardInput.mockReturnValue(mockResult);

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    await user.type(textarea, '|Description|1');
    await user.click(addButton);

    expect(mockOnAddCards).toHaveBeenCalledWith(mockResult);
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('|Description|1');
  });

  it('should handle Ctrl+Enter keyboard shortcut', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      cards: [
        {
          name: 'Test Card',
          text: 'Test Description',
          cost: 1,
          uid: 'test-uid',
        },
      ],
      errors: [],
      totalLines: 1,
      successfulLines: 1,
    };

    mockProcessBulkCardInput.mockReturnValue(mockResult);

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    await user.type(textarea, 'Test Card|Test Description|1');

    // Simulate Ctrl+Enter
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(mockProcessBulkCardInput).toHaveBeenCalledWith(
      'Test Card|Test Description|1'
    );
    expect(mockOnAddCards).toHaveBeenCalledWith(mockResult);
  });

  it('should handle Cmd+Enter keyboard shortcut', async () => {
    const user = userEvent.setup();
    const mockResult = {
      success: true,
      cards: [
        {
          name: 'Test Card',
          text: 'Test Description',
          cost: 1,
          uid: 'test-uid',
        },
      ],
      errors: [],
      totalLines: 1,
      successfulLines: 1,
    };

    mockProcessBulkCardInput.mockReturnValue(mockResult);

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    await user.type(textarea, 'Test Card|Test Description|1');

    // Simulate Cmd+Enter
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(mockProcessBulkCardInput).toHaveBeenCalledWith(
      'Test Card|Test Description|1'
    );
    expect(mockOnAddCards).toHaveBeenCalledWith(mockResult);
  });

  it('should handle unexpected errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockProcessBulkCardInput.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    await user.type(textarea, 'Test Card|Test Description|1');
    await user.click(addButton);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing bulk card input:',
      expect.any(Error)
    );
    expect(mockOnAddCards).toHaveBeenCalledWith({
      success: false,
      cards: [],
      errors: ['Unexpected error occurred while processing cards'],
      totalLines: 0,
      successfulLines: 0,
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not process empty or whitespace-only input', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByLabelText(/Card Data/);
    const addButton = screen.getByRole('button', { name: 'Add Cards' });

    // Try with empty input
    await user.click(addButton);
    expect(mockProcessBulkCardInput).not.toHaveBeenCalled();

    // Try with whitespace only
    await user.type(textarea, '   \n  \t  ');
    await user.click(addButton);
    expect(mockProcessBulkCardInput).not.toHaveBeenCalled();
  });
});
