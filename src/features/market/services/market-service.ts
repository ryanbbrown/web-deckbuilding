import { CardDefinition } from '@/features/cards/types';
import { createCardDefinition } from '@/features/cards/services';

export interface BulkParseResult {
  success: boolean;
  cards: CardDefinition[];
  errors: string[];
  totalLines: number;
  successfulLines: number;
}

/**
 * Parses bulk card input in pipe-delimited format: name|description|cost
 * Each line represents one card. Empty lines are ignored.
 *
 * @param input - Multi-line string with pipe-delimited card data
 * @returns BulkParseResult with parsed cards and any errors
 */
export function parseBulkCardInput(input: string): BulkParseResult {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      cards: [],
      errors: ['No valid input lines found'],
      totalLines: 0,
      successfulLines: 0,
    };
  }

  const cards: CardDefinition[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const parts = line.split('|');

    // Check if line has exactly 3 parts
    if (parts.length !== 3) {
      errors.push(
        `Line ${lineNumber}: Expected 3 fields separated by |, got ${parts.length}. Format: name|description|cost`
      );
      return;
    }

    const [name, description, costStr] = parts.map((part) => part.trim());

    // Validate name
    if (!name) {
      errors.push(`Line ${lineNumber}: Card name cannot be empty`);
      return;
    }

    // Validate description
    if (!description) {
      errors.push(`Line ${lineNumber}: Card description cannot be empty`);
      return;
    }

    // Validate and parse cost
    const cost = parseInt(costStr, 10);
    if (isNaN(cost) || cost < 0) {
      errors.push(
        `Line ${lineNumber}: Cost must be a non-negative number, got "${costStr}"`
      );
      return;
    }

    // Create card definition if validation passed
    try {
      const cardDefinition = createCardDefinition(name, description, cost);
      cards.push(cardDefinition);
    } catch (error) {
      errors.push(
        `Line ${lineNumber}: Failed to create card "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  return {
    success: errors.length === 0,
    cards,
    errors,
    totalLines: lines.length,
    successfulLines: cards.length,
  };
}

/**
 * Validates that card names are unique within a batch
 * @param cards - Array of card definitions to validate
 * @returns Array of error messages for duplicate names
 */
export function validateUniqueCardNames(cards: CardDefinition[]): string[] {
  const nameMap = new Map<string, number>();
  const errors: string[] = [];

  cards.forEach((card, index) => {
    const lowerName = card.name.toLowerCase();
    if (nameMap.has(lowerName)) {
      const firstIndex = nameMap.get(lowerName)!;
      errors.push(
        `Duplicate card name "${card.name}" found at positions ${firstIndex + 1} and ${index + 1}`
      );
    } else {
      nameMap.set(lowerName, index);
    }
  });

  return errors;
}

/**
 * Complete bulk card processing with validation
 * ALL-OR-NOTHING: If any errors occur, no cards are returned as valid.
 * @param input - Multi-line string with pipe-delimited card data
 * @returns BulkParseResult with full validation
 */
export function processBulkCardInput(input: string): BulkParseResult {
  const parseResult = parseBulkCardInput(input);

  // Always run duplicate validation on any cards that were successfully parsed
  // even if there were parsing errors for other lines
  const uniqueNameErrors =
    parseResult.cards.length > 0
      ? validateUniqueCardNames(parseResult.cards)
      : [];

  // Combine all errors (parsing + duplicates)
  const allErrors = [...parseResult.errors, ...uniqueNameErrors];
  const hasAnyErrors = allErrors.length > 0;

  return {
    success: !hasAnyErrors,
    cards: hasAnyErrors ? [] : parseResult.cards, // All-or-nothing: no cards if any errors
    errors: allErrors,
    totalLines: parseResult.totalLines,
    successfulLines: hasAnyErrors ? 0 : parseResult.successfulLines, // 0 if any errors
  };
}
