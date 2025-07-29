# UI Implementation Specs - V2
When implementing each high-level todo, make sure to refer back to this document for the more detailed description.

After each todo, use the browser MCP to confirm that it looks and functions as expected.

## Data Integration
- Connect store state to UI as the features below are developed.
  - Use `useGameStore().getAllPlayers()` for player list
  - Use `useMarketStore().getMarketCards()` for market display
  - Use `usePlayerStore().getPlayer(playerId)` for individual player data
  - Update UI reactively when store state changes 



## Game + Market Functionality

### Game Initialization
- [ ] Create initial game setup
  - Call `useGameStore().createGame()` on app start
  - Initialize empty market and player areas

### Market Container
- [ ] Implement market display area
  - Wide rectangle container at top of screen
  - Display cards using `useMarketStore().getMarketCards()`
  - Show empty state when no cards exist

### Market Actions Panel
- [ ] Create "Add Card to Market" functionality
  - Button/card to the right of the market
  - Modal/form with fields: name, text, cost
  - On save: call `useGameStore().addCardToMarket(cardDefinition)`

- [ ] Create "Set Starting Deck Composition" functionality
  - Button/card below add card button
  - Click to enter selection mode
  - Allow clicking market cards to increment quantities
  - Display selected cards as "[Card Name] - [Quantity]" rows
  - Save button calls `useGameStore().setStartingDeckComposition(composition)`

### Testing
- [ ] Write vitest tests for each front-end component and playwright E2E testing for game + market functionality


## Player Management

### Add Player
- [ ] Implement add player interface
  - Large rectangle container with plus icon and "add player" text
  - On click: create new player and call `useGameStore().addPlayerToGame(player, cardDefinitions)`
  - Use current starting deck composition for new player

### Player Interface Layout
- [ ] Create player container layout
  - Replace add player interface with player controls once player exists
  - Position deck, hand, play area, and discard pile as specified

### Player Actions
- [ ] Implement deck interaction
  - Deck display (bottom-left): stack of cards visual
  - Click deck: call `usePlayerStore().drawPlayerCard(playerId)`

- [ ] Implement draw hand functionality
  - Small button below deck labeled "Draw hand" 
  - On click: call `usePlayerStore().drawPlayerHand(playerId, handSize)` using game's starting hand size

- [ ] Create hand display area
  - Wide rectangle container right of deck
  - Display cards from player's hand zone
  - Show individual card instances

- [ ] Create play area display
  - Wide rectangle container above hand area
  - Display cards from player's play zone
  - Show individual card instances

- [ ] Create discard pile display
  - Card-shaped container above deck
  - Show most recently discarded card details
  - Visual stack appearance

### Card Movement
- [ ] Implement card context menu
  - On click card in hand/play: show menu with move optionsß
  - Menu options: "Move to [other zones]" (hand, play, discard)
  - Execute: call `usePlayerStore().moveCardBetweenZones(playerId, card, fromZone, toZone)`

- [ ] Implement drag-and-drop from market
  - Allow dragging cards from market to player containers
  - On drop: call `usePlayerStore().registerCard(playerId, cardInstance, Zone.DISCARD)`

### Testing
- [ ] Write vitest tests for each front-end component and playwright E2E testing for player creation functionality



## Styling Guidelines
- [ ] Apply consistent card styling
  - White background with light grey rounded borders
  - Slightly darker grey outline and drop shadow
  - Github-like appearance

- [ ] Apply consistent container styling  
  - Light grey outline borders only
  - White background, no shadows
  - Clean, minimal appearance