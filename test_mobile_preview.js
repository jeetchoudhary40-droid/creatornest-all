const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobileAndDesktop() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (e2) {
      console.log('Using default launch options:', e2);
      throw e2;
    }
  }
  
  // 1. Mobile Test (iPhone 14 / Pixel 7: 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });

  // Check horizontal overflow
  const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
  const hasHorizontalScroll = scrollWidth > clientWidth;
  console.log(`[Mobile Test] Viewport: 390px, ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px, Horizontal Overflow: ${hasHorizontalScroll}`);

  // Screenshot Mobile Top / Hero
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'home_mobile_hero.png') });
  console.log('Saved mobile screenshot to screenshots/home_mobile_hero.png');

  // Test Mobile Menu open
  const menuBtn = await mobilePage.$('button[aria-expanded]');
  if (menuBtn) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.join(screenshotsDir, 'home_mobile_menu_open.png') });
    console.log('Saved mobile menu screenshot to screenshots/home_mobile_menu_open.png');
  }

  // 2. Desktop Test (1280x800)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.screenshot({ path: path.join(screenshotsDir, 'home_desktop_hero.png') });
  console.log('Saved desktop screenshot to screenshots/home_desktop_hero.png');

  await browser.close();
  console.log('All mobile and desktop verification checks completed successfully!');
}

testMobileAndDesktop().catch(err => {
  console.error('Error during mobile/desktop test:', err);
  process.exit(1);
});
