const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCardHover() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:3000/creators/roster', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Scroll down to the complete roster grid and find the first grid card
  const cards = await page.$$('.grid-cols-2.sm\\:grid-cols-2 > div');
  console.log(`Found ${cards.length} roster grid cards`);
  if (cards.length > 0) {
    const firstCard = cards[0];
    await firstCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Hover over the first card (Jeet Choudhary)
    await firstCard.hover();
    await page.waitForTimeout(700);

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await page.screenshot({ path: path.join(screenshotsDir, 'roster_card_hover_state.png') });
    console.log('Saved roster_card_hover_state.png');

    // Also take a close-up screenshot of just the card
    await firstCard.screenshot({ path: path.join(screenshotsDir, 'roster_card_hover_closeup.png') });
    console.log('Saved roster_card_hover_closeup.png');
  }

  await browser.close();
  console.log('Hover state verification complete!');
}

testCardHover().catch(err => {
  console.error('Error during card hover test:', err);
  process.exit(1);
});
