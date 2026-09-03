const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCreatorsPreview() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  
  // 1. Homepage Featured Creators
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => {
    const el = document.getElementById('creators');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  await page.screenshot({ path: path.join(screenshotsDir, 'home_featured_creators.png') });
  console.log('Saved home_featured_creators.png');

  // 2. Roster Page
  await page.goto('http://localhost:3000/creators/roster', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'roster_page_top.png') });
  console.log('Saved roster_page_top.png');

  await browser.close();
  console.log('Creators verification screenshots captured successfully!');
}

testCreatorsPreview().catch(err => {
  console.error('Error during creators test:', err);
  process.exit(1);
});
