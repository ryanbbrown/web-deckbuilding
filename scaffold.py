from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Dict, Optional
import uuid
import random

# ==== Core Value Objects ========================================================
class Zone(Enum):
    """Where a CardInstance currently lives."""
    DECK = auto()
    HAND = auto()
    PLAYED = auto()
    DISCARD = auto()
    MARKET = auto()


@dataclass(frozen=True)
class CardDefinition:
    """
    Immutable template shared by all copies of the same card.
    You can extend this later with cost, card_type, tags, etc.
    """
    name: str
    text: str
    cost: int = 0          # Dominion-style cost (optional for now)
    uid: str = field(default_factory=lambda: str(uuid.uuid4()))  # Helps with dict keys


@dataclass
class CardInstance:
    """
    A physical copy owned by a player.  Keeps a back-reference to its definition
    so you don't duplicate static data.
    """
    definition: CardDefinition
    owner_id: Optional[str] = None          # filled in when the card is gained
    zone: Zone = Zone.MARKET               # default location
    instance_id: str = field(default_factory=lambda: str(uuid.uuid4()))



# ==== Market ==================================================================
@dataclass
class Market:
    """
    In basic mode every card is 'infinite', so we store just the definitions.
    If you later want Dominion-style limited piles, swap `set` for `dict[CardDefinition, int]`.
    """
    catalog: set[CardDefinition] = field(default_factory=set)

    def add_card_def(self, card_def: CardDefinition) -> None:
        self.catalog.add(card_def)


# ==== Player ==================================================================
@dataclass
class Player:
    """
    Tracks all zones.  Lists preserve ordering for deck/hand play.  We keep
    references to CardInstance so duplicates are distinct.
    """
    name: str
    player_id: str = field(default_factory=lambda: str(uuid.uuid4()))

    all_cards: List[CardInstance] = field(default_factory=list)

    deck: List[CardInstance] = field(default_factory=list)
    hand: List[CardInstance] = field(default_factory=list)
    played: List[CardInstance] = field(default_factory=list)
    discard: List[CardInstance] = field(default_factory=list)

    def register_card(self, card: CardInstance, initial_zone: Zone = Zone.DISCARD):
        """
        Centralised place to attach new cards the player gains.
        (Methods for shuffling, drawing, playing will live here later.)
        """
        card.owner_id = self.player_id
        card.zone = initial_zone
        self.all_cards.append(card)

        match initial_zone:
            case Zone.DECK:     self.deck.append(card)
            case Zone.HAND:     self.hand.append(card)
            case Zone.PLAYED:   self.played.append(card)
            case Zone.DISCARD:  self.discard.append(card)

    def _move_card_between_zones(self, card: CardInstance, from_zone: Zone, to_zone: Zone) -> None:
        """Helper method to move cards between zones."""
        # Remove from source zone
        match from_zone:
            case Zone.DECK:     self.deck.remove(card)
            case Zone.HAND:     self.hand.remove(card)
            case Zone.PLAYED:   self.played.remove(card)
            case Zone.DISCARD:  self.discard.remove(card)

        # Add to destination zone
        match to_zone:
            case Zone.DECK:     self.deck.append(card)
            case Zone.HAND:     self.hand.append(card)
            case Zone.PLAYED:   self.played.append(card)
            case Zone.DISCARD:  self.discard.append(card)

        # Update card's zone
        card.zone = to_zone

    def draw_card(self) -> Optional[CardInstance]:
        """
        Draw a card from deck to hand. If deck is empty, shuffle discard into deck first.
        Returns the drawn card, or None if no cards available.
        """
        # If deck is empty, try to shuffle discard into deck
        if not self.deck and self.discard:
            # Move all cards from discard to deck
            while self.discard:
                card = self.discard.pop()
                self.deck.append(card)
                card.zone = Zone.DECK
            
            # Shuffle the deck
            random.shuffle(self.deck)

        # Draw from deck if available
        if self.deck:
            card = self.deck.pop()
            self.hand.append(card)
            card.zone = Zone.HAND
            return card
        
        return None

    def draw_hand(self, hand_size: int) -> List[CardInstance]:
        """
        Discard current hand and played cards, then draw a fresh hand of specified size.
        Returns list of cards drawn.
        """
        # First discard everything
        self.discard_all_in_play()
        self.discard_all_in_hand()
        
        # Draw fresh hand
        drawn_cards = []
        for _ in range(hand_size):
            card = self.draw_card()
            if card:
                drawn_cards.append(card)
            else:
                break  # No more cards available
        
        return drawn_cards

    def play_card(self, card: CardInstance) -> bool:
        """
        Move a card from hand to played area.
        Returns True if successful, False if card not in hand.
        """
        if card in self.hand:
            self._move_card_between_zones(card, Zone.HAND, Zone.PLAYED)
            return True
        return False

    def discard_card(self, card: CardInstance, from_zone: Zone = Zone.HAND) -> bool:
        """
        Move a card from hand or played area to discard pile.
        Returns True if successful, False if card not in specified zone or zone invalid.
        """
        if from_zone not in [Zone.HAND, Zone.PLAYED]:
            return False

        zone_list = self.hand if from_zone == Zone.HAND else self.played
        if card in zone_list:
            self._move_card_between_zones(card, from_zone, Zone.DISCARD)
            return True
        return False

    def discard_all_in_play(self) -> bool:
        """
        Move all cards from played area to discard pile.
        Returns True if any cards were discarded, False if played area was empty.
        """
        if not self.played:
            return False
            
        while self.played:
            card = self.played[0]  # Get first card without removing it
            self._move_card_between_zones(card, Zone.PLAYED, Zone.DISCARD)
        return True

    def discard_all_in_hand(self) -> bool:
        """
        Move all cards from hand to discard pile.
        Returns True if any cards were discarded, False if hand was empty.
        """
        if not self.hand:
            return False
            
        while self.hand:
            card = self.hand[0]  # Get first card without removing it
            self._move_card_between_zones(card, Zone.HAND, Zone.DISCARD)
        return True


# ==== Game ====================================================================
@dataclass
class Game:
    """
    Coordinates players, turn order and a shared market.
    Most game-flow logic will go here eventually.
    """
    market: Market
    players: List[Player] = field(default_factory=list)
    starting_deck_composition: Optional[Dict[CardDefinition, int]] = None
    starting_hand_size: int = 5

    def add_card_to_market(self, card_def: CardDefinition) -> None:
        """Add a card definition to the market catalog."""
        self.market.add_card_def(card_def)

    def set_starting_deck_composition(self, composition: Dict[CardDefinition, int]) -> None:
        """
        Set the starting deck composition for new players.
        Example: {copper_card: 7, estate_card: 3} for Dominion starting deck.
        """
        self.starting_deck_composition = composition

    def set_starting_hand_size(self, size: int) -> None:
        """Set the starting hand size for players (defaults to 5)."""
        self.starting_hand_size = size

    def add_player(self, player: Player) -> bool:
        """
        Add a player to the game. Players can't be added until starting deck composition is set.
        Returns True if successful, False if starting deck not yet configured.
        """
        if self.starting_deck_composition is None:
            return False

        # Add starting deck to player
        for card_def, count in self.starting_deck_composition.items():
            for _ in range(count):
                card_instance = CardInstance(definition=card_def)
                player.register_card(card_instance, Zone.DECK)

        # Shuffle the starting deck
        random.shuffle(player.deck)

        # Add player to game
        self.players.append(player)
        return True