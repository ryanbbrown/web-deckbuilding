import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

test.describe('Multiplayer E2E Test', () => {
  let browser: Browser;
  let contextOne: BrowserContext;
  let contextTwo: BrowserContext;
  let pageOne: Page;
  let pageTwo: Page;

  test.beforeEach(async ({ browser: b }) => {
    browser = b;

    // Create two isolated browser contexts to simulate two different users
    contextOne = await browser.newContext();
    contextTwo = await browser.newContext();

    // Create pages for each context
    pageOne = await contextOne.newPage();
    pageTwo = await contextTwo.newPage();

    // Set viewports for both pages
    await pageOne.setViewportSize({ width: 1920, height: 1080 });
    await pageTwo.setViewportSize({ width: 1920, height: 1080 });

    // Navigate both pages to the app
    await pageOne.goto('/');
    await pageTwo.goto('/');

    // Wait for both pages to load
    await pageOne.waitForLoadState('networkidle');
    await pageTwo.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    // Clean up contexts
    await contextOne?.close();
    await contextTwo?.close();
  });

  test('should handle multiplayer room creation, joining, state sync, and leaving', async () => {
    // ## Step 1: Verify both start in local mode
    // The multiplayer controls are in the header
    await expect(pageOne.locator('span:has-text("Local Mode")')).toBeVisible();
    await expect(pageTwo.locator('span:has-text("Local Mode")')).toBeVisible();

    // ## Step 2: User 1 creates a room
    await pageOne.locator('button:has-text("Create Room")').click();

    // Wait for connection and room ID to appear
    await pageOne.waitForSelector('span:has-text("Room")', { timeout: 15000 });

    // Extract the room ID from User 1's UI - it appears in the green-bordered status indicator
    const roomStatusElement = pageOne.locator(
      '.border-green-500 span:has-text("Room")'
    );
    await expect(roomStatusElement).toBeVisible({ timeout: 10000 });
    const roomText = await roomStatusElement.textContent();
    const roomId = roomText?.replace('Room ', '').trim();

    expect(roomId).toBeTruthy();
    expect(roomId).toMatch(/^[A-Z0-9]{6}$/); // Room IDs are 6 character alphanumeric codes

    // Verify User 1 is connected - Leave Room button should be visible
    await expect(
      pageOne.locator('button:has-text("Leave Room")')
    ).toBeVisible();

    // ## Step 3: Add some initial game state in User 1's browser
    // Add cards to market using bulk add
    await pageOne.getByTestId('add-multiple-cards-to-market-btn').click();

    const cardText = `TestCard1|Card one description|2
TestCard2|Card two description|3
TestCard3|Card three description|4`;

    await pageOne.getByTestId('bulk-add-textarea').fill(cardText);
    await pageOne.getByTestId('bulk-add-cards-btn').click();

    // Verify cards appear in User 1's market
    await expect(pageOne.getByTestId('market-card-testcard1')).toBeVisible();
    await expect(pageOne.getByTestId('market-card-testcard2')).toBeVisible();
    await expect(pageOne.getByTestId('market-card-testcard3')).toBeVisible();

    // ## Step 3.5: Set starting deck composition (required before adding players)
    await pageOne.getByTestId('set-starting-deck-composition-btn').click();

    // Wait for modal to appear
    await pageOne.waitForSelector('text=Deck Composition', { timeout: 5000 });

    // Click on TestCard1 five times
    for (let i = 0; i < 5; i++) {
      await pageOne.getByTestId('market-card-testcard1').click();
      await pageOne.waitForTimeout(100); // Small delay between clicks
    }

    // Click on TestCard2 five times
    for (let i = 0; i < 5; i++) {
      await pageOne.getByTestId('market-card-testcard2').click();
      await pageOne.waitForTimeout(100); // Small delay between clicks
    }

    // Save composition
    await pageOne.getByTestId('save-composition-btn').click();

    // Wait for modal to close
    await pageOne.waitForTimeout(500);

    // ## Step 3.6: Now add a player
    await pageOne.getByTestId('add-player-rectangle').click();
    await pageOne.getByTestId('player-name-input').fill('Player1');
    await pageOne.getByTestId('add-player-btn').click();

    // Verify player appears
    await expect(pageOne.getByTestId('player-section-player1')).toBeVisible();

    // ## Step 4: User 2 joins the same room
    await pageTwo.locator('button:has-text("Join Room")').click();

    // Wait for join modal to appear
    await pageTwo.waitForSelector('h3:has-text("Join Room")');

    // Enter the room ID
    await pageTwo.locator('input#roomId').fill(roomId!);
    await pageTwo
      .locator('button[type="submit"]:has-text("Join Room")')
      .click();

    // Wait for User 2 to connect
    await pageTwo.waitForSelector('span:has-text("Room")', { timeout: 15000 });

    // Verify User 2 is connected to the same room
    const roomStatusElementTwo = pageTwo.locator(
      '.border-green-500 span:has-text("Room")'
    );
    await expect(roomStatusElementTwo).toBeVisible({ timeout: 10000 });
    const roomTextTwo = await roomStatusElementTwo.textContent();
    expect(roomTextTwo).toContain(roomId);

    // ## Step 5: Verify state synchronization - User 2 should see User 1's state
    // Wait for state to sync - use explicit waits for the elements
    await expect(pageTwo.getByTestId('market-card-testcard1')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageTwo.getByTestId('market-card-testcard2')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageTwo.getByTestId('market-card-testcard3')).toBeVisible({
      timeout: 10000,
    });

    // Verify User 2 sees the player that User 1 added
    await expect(pageTwo.getByTestId('player-section-player1')).toBeVisible({
      timeout: 10000,
    });

    // ## Step 6: User 2 makes changes and verify User 1 sees them
    // User 2 adds another card
    await pageTwo.getByTestId('add-card-to-market-btn').click();
    await pageTwo.getByTestId('card-name-input').fill('TestCard4');
    await pageTwo.getByTestId('card-text-input').fill('Card four from User 2');
    await pageTwo.getByTestId('card-cost-input').fill('5');
    await pageTwo.getByTestId('add-card-btn').click();

    // Verify User 2 sees the new card
    await expect(pageTwo.getByTestId('market-card-testcard4')).toBeVisible();

    // Verify User 1 also sees the new card
    await expect(pageOne.getByTestId('market-card-testcard4')).toBeVisible({
      timeout: 10000,
    });

    // User 2 adds another player
    await pageTwo.getByTestId('add-player-rectangle').click();
    await pageTwo.getByTestId('player-name-input').fill('Player2');
    await pageTwo.getByTestId('add-player-btn').click();

    // Verify both users see both players
    await expect(pageTwo.getByTestId('player-section-player2')).toBeVisible();
    await expect(pageOne.getByTestId('player-section-player2')).toBeVisible({
      timeout: 10000,
    });

    // ## Step 7: Test player-specific actions syncing
    // User 1 draws a hand for Player1
    const player1Section = pageOne.getByTestId('player-section-player1');
    await player1Section.getByTestId('draw-hand-btn').click();

    // Verify Player1 has cards in hand in User 1's view
    const handSectionOne = player1Section.getByTestId('hand-section');
    await expect(handSectionOne.locator('h4')).toContainText('(5)');

    // Verify User 2 sees the same hand state
    const player1SectionTwo = pageTwo.getByTestId('player-section-player1');
    const handSectionTwo = player1SectionTwo.getByTestId('hand-section');
    await expect(handSectionTwo.locator('h4')).toContainText('(5)', {
      timeout: 10000,
    });

    // ## Step 8: User 1 leaves the room
    await pageOne.locator('button:has-text("Leave Room")').click();

    // Verify User 1 is back in local mode
    await expect(pageOne.locator('span:has-text("Local Mode")')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      pageOne.locator('button:has-text("Create Room")')
    ).toBeVisible();

    // ## Step 9: Verify User 2 is still connected and state persists
    await expect(
      pageTwo.locator('.border-green-500 span:has-text("Room")')
    ).toBeVisible();
    await expect(pageTwo.getByTestId('market-card-testcard1')).toBeVisible();
    await expect(pageTwo.getByTestId('market-card-testcard2')).toBeVisible();
    await expect(pageTwo.getByTestId('market-card-testcard3')).toBeVisible();
    await expect(pageTwo.getByTestId('market-card-testcard4')).toBeVisible();
    await expect(pageTwo.getByTestId('player-section-player1')).toBeVisible();
    await expect(pageTwo.getByTestId('player-section-player2')).toBeVisible();

    // ## Step 10: User 1 makes local changes (should not affect User 2)
    // First User 1 needs to set up their local state again
    // Add cards to market
    await pageOne.getByTestId('add-card-to-market-btn').click();
    await pageOne.getByTestId('card-name-input').fill('LocalCard');
    await pageOne.getByTestId('card-text-input').fill('This is a local card');
    await pageOne.getByTestId('card-cost-input').fill('1');
    await pageOne.getByTestId('add-card-btn').click();

    // Verify User 1 sees the local card
    await expect(pageOne.getByTestId('market-card-localcard')).toBeVisible();

    // Wait and verify User 2 does NOT see the local card
    await pageTwo.waitForTimeout(2000);
    await expect(
      pageTwo.getByTestId('market-card-localcard')
    ).not.toBeVisible();

    // ## Step 11: User 1 rejoins the room (should clear local state and sync with room)
    await pageOne.locator('button:has-text("Join Room")').click();
    await pageOne.locator('input#roomId').fill(roomId!);
    await pageOne
      .locator('button[type="submit"]:has-text("Join Room")')
      .click();

    // Wait for User 1 to reconnect
    await pageOne.waitForSelector('span:has-text("Room")', { timeout: 15000 });

    // Verify User 1's local card is gone and synced state is restored
    await pageOne.waitForTimeout(2000);
    await expect(
      pageOne.getByTestId('market-card-localcard')
    ).not.toBeVisible();
    await expect(pageOne.getByTestId('market-card-testcard1')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageOne.getByTestId('market-card-testcard2')).toBeVisible();
    await expect(pageOne.getByTestId('market-card-testcard3')).toBeVisible();
    await expect(pageOne.getByTestId('market-card-testcard4')).toBeVisible();

    // ## Step 12: Both users leave and verify clean disconnection
    await pageOne.locator('button:has-text("Leave Room")').click();
    await pageTwo.locator('button:has-text("Leave Room")').click();

    // Verify both are in local mode
    await expect(pageOne.locator('span:has-text("Local Mode")')).toBeVisible({
      timeout: 5000,
    });
    await expect(pageTwo.locator('span:has-text("Local Mode")')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle concurrent state updates from multiple users', async () => {
    // Create a room with User 1
    await pageOne.locator('button:has-text("Create Room")').click();
    await pageOne.waitForSelector('span:has-text("Room")', { timeout: 15000 });

    // Get room ID
    const roomStatusElement = pageOne.locator(
      '.border-green-500 span:has-text("Room")'
    );
    await expect(roomStatusElement).toBeVisible({ timeout: 10000 });
    const roomText = await roomStatusElement.textContent();
    const roomId = roomText?.replace('Room ', '').trim();

    // User 2 joins
    await pageTwo.locator('button:has-text("Join Room")').click();
    await pageTwo.locator('input#roomId').fill(roomId!);
    await pageTwo
      .locator('button[type="submit"]:has-text("Join Room")')
      .click();
    await pageTwo.waitForSelector('span:has-text("Room")', { timeout: 15000 });

    // Wait a moment for both connections to stabilize
    await pageOne.waitForTimeout(2000);
    await pageTwo.waitForTimeout(2000);

    // Both users add cards sequentially (not concurrently) to avoid race conditions
    // User 1 adds cards
    await pageOne.getByTestId('add-multiple-cards-to-market-btn').click();
    await pageOne.getByTestId('bulk-add-textarea')
      .fill(`User1Card1|From user 1|1
User1Card2|Also from user 1|2`);
    await pageOne.getByTestId('bulk-add-cards-btn').click();

    // Wait for User 1's cards to appear
    await expect(pageOne.getByTestId('market-card-user1card1')).toBeVisible();
    await expect(pageOne.getByTestId('market-card-user1card2')).toBeVisible();

    // Wait for sync to User 2
    await expect(pageTwo.getByTestId('market-card-user1card1')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageTwo.getByTestId('market-card-user1card2')).toBeVisible({
      timeout: 10000,
    });

    // User 2 adds cards
    await pageTwo.getByTestId('add-multiple-cards-to-market-btn').click();
    await pageTwo.getByTestId('bulk-add-textarea')
      .fill(`User2Card1|From user 2|3
User2Card2|Also from user 2|4`);
    await pageTwo.getByTestId('bulk-add-cards-btn').click();

    // Wait for User 2's cards to appear
    await expect(pageTwo.getByTestId('market-card-user2card1')).toBeVisible();
    await expect(pageTwo.getByTestId('market-card-user2card2')).toBeVisible();

    // Wait for sync to User 1
    await expect(pageOne.getByTestId('market-card-user2card1')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageOne.getByTestId('market-card-user2card2')).toBeVisible({
      timeout: 10000,
    });

    // Final verification - both users see all cards
    for (const page of [pageOne, pageTwo]) {
      await expect(page.getByTestId('market-card-user1card1')).toBeVisible();
      await expect(page.getByTestId('market-card-user1card2')).toBeVisible();
      await expect(page.getByTestId('market-card-user2card1')).toBeVisible();
      await expect(page.getByTestId('market-card-user2card2')).toBeVisible();
    }
  });
});
