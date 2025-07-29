import React from 'react';
import { CardInstance, Zone } from '@/features/cards/types';
import { ZONE_CONFIGS } from '@/types/ui';

interface CardZoneProps {
  zone: Zone;
  cards: CardInstance[];
  onCardClick: (
    card: CardInstance,
    zone: Zone,
    event: React.MouseEvent
  ) => void;
  className?: string;
}

export function CardZone({
  zone,
  cards,
  onCardClick,
  className,
}: CardZoneProps) {
  const config = ZONE_CONFIGS[zone];

  const getZoneContent = () => {
    if (zone === Zone.DECK) {
      // Deck shows just count and status
      return (
        <div className="bg-blue-100 rounded p-2 text-center text-sm text-blue-800">
          {cards.length > 0 ? 'Cards available' : config.emptyMessage}
        </div>
      );
    }

    if (zone === Zone.DISCARD) {
      // Discard shows most recent card
      return (
        <div className="bg-red-100 rounded p-2 text-center text-sm text-red-800">
          {cards.length > 0
            ? cards[cards.length - 1].definition.name
            : config.emptyMessage}
        </div>
      );
    }

    // Hand and Play Area show individual clickable cards
    if (cards.length === 0) {
      return (
        <p className="text-sm text-gray-500 text-center">
          {config.emptyMessage}
        </p>
      );
    }

    const bgColor =
      config.colorScheme === 'green'
        ? 'bg-green-200 text-green-800 hover:bg-green-300'
        : config.colorScheme === 'yellow'
          ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

    return (
      <div className="flex gap-2 flex-wrap">
        {cards.map((card) => (
          <span
            key={card.instanceId}
            className={`${bgColor} px-2 py-1 rounded text-xs cursor-pointer transition-colors`}
            data-card-clickable="true"
            onClick={(e) => onCardClick(card, zone, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Create a synthetic mouse event for the keyboard interaction
                const syntheticEvent = {
                  ...e,
                  clientX: 0,
                  clientY: 0,
                  button: 0,
                  buttons: 1,
                  movementX: 0,
                  movementY: 0,
                  pageX: 0,
                  pageY: 0,
                  relatedTarget: null,
                  screenX: 0,
                  screenY: 0,
                } as unknown as React.MouseEvent;
                onCardClick(card, zone, syntheticEvent);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {card.definition.name}
          </span>
        ))}
      </div>
    );
  };

  const bgColorClass =
    config.colorScheme === 'blue'
      ? 'bg-blue-50'
      : config.colorScheme === 'red'
        ? 'bg-red-50'
        : config.colorScheme === 'green'
          ? 'bg-green-50'
          : config.colorScheme === 'yellow'
            ? 'bg-yellow-50'
            : 'bg-gray-50';

  return (
    <div
      className={`border border-gray-200 bg-gray-50 rounded p-3 ${config.gridSpan || ''} ${className || ''}`}
    >
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        {config.title} ({cards.length})
      </h4>
      <div className={`min-h-16 ${bgColorClass} rounded p-2`}>
        {getZoneContent()}
      </div>
    </div>
  );
}
