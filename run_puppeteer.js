import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Listen for console events
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    } else {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    await page.goto('https://ddbb-operativa.vercel.app', { waitUntil: 'networkidle0' });
    
    // Simulate login for Cristian
    await page.type('input', '2026');
    await page.keyboard.press('Enter');
    
    // Wait for calendar to load
    await page.waitForSelector('.nav-link', { timeout: 10000 });
    
    // Find and click Operativa (Dashboard)
    const links = await page.$$('.nav-link');
    for (const link of links) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Operativa')) {
        console.log('Clicking Operativa');
        await link.click();
        break;
      }
    }
    
    // Wait a bit to catch errors
    await new Promise(r => setTimeout(r, 2000));
    console.log('Done waiting');
  } catch (e) {
    console.error("SCRIPT ERROR:", e);
  } finally {
    await browser.close();
  }
})();
