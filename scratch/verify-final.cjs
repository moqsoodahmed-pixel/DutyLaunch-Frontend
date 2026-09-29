const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1536,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to AI Resume Builder...');
  await page.goto('http://localhost:5173/ai-resume-builder', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  // Capture Hero Section
  await page.screenshot({
    path: path.join(artifactDir, 'final_hero_ai_builder.png'),
    clip: { x: 0, y: 0, width: 1440, height: 780 },
  });
  console.log('Captured final_hero_ai_builder.png');

  // Navigate to CV Builder Step 3 (No Pricing, Feature Comparison & HRMS Selection)
  console.log('Navigating to CV Builder Step 3...');
  await page.goto('http://localhost:5173/cv-builder?path=new&band=entry', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(artifactDir, 'final_cv_builder_step3.png'),
    fullPage: false,
    clip: { x: 0, y: 350, width: 1440, height: 1200 },
  });
  console.log('Captured final_cv_builder_step3.png');

  // Navigate to CV Templates Gallery
  console.log('Navigating to CV Templates Gallery...');
  await page.goto('http://localhost:5173/cv-templates', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(artifactDir, 'final_templates_gallery.png'),
    clip: { x: 0, y: 300, width: 1440, height: 1100 },
  });
  console.log('Captured final_templates_gallery.png');

  // Test Mobile view of Hero
  console.log('Testing mobile responsiveness...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/ai-resume-builder', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(artifactDir, 'final_mobile_hero.png'),
    clip: { x: 0, y: 0, width: 390, height: 1100 },
  });
  console.log('Captured final_mobile_hero.png');

  await browser.close();
  console.log('Verification finished successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
