import React, { useEffect, useState } from 'react';
import useGameStore from '@/store/game-store';
import useMarketStore from '@/store/market-store';
import usePlayerStore from '@/store/player-store';
import { CardDefinition, CardInstance, Zone } from '@/features/cards/types';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { Footer } from '@/components/common/Footer';
import { GameHeader } from '@/components/GameHeader';
import { DeckCompositionBanner } from '@/components/DeckCompositionBanner';
import { MarketSection } from '@/components/market/MarketSection';
import { PlayersSection } from '@/components/players/PlayersSection';
import { AddCardModal } from '@/components/modals/AddCardModal';
import { BulkAddCardModal } from '@/components/modals/BulkAddCardModal';
import { CardContextMenu } from '@/components/modals/CardContextMenu';
import './App.css';

function App() {
  const createGame = useGameStore((state) => state.createGame);
  const game = useGameStore((state) => state.game);

  const addCardToMarket = useGameStore((state) => state.addCardToMarket);
  const addMultipleCardsToMarket = useGameStore(
    (state) => state.addMultipleCardsToMarket
  );
  const setStartingDeckComposition = useGameStore(
    (state) => state.setStartingDeckComposition
  );
  const addPlayerToGame = useGameStore((state) => state.addPlayerToGame);
  const getMarketCards = useMarketStore((state) => state.getMarketCards);
  const drawPlayerCard = usePlayerStore((state) => state.drawPlayerCard);
  const drawPlayerHand = usePlayerStore((state) => state.drawPlayerHand);
  const discardAllPlayer = usePlayerStore((state) => state.discardAllPlayer);

  const playerStoreState = usePlayerStore((state) => state.players);
  const moveCardBetweenZones = usePlayerStore(
    (state) => state.moveCardBetweenZones
  );
  const trashPlayerCard = usePlayerStore((state) => state.trashPlayerCard);
  const registerCard = usePlayerStore((state) => state.registerCard);

  // Modal and form state
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBulkAddCardModal, setShowBulkAddCardModal] = useState(false);
  const [isSelectingDeckComposition, setIsSelectingDeckComposition] =
    useState(false);
  const [showInlineAddPlayer, setShowInlineAddPlayer] = useState(false);
  const [cardForm, setCardForm] = useState({ name: '', text: '', cost: 0 });
  const [deckComposition, setDeckComposition] = useState<
    Record<string, number>
  >({});
  const [playerName, setPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    card: CardInstance;
    playerId: string;
    currentZone: Zone;
    position: { x: number; y: number };
  } | null>(null);

  // Initialize game on app start
  useEffect(() => {
    createGame();
  }, [createGame]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const players = playerStoreState ? Object.values(playerStoreState) : [];
  const marketCards = getMarketCards();

  const showError = (message: string) => {
    console.error('App Error:', message);
    setErrorMessage(message);
  };

  const handleAddCard = () => {
    if (cardForm.name && cardForm.text && cardForm.cost >= 0) {
      const cardDefinition: CardDefinition = {
        name: cardForm.name,
        text: cardForm.text,
        cost: cardForm.cost,
        uid: `${cardForm.name}-${Date.now()}`, // Simple UID generation
      };

      try {
        addCardToMarket(cardDefinition);
        setCardForm({ name: '', text: '', cost: 0 });
        setShowAddCardModal(false);
        console.log('Successfully added card to market:', cardDefinition);
      } catch (error) {
        console.error('Failed to add card to market:', error);
        showError('Failed to add card to market. Please try again.');
      }
    } else {
      showError('Please fill in all card fields with valid values.');
    }
  };

  const handleBulkAddCards = (result: {
    success: boolean;
    cards: CardDefinition[];
    errors: string[];
    totalLines: number;
    successfulLines: number;
  }) => {
    try {
      if (result.success && result.cards.length > 0) {
        // All-or-nothing: only add cards if there were no errors
        addMultipleCardsToMarket(result.cards);
        console.log(
          `Successfully added ${result.cards.length} cards to market`
        );
      } else if (!result.success) {
        // Show detailed error information - no cards were added
        const errorSummary = `Failed to add cards. Please fix the following errors: ${result.errors.join('; ')}`;
        showError(errorSummary);
        console.error('Bulk add failed with errors:', result.errors);
      }
    } catch (error) {
      console.error('Failed to add cards to market:', error);
      showError('Failed to add cards to market. Please try again.');
    }
  };

  const handleStartDeckComposition = () => {
    setIsSelectingDeckComposition(true);
    setDeckComposition(game?.startingDeckComposition || {});
  };

  const handleSaveDeckComposition = () => {
    try {
      setStartingDeckComposition(deckComposition);
      setIsSelectingDeckComposition(false);
      console.log('Successfully saved deck composition:', deckComposition);
    } catch (error) {
      console.error('Failed to save deck composition:', error);
      showError('Failed to save deck composition. Please try again.');
    }
  };

  const handleCancelDeckComposition = () => {
    setIsSelectingDeckComposition(false);
    setDeckComposition(game?.startingDeckComposition || {});
  };

  const handleAddPlayer = () => {
    if (!playerName) {
      showError('Please enter a player name.');
      return;
    }

    if (!game) {
      showError('Game not initialized. Please refresh the page.');
      return;
    }

    // Check if starting deck composition is set
    if (
      !game.startingDeckComposition ||
      Object.keys(game.startingDeckComposition).length === 0
    ) {
      showError(
        'Please set a starting deck composition before adding players.'
      );
      return;
    }

    console.log('Attempting to add player:', playerName);
    console.log(
      'Game starting deck composition:',
      game.startingDeckComposition
    );
    console.log('Available market cards:', marketCards);

    const player = {
      name: playerName,
      playerId: `player-${Date.now()}`,
      allCards: [],
      deck: [],
      hand: [],
      played: [],
      discard: [],
    };

    try {
      // Pass all market cards as available card definitions
      const result = addPlayerToGame(player, marketCards);

      console.log('addPlayerToGame result:', result);

      if (result) {
        setPlayerName('');
        setShowInlineAddPlayer(false);
        console.log('Successfully added player:', playerName);
      } else {
        console.error(
          'addPlayerToGame returned false - player creation failed'
        );
        console.log('Debugging info:', {
          player,
          marketCards,
          gameStartingDeck: game.startingDeckComposition,
        });
        showError('Failed to add player. Check console for details.');
      }
    } catch (error) {
      console.error('Exception while adding player:', error);
      showError(
        'An error occurred while adding the player. Check console for details.'
      );
    }
  };

  const handleDrawCard = (playerId: string) => {
    try {
      const result = drawPlayerCard(playerId);
      console.log('Drew card for player:', playerId, 'Result:', result);
      if (!result.drawnCard) {
        showError('No cards available to draw from deck.');
      }
    } catch (error) {
      console.error('Error drawing card:', error);
      showError('Failed to draw card. Check console for details.');
    }
  };

  const handleDrawHand = (playerId: string) => {
    if (!game) {
      showError('Game not initialized.');
      return;
    }

    try {
      const handSize = game.startingHandSize || 5; // Default to 5 if not set
      const result = drawPlayerHand(playerId, handSize);
      console.log(
        'Drew hand for player:',
        playerId,
        'Hand size:',
        handSize,
        'Result:',
        result
      );
      if (result.drawnCards.length === 0) {
        showError('No cards available to draw for hand.');
      }
    } catch (error) {
      console.error('Error drawing hand:', error);
      showError('Failed to draw hand. Check console for details.');
    }
  };

  const handleDiscardAll = (playerId: string) => {
    try {
      discardAllPlayer(playerId);
      console.log('Discarded all cards for player:', playerId);
    } catch (error) {
      console.error('Error discarding all cards:', error);
      showError('Failed to discard all cards. Check console for details.');
    }
  };

  const handleCardClick = (
    card: CardInstance,
    playerId: string,
    currentZone: Zone,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setSelectedCard({
      card,
      playerId,
      currentZone,
      position: { x: event.clientX, y: event.clientY },
    });
    setShowCardMenu(true);
  };

  const handleMoveCard = (toZone: Zone) => {
    if (!selectedCard) return;

    try {
      moveCardBetweenZones(
        selectedCard.playerId,
        selectedCard.card,
        selectedCard.currentZone,
        toZone
      );
      console.log(
        `Moved card from ${selectedCard.currentZone} to ${toZone}:`,
        selectedCard.card
      );
      setShowCardMenu(false);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error moving card:', error);
      showError('Failed to move card. Check console for details.');
    }
  };

  const handleTrashCard = () => {
    if (!selectedCard) return;

    try {
      const success = trashPlayerCard(
        selectedCard.playerId,
        selectedCard.card,
        selectedCard.currentZone
      );
      if (success) {
        console.log(
          `Trashed card from ${selectedCard.currentZone}:`,
          selectedCard.card
        );
        setShowCardMenu(false);
        setSelectedCard(null);
      } else {
        showError(
          'Failed to trash card. Card may not be in a valid zone for trashing.'
        );
      }
    } catch (error) {
      console.error('Error trashing card:', error);
      showError('Failed to trash card. Check console for details.');
    }
  };

  const handleCloseCardMenu = () => {
    setShowCardMenu(false);
    setSelectedCard(null);
  };

  // Close card menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCardMenu) {
        const target = event.target as HTMLElement;
        // Don't close if clicking inside the menu or on a card
        if (
          !target.closest('.fixed') &&
          !target.closest('[data-card-clickable]')
        ) {
          setShowCardMenu(false);
          setSelectedCard(null);
        }
      }
    };

    if (showCardMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCardMenu]);

  const handleDragStart = (
    e: React.DragEvent,
    cardDefinition: CardDefinition
  ) => {
    e.dataTransfer.setData('application/json', JSON.stringify(cardDefinition));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (
    e: React.DragEvent,
    playerId: string,
    zone: Zone = Zone.DISCARD
  ) => {
    e.preventDefault();
    try {
      const cardDefinitionData = e.dataTransfer.getData('application/json');
      const cardDefinition = JSON.parse(cardDefinitionData) as CardDefinition;

      // Create a card instance from the definition
      const cardInstance: CardInstance = {
        definition: cardDefinition,
        zone: zone,
        instanceId: `${cardDefinition.uid}-${Date.now()}`,
      };

      registerCard(playerId, cardInstance, zone);
      console.log(
        `Purchased card ${cardDefinition.name} for player ${playerId}`
      );
    } catch (error) {
      console.error('Error dropping card:', error);
      showError('Failed to purchase card. Check console for details.');
    }
  };

  const updateDeckQuantity = (cardUid: string, increment: boolean) => {
    setDeckComposition((prev) => {
      const current = prev[cardUid] || 0;
      const newValue = increment ? current + 1 : Math.max(0, current - 1);
      if (newValue === 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== cardUid)
        );
      }
      return { ...prev, [cardUid]: newValue };
    });
  };

  const getTotalDeckSize = () => {
    return Object.values(deckComposition).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getCardNameFromUid = (uid: string) => {
    const card = marketCards.find((c) => c.uid === uid);
    return card ? card.name : uid;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Error Message Banner */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        {/* Header */}
        <GameHeader game={game} playersCount={players.length} />

        {/* Deck Composition Selection Banner */}
        {isSelectingDeckComposition && (
          <DeckCompositionBanner
            deckComposition={deckComposition}
            totalDeckSize={getTotalDeckSize()}
            getCardNameFromUid={getCardNameFromUid}
            updateDeckQuantity={updateDeckQuantity}
            onSave={handleSaveDeckComposition}
            onCancel={handleCancelDeckComposition}
          />
        )}

        <MarketSection
          marketCards={marketCards}
          isSelectingDeckComposition={isSelectingDeckComposition}
          deckComposition={deckComposition}
          updateDeckQuantity={updateDeckQuantity}
          handleDragStart={handleDragStart}
          onShowAddCardModal={() => setShowAddCardModal(true)}
          onShowBulkAddCardModal={() => setShowBulkAddCardModal(true)}
          onStartDeckComposition={handleStartDeckComposition}
          game={game}
        />

        {/* Players Section */}
        <PlayersSection
          players={players}
          showInlineAddPlayer={showInlineAddPlayer}
          playerName={playerName}
          setPlayerName={setPlayerName}
          game={game}
          onCardClick={handleCardClick}
          onDrawCard={handleDrawCard}
          onDrawHand={handleDrawHand}
          onDiscardAll={handleDiscardAll}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onAddPlayer={handleAddPlayer}
          onShowInlineForm={() => setShowInlineAddPlayer(true)}
          onCancelAddPlayer={() => {
            setShowInlineAddPlayer(false);
            setPlayerName('');
          }}
        />
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <AddCardModal
          cardForm={cardForm}
          setCardForm={setCardForm}
          onAddCard={handleAddCard}
          onClose={() => setShowAddCardModal(false)}
        />
      )}

      {/* Bulk Add Card Modal */}
      {showBulkAddCardModal && (
        <BulkAddCardModal
          onAddCards={handleBulkAddCards}
          onClose={() => setShowBulkAddCardModal(false)}
        />
      )}

      {/* Card Context Menu */}
      {showCardMenu && selectedCard && (
        <CardContextMenu
          selectedCard={selectedCard}
          onMoveCard={handleMoveCard}
          onTrashCard={handleTrashCard}
          onClose={handleCloseCardMenu}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
