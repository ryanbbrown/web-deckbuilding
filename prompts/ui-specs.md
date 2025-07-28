## Elements

### Market

Wide rectangle container at the top of the app. This is where market cards are stored. By default it is empty.

To the right of the container, there are two clickable cards, one above the other (two rows):

- **Card 1 (top) - Add card to market**: When clicked, it creates a new blank card in the market. There are three fields to fill out: name, text, and cost. Once filled, the player can click “save”, at which point the card is now in the market.
- **Card 2 (bottom) - Set starting deck composition**: When clicked, it should say “select cards to add to starting deck composition”. Then, you can click cards in the market, which will show up in the card as “[Card Name] - [Quantity]” rows. Clicking a card in the market more than once increases the quantity. After editing has initiated, there should be a “save” button on the bottom of the card that finalizes the operation. At that point, the card should show the “[Card Name] - [Quantity]” rows.

### Players

At the bottom of the screen, there’s a large rectangle container with a plus sign in the middle and the text “add player”. Once clicked, it does the add player action (giving them starting deck, etc.)

Once a player is created, it’s the same large rectangle container with the following elements:

- **Deck**: Bottom left corner, looks like a stack of cards. When clicked, performs drawCard action.
- **DrawHand Button**: small button (as wide as deck but not very tell) that says “Draw hand” and performs the drawhand action.
- **Hand**: Wide rectangle container to the right of deck, contains the cards in the player’s hand.
- **Play Area**: identical wide rectangle container above hand, contains cards that are “in play”.
- **Discard**: Card-shaped rectangle container above the deck, looks like a stack of cards, shows the details of the most recently discarded card.

For cards in hand or in play, clicking on the card will pop up a small menu (relative to card position) with two options: “move to X” or “move to Y”, where X and Y are the two **other** zones of {hand, play, discard}.

Players can click and drag cards from the market to their overall player container; upon release, the card will be added to their discard pile.


## Style

Two Core UI elements: containers and cards.

- Card: white background, light grey rounded rectangles with slightly darker light grey outline and shadow.
- Container: Just light grey outline (same color as card), otherwise empty (white background, no shadow)

Note that this style / coloring is meant to be similar to github.