import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DeckComposition } from '../DeckComposition';
import { CardInstance, Zone } from '@/features/cards/types';

const createMockCard = (name: string, instanceId: string): CardInstance => ({
  definition: {
    name,
    text: `${name} card`,
    cost: 0,
    uid: `${name}-uid`,
  },
  zone: Zone.DECK,
  instanceId,
});

describe('DeckComposition', () => {
  it('displays "No cards in deck" when allCards is empty', () => {
    render(<DeckComposition allCards={[]} />);
    expect(screen.getByText('No cards in deck')).toBeInTheDocument();
  });

  it('displays single card count correctly', () => {
    const allCards = [createMockCard('Copper', 'copper-1')];
    render(<DeckComposition allCards={allCards} />);

    expect(screen.getByText('Deck Composition:')).toBeInTheDocument();
    expect(screen.getByText('Copper (1)')).toBeInTheDocument();
  });

  it('displays multiple different cards correctly', () => {
    const allCards = [
      createMockCard('Copper', 'copper-1'),
      createMockCard('Estate', 'estate-1'),
      createMockCard('Silver', 'silver-1'),
    ];
    render(<DeckComposition allCards={allCards} />);

    expect(screen.getByText('Deck Composition:')).toBeInTheDocument();
    expect(
      screen.getByText('Copper (1), Estate (1), Silver (1)')
    ).toBeInTheDocument();
  });

  it('counts duplicate cards correctly', () => {
    const allCards = [
      createMockCard('Copper', 'copper-1'),
      createMockCard('Copper', 'copper-2'),
      createMockCard('Copper', 'copper-3'),
      createMockCard('Estate', 'estate-1'),
      createMockCard('Estate', 'estate-2'),
    ];
    render(<DeckComposition allCards={allCards} />);

    expect(screen.getByText('Deck Composition:')).toBeInTheDocument();
    expect(screen.getByText('Copper (3), Estate (2)')).toBeInTheDocument();
  });

  it('handles mixed card types and counts', () => {
    const allCards = [
      createMockCard('Copper', 'copper-1'),
      createMockCard('Copper', 'copper-2'),
      createMockCard('Copper', 'copper-3'),
      createMockCard('Copper', 'copper-4'),
      createMockCard('Copper', 'copper-5'),
      createMockCard('Copper', 'copper-6'),
      createMockCard('Copper', 'copper-7'),
      createMockCard('Estate', 'estate-1'),
      createMockCard('Estate', 'estate-2'),
      createMockCard('Estate', 'estate-3'),
    ];
    render(<DeckComposition allCards={allCards} />);

    expect(screen.getByText('Deck Composition:')).toBeInTheDocument();
    expect(screen.getByText('Copper (7), Estate (3)')).toBeInTheDocument();
  });
});
