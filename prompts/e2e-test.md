Please implement an e2e test using playwright. The test should do the following:

## Market Setup
### Bulk Add Cards
- Go to the homepage of the website
- Click the "add multiple cards to market" button
- Paste the following text:
`Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|3`
- Click "Add Cards" button
- Assert that an error message pops up "Failed to add cards. Please fix the following errors: Line 3"
- Replace the text with the following (corrected) text:
`Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|Best treasure card|3`
- Click "Add Cards" button again
- Assert that there are now 3 cards appearing in the market, called "copper, silver, gold"

### Single Add Cards
- Click the "Add Card to Market" button
- Fill out the "name" field with "Platinum"
- Fill out the "text" field with "Super best treasure"
- Update the cost field to be 4
- Assert that the platinum card is now in the market


## Deck Composition
- Click the "Set starting deck composition" button
- Click on the Copper card five times
- Click on the Silver card three times
- Click on the Gold card three times
- Within the deck composition modal, click the "-" (minus) button next to Copper
- Assert that in the deck composition modal, it shows "Copper: 4", "Silver: 3", and "Gold: 3"
- Click "Save Composition"


## Player Operations
### Basic Setup
- Click the "Add Player" rectangle
- Type "player1" in the Player Name text box
- Click the "Add Player" button
- Assert that there is now a player1 section
- Click the "Draw Hand" button
- Assert that 5 cards now show up in the player's hand

### Moving Cards
- Click the leftmost card to open the card modal, then click "play card"
- Click the new leftmost card to open the card modal, then click "discard card"
- Click the new leftmost card to open the card modal, then click "discard card"
- Click the new leftmost card to open the card modal, then click "trash card"
- Click the "show all cards" text on the top right of the discard section, and assert that two cards show in the discard section
- Click the "discard all" button
- Assert that four cards show in the discard section
- Click the "Draw Card" button three times
- Click the "draw hand" button
- Assert that 5 cards now show up in the player's hand

### Adding Cards
- Click and drag a Platinum card from the market section to the middle of the player section
- Click the "Show Deck Comp" button
- Assert that the deck composition contains "Copper", "Silver", "Gold", and "Platinum"


## Finish
- Click the "Reset Game" button (top right corner)
- In the modal that pops up, click the "Reset Game" button again
- Assert that the market is empty
- Assert that there are no players
- Assert that the "Reset Game" button does not appear
