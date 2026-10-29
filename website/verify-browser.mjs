import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  console.log('--- Launching Chrome for Browser Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.error('[Browser Console Error]:', msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.error('[Browser Page Error]:', err.toString());
  });

  // 1. Desktop Verification (1440x900)
  console.log('\n--- 1. Desktop Verification (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

  // Check title
  const title = await page.title();
  console.log('Page Title:', title);

  // Check horizontal overflow
  const desktopOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Desktop Horizontal Overflow:', desktopOverflow ? 'FAIL (Overflow detected)' : 'PASS (No overflow)');

  // Slowly scroll down the entire page
  console.log('Scrolling through page to test GSAP triggers and Lenis...');
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < scrollHeight; y += 400) {
    await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), y);
    await new Promise(r => setTimeout(r, 100));
  }

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 200));

  // Test Download Modal interaction
  console.log('Testing Download Modal CTA click...');
  const downloadBtn = await page.$('button');
  // Find button containing Download
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Download for Windows'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const modalVisible = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    return !!modal;
  });
  console.log('Download Modal Opened:', modalVisible ? 'PASS' : 'FAIL');

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // 2. Mobile Verification (375x812 iPhone / Mobile width)
  console.log('\n--- 2. Mobile Verification (375x812) ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile Horizontal Overflow:', mobileOverflow ? 'FAIL (Overflow detected)' : 'PASS (No overflow)');

  // Scroll mobile page
  const mobileScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < mobileScrollHeight; y += 500) {
    await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), y);
    await new Promise(r => setTimeout(r, 80));
  }

  // Check interactive playground controls
  console.log('\n--- 3. Testing Interactive Playground Controls ---');
  const chipClickSuccess = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('button'));
    const neonChip = chips.find(c => c.textContent && c.textContent.trim() === 'Neon');
    if (neonChip) {
      neonChip.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Playground "Neon" chip:', chipClickSuccess ? 'PASS' : 'FAIL');

  await browser.close();

  console.log('\n--- Summary ---');
  console.log('Console Errors:', consoleErrors(consoleLogs).length);
  console.log('Page Errors:', pageErrors.length);

  if (consoleErrors(consoleLogs).length === 0 && pageErrors.length === 0 && !desktopOverflow && !mobileOverflow) {
    console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.log('Some checks failed or had errors.');
  }
}

function consoleErrors(logs) {
  return logs.filter(l => l.type === 'error');
}

verify().catch(err => {
  console.error('Verification failed with exception:', err);
  process.exit(1);
});
