const puppeteer = require('puppeteer');

async function renderHtmlToImage(htmlCode, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set HTML content
  await page.setContent(htmlCode);
  await page.setViewport({ width: 800, height: 600 });

  // Take a screenshot of the rendered HTML/CSS
  await page.screenshot({ path: outputPath, fullPage: true  });

  await browser.close();
}

module.exports = { renderHtmlToImage };
