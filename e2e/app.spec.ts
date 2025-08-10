import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E Test Flow', () => {
  test('should complete the full e2e test workflow', async ({ page }) => {
    // Set a large viewport to ensure all elements are visible
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to the homepage of the website
    await page.goto('/');

    // Wait for page to fully load and stabilize
    await page.waitForLoadState('networkidle');

    // ## Market Setup
    // ### Bulk Add Cards
    // Click the "add multiple cards to market" button
    await page.getByTestId('add-multiple-cards-to-market-btn').click();

    // Paste the following text (with error)
    const errorText = `Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|3`;

    await page.getByTestId('bulk-add-textarea').fill(errorText);

    // Click "Add Cards" button
    await page.getByTestId('bulk-add-cards-btn').click();

    // Assert that an error message pops up "Failed to add cards. Please fix the following errors: Line 3"
    await expect(page.getByTestId('error-message')).toContainText(
      'Failed to add cards. Please fix the following errors: Line 3'
    );

    // Replace the text with the following (corrected) text
    const correctedText = `Copper|Basic treasure card|1
Silver|Better treasure card|2
Gold|Best treasure card|3`;

    await page.getByTestId('bulk-add-textarea').fill(correctedText);

    // Click "Add Cards" button again
    await page.getByTestId('bulk-add-cards-btn').click();

    // Assert that there are now 3 cards appearing in the market, called "copper, silver, gold"
    await expect(page.getByTestId('market-card-copper')).toBeVisible();
    await expect(page.getByTestId('market-card-silver')).toBeVisible();
    await expect(page.getByTestId('market-card-gold')).toBeVisible();

    // ### Single Add Cards
    // Click the "Add Card to Market" button
    await page.getByTestId('add-card-to-market-btn').click();

    // Fill out the "name" field with "Platinum"
    await page.getByTestId('card-name-input').fill('Platinum');

    // Fill out the "text" field with "Super best treasure"
    await page.getByTestId('card-text-input').fill('Super best treasure');

    // Update the cost field to be 4
    await page.getByTestId('card-cost-input').fill('4');

    // Click Add Card button
    await page.getByTestId('add-card-btn').click();

    // Assert that the platinum card is now in the market
    await expect(page.getByTestId('market-card-platinum')).toBeVisible();

    // ## Deck Composition
    // Click the "Set starting deck composition" button
    await page.getByTestId('set-starting-deck-composition-btn').click();

    // Click on the Copper card five times
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('market-card-copper').click();
    }

    // Click on the Silver card three times
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('market-card-silver').click();
    }

    // Click on the Gold card three times
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('market-card-gold').click();
    }

    // Within the deck composition modal, click the "-" (minus) button next to Copper
    await page.getByTestId('deck-composition-minus-copper').click();

    // Assert that in the deck composition modal, it shows "Copper: 4", "Silver: 3", and "Gold: 3"
    await expect(page.getByTestId('deck-composition-copper')).toContainText(
      'Copper: 4'
    );
    await expect(page.getByTestId('deck-composition-silver')).toContainText(
      'Silver: 3'
    );
    await expect(page.getByTestId('deck-composition-gold')).toContainText(
      'Gold: 3'
    );

    // Click "Save Composition"
    await page.getByTestId('save-composition-btn').click();

    // ## Player Operations
    // ### Basic Setup
    // Click the "Add Player" rectangle
    await page.getByTestId('add-player-rectangle').click();

    // Type "player1" in the Player Name text box
    await page.getByTestId('player-name-input').fill('player1');

    // Click the "Add Player" button
    await page.getByTestId('add-player-btn').click();

    // Assert that there is now a player1 section
    await expect(page.getByTestId('player-section-player1')).toBeVisible();

    // Click the "Draw Hand" button
    await page.getByTestId('draw-hand-btn').click();

    // Assert that 5 cards now show up in the player's hand
    const handSection = page.getByTestId('hand-section');
    await expect(handSection.locator('h4')).toContainText('(5)');

    // ### Moving Cards
    // Click the leftmost card to open the card modal, then click "play card"
    const handCards = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await handCards.click();
    await page.getByTestId('play-card-btn').click();

    // Click on the played card in the play area and click "return to hand"
    const playedCard = page
      .getByTestId('played-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await playedCard.click();
    await page.getByTestId('return-to-hand-btn').click();

    // Play the card again
    const returnedCard = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await returnedCard.click();
    await page.getByTestId('play-card-btn').click();

    // Click the new leftmost card to open the card modal, then click "discard card"
    const newHandCards = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await newHandCards.click();
    await page.getByTestId('discard-card-btn').click();

    // Click the "show all cards" text on the top right of the discard section
    await page.getByTestId('show-all-cards-btn').click();

    // Click on the discarded card and click "return to hand"
    const discardedCard = page
      .getByTestId('discard-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await discardedCard.click();
    await page.getByTestId('return-to-hand-btn').click();

    // Discard the card again
    const returnedDiscardCard = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await returnedDiscardCard.click();
    await page.getByTestId('discard-card-btn').click();

    // Click the new leftmost card to open the card modal, then click "discard card"
    const handCards2 = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await handCards2.click();
    await page.getByTestId('discard-card-btn').click();

    // Click on the second discarded card and click "play card"
    const secondDiscardedCard = page
      .getByTestId('discard-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await secondDiscardedCard.click();
    await page.getByTestId('play-card-btn').click();

    // Click on the card in the play area and discard it again
    const playAreaCard = page
      .getByTestId('played-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await playAreaCard.click();
    await page.getByTestId('discard-card-btn').click();

    // Click on a card in the play area and trash it
    const playAreaCardToTrash = page
      .getByTestId('played-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await playAreaCardToTrash.click();
    await page.getByTestId('trash-card-btn').click();

    // Click the new leftmost card to open the card modal, then click "trash card"
    const handCards3 = page
      .getByTestId('hand-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await handCards3.click();
    await page.getByTestId('trash-card-btn').click();

    // Assert that two cards show in the discard section
    const discardSection = page.getByTestId('discard-section');
    await expect(discardSection.locator('h4')).toContainText('(2)');

    // Click the "discard all" button
    await page.getByTestId('discard-all-btn').click();

    // Assert that four cards show in the discard section
    await expect(discardSection.locator('h4')).toContainText('(3)');

    // Test trashing a card from discard pile
    const discardCardToTrash = page
      .getByTestId('discard-section')
      .locator('[data-card-clickable="true"]')
      .first();
    await discardCardToTrash.click();
    await page.getByTestId('trash-card-btn').click();

    // Assert that only two cards remain in the discard section after trashing one
    await expect(discardSection.locator('h4')).toContainText('(2)');

    // Click the "Draw Card" button three times
    await page.getByTestId('draw-card-btn').click();
    await page.getByTestId('draw-card-btn').click();
    await page.getByTestId('draw-card-btn').click();

    // Click the "draw hand" button
    await page.getByTestId('draw-hand-btn').click();

    // Assert that 5 cards now show up in the player's hand
    await expect(handSection.locator('h4')).toContainText('(5)');

    // ### Adding Cards via Drag & Drop
    // After extensive operations, page scrolls and Platinum card goes outside viewport
    const platinumCard = page.getByTestId('market-card-platinum');
    const playerSection = page.getByTestId('player-section-player1');

    // Check if elements exist before testing visibility
    const platinumExists = await platinumCard.count();
    const playerExists = await playerSection.count();
    console.log('Platinum card exists:', platinumExists > 0);
    console.log('Player section exists:', playerExists > 0);

    // Scroll Platinum card into view (was outside viewport after previous operations)
    await platinumCard.scrollIntoViewIfNeeded();

    await expect(platinumCard).toBeVisible();
    await expect(playerSection).toBeVisible();

    // Ensure the card is draggable
    await expect(platinumCard).toHaveAttribute('draggable', 'true');

    // Get the actual bounding boxes for precise positioning
    const platinumBox = await platinumCard.boundingBox();
    const playerBox = await playerSection.boundingBox();

    if (!platinumBox || !playerBox) {
      throw new Error('Could not get bounding boxes for drag operation');
    }

    // Use Playwright's built-in dragTo with calculated positions
    await platinumCard.dragTo(playerSection, {
      force: true,
      sourcePosition: {
        x: platinumBox.width / 2,
        y: platinumBox.height / 2,
      },
      targetPosition: {
        x: playerBox.width / 2,
        y: playerBox.height / 2,
      },
    });

    // Verify Platinum appears in discard pile
    const discardZone = page
      .getByTestId('player-section-player1')
      .getByTestId('discard-section');
    const platinumInDiscard = discardZone.getByText('Platinum');
    await expect(platinumInDiscard).toBeVisible({ timeout: 5000 });

    // ## Finish
    // Click the "Reset Game" button (top right corner)
    await page.getByTestId('reset-game-btn').click();

    // In the modal that pops up, click the "Reset Game" button again
    await page.getByTestId('confirm-reset-game-btn').click();

    // Assert that the market is empty
    const marketSection = page.getByTestId('market-section');
    await expect(marketSection).toContainText('No cards in market');

    // Assert that there are no players
    await expect(page.getByTestId('player-section-player1')).not.toBeVisible();

    // Assert that the "Reset Game" button does not appear
    await expect(page.getByTestId('reset-game-btn')).not.toBeVisible();
  });
});
