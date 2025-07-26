A couple of things to clarify:

## General
- Can you explain why moveCardToZone creates a new instance instead of modifying the existing one? this might make sense / be best practice I just want to know why. Same thing goes for updatedGame. Is it similar to pandas in python how you prefer to not do things inplace?
- Can you explain what the updatePlayer function is intended for?
- Can you explain what the hadCardDefinition function is intended for?


## Cards
- createCardInstance: it should only be able to be in market unless it's being associated with a player, right? right now it appears you could put it in zone.DECK but it wouldn't know which player to be on. So the card instance custom zone test doesn't really make sense?
- if a card has an owner, then it shouldn't be able to be in the market zone; it has to either be in deck, discard, or play.

## Player
- For the 'should shuffle discard into deck when deck is empty' test, can we have an example where discard is 2 cards? and then confirm that deck is 1 card, hand is 1 card, discard is 0 cards?
- for the 'should discard current hand and played cards, then draw new hand' test, should it also check that deck has 2 cards left?