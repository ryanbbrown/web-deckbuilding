import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseBulkCardInput,
  validateUniqueCardNames,
  processBulkCardInput,
} from '../services/market-service';
import { createCardDefinition } from '@/features/cards/services';

// Mock the card service
vi.mock('@/features/cards/services', () => ({
  createCardDefinition: vi.fn(),
}));

const mockCreateCardDefinition = vi.mocked(createCardDefinition);

describe('Market Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    mockCreateCardDefinition.mockImplementation((name, text, cost) => ({
      name,
      text,
      cost: cost ?? 0,
      uid: `mock-uid-${name.toLowerCase().replace(/\s+/g, '-')}`,
    }));
  });

  describe('parseBulkCardInput', () => {
    it('should parse valid input successfully', () => {
      const input = `Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|Best treasure card|3`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(true);
      expect(result.cards).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.totalLines).toBe(3);
      expect(result.successfulLines).toBe(3);

      expect(result.cards[0]).toEqual({
        name: 'Copper',
        text: 'Basic treasure card',
        cost: 1,
        uid: 'mock-uid-copper',
      });
    });

    it('should handle empty input', () => {
      const result = parseBulkCardInput('');

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0);
      expect(result.errors).toEqual(['No valid input lines found']);
      expect(result.totalLines).toBe(0);
      expect(result.successfulLines).toBe(0);
    });

    it('should handle input with only whitespace', () => {
      const result = parseBulkCardInput('   \n  \n\t  ');

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0);
      expect(result.errors).toEqual(['No valid input lines found']);
    });

    it('should ignore empty lines and parse valid ones', () => {
      const input = `Copper|Basic treasure card|1

Silver|Better treasure card|2

Gold|Best treasure card|3`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(true);
      expect(result.cards).toHaveLength(3);
      expect(result.totalLines).toBe(3);
      expect(result.successfulLines).toBe(3);
    });

    it('should handle incorrect number of fields', () => {
      const input = `Copper|Basic treasure card
Silver|Better treasure card|2|extra
Gold|Best treasure card|3`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(1); // Only Gold is valid
      expect(result.errors).toEqual([
        'Line 1: Expected 3 fields separated by |, got 2. Format: name|description|cost',
        'Line 2: Expected 3 fields separated by |, got 4. Format: name|description|cost',
      ]);
      expect(result.totalLines).toBe(3);
      expect(result.successfulLines).toBe(1);
    });

    it('should handle empty name field', () => {
      const input = `|Basic treasure card|1
Silver|Better treasure card|2`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(1);
      expect(result.errors).toEqual(['Line 1: Card name cannot be empty']);
    });

    it('should handle empty description field', () => {
      const input = `Copper||1
Silver|Better treasure card|2`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(1);
      expect(result.errors).toEqual([
        'Line 1: Card description cannot be empty',
      ]);
    });

    it('should handle invalid cost values', () => {
      const input = `Copper|Basic treasure card|abc
Silver|Better treasure card|-1
Gold|Best treasure card|3.5
Platinum|Expensive treasure|10`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(2); // Gold (3.5 -> 3) and Platinum are valid (for parsing only)
      expect(result.errors).toEqual([
        'Line 1: Cost must be a non-negative number, got "abc"',
        'Line 2: Cost must be a non-negative number, got "-1"',
      ]);
    });

    it('should handle zero cost', () => {
      const input = `Free Card|No cost card|0`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(true);
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].cost).toBe(0);
    });

    it('should trim whitespace from fields', () => {
      const input = `  Copper  |  Basic treasure card  |  1  `;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(true);
      expect(result.cards[0]).toEqual({
        name: 'Copper',
        text: 'Basic treasure card',
        cost: 1,
        uid: 'mock-uid-copper',
      });
    });

    it('should handle createCardDefinition throwing an error', () => {
      mockCreateCardDefinition.mockImplementationOnce(() => {
        throw new Error('Card creation failed');
      });

      const input = `Copper|Basic treasure card|1`;

      const result = parseBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0);
      expect(result.errors).toEqual([
        'Line 1: Failed to create card "Copper": Card creation failed',
      ]);
    });
  });

  describe('validateUniqueCardNames', () => {
    it('should pass with unique names', () => {
      const cards = [
        { name: 'Copper', text: 'desc1', cost: 1, uid: 'uid1' },
        { name: 'Silver', text: 'desc2', cost: 2, uid: 'uid2' },
        { name: 'Gold', text: 'desc3', cost: 3, uid: 'uid3' },
      ];

      const errors = validateUniqueCardNames(cards);

      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate names (case insensitive)', () => {
      const cards = [
        { name: 'Copper', text: 'desc1', cost: 1, uid: 'uid1' },
        { name: 'Silver', text: 'desc2', cost: 2, uid: 'uid2' },
        { name: 'copper', text: 'desc3', cost: 3, uid: 'uid3' },
        { name: 'SILVER', text: 'desc4', cost: 4, uid: 'uid4' },
      ];

      const errors = validateUniqueCardNames(cards);

      expect(errors).toEqual([
        'Duplicate card name "copper" found at positions 1 and 3',
        'Duplicate card name "SILVER" found at positions 2 and 4',
      ]);
    });

    it('should handle empty array', () => {
      const errors = validateUniqueCardNames([]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('processBulkCardInput', () => {
    it('should process valid input without duplicates', () => {
      const input = `Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|Best treasure card|3`;

      const result = processBulkCardInput(input);

      expect(result.success).toBe(true);
      expect(result.cards).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.successfulLines).toBe(3);
    });

    it('should fail completely when only duplicates exist (no parsing errors)', () => {
      const input = `Copper|Basic treasure card|1
Copper|Another copper card|2`;

      const result = processBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0); // No cards due to duplicate error
      expect(result.successfulLines).toBe(0);
      expect(result.errors).toEqual([
        'Duplicate card name "Copper" found at positions 1 and 2',
      ]);
    });

    it('should detect parsing errors and duplicate names - all-or-nothing', () => {
      const input = `Copper|Basic treasure card|1
|Empty name|2
Copper|Duplicate copper|3`;

      const result = processBulkCardInput(input);

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0); // No cards returned due to errors (all-or-nothing)
      expect(result.successfulLines).toBe(0); // No successful lines due to errors
      expect(result.errors).toEqual([
        'Line 2: Card name cannot be empty',
        'Duplicate card name "Copper" found at positions 1 and 2',
      ]);
    });

    it('should handle empty input', () => {
      const result = processBulkCardInput('');

      expect(result.success).toBe(false);
      expect(result.cards).toHaveLength(0);
      expect(result.errors).toEqual(['No valid input lines found']);
    });
  });
});
