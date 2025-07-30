import React, { useState } from 'react';
import {
  processBulkCardInput,
  BulkParseResult,
} from '@/features/market/services';

interface BulkAddCardModalProps {
  onAddCards: (cards: BulkParseResult) => void;
  onClose: () => void;
}

export function BulkAddCardModal({
  onAddCards,
  onClose,
}: BulkAddCardModalProps) {
  const [bulkInput, setBulkInput] = useState('');

  const handleSubmit = () => {
    if (!bulkInput.trim()) {
      return;
    }

    try {
      const result = processBulkCardInput(bulkInput);
      onAddCards(result);

      // Only close modal if there were no errors
      if (result.success) {
        setBulkInput('');
        onClose();
      }
    } catch (error) {
      console.error('Error processing bulk card input:', error);
      // Let the parent handle the error display
      const errorResult: BulkParseResult = {
        success: false,
        cards: [],
        errors: ['Unexpected error occurred while processing cards'],
        totalLines: 0,
        successfulLines: 0,
      };
      onAddCards(errorResult);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exampleText = `Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|Best treasure card|3`;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Multiple Cards to Market
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="bulk-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Card Data (one card per line)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Format: name|description|cost (use pipe | to separate fields)
            </p>
            <textarea
              id="bulk-input"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={exampleText}
              rows={8}
            />
            <p className="text-xs text-gray-400 mt-1">
              Tip: Press Ctrl+Enter (or Cmd+Enter) to submit
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm font-medium text-gray-700 mb-1">Example:</p>
            <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
              {exampleText}
            </pre>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={!bulkInput.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Cards
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
