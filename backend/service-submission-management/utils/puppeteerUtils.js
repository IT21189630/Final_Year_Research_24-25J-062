const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const renderHtmlCss = async (htmlCode, cssCode, challengeId) => {
    const tempFilePath = path.join(__dirname, `temp/${challengeId}.html`);
    const screenshotPath = path.join(__dirname, `screenshots/${challengeId}.png`);
  
    // Combine HTML and CSS into a single file
    const htmlContent = `
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>${htmlCode}</body>
      </html>`;
    fs.writeFileSync(tempFilePath, htmlContent);
  
    // Launch Puppeteer and render the HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`file://${tempFilePath}`);  
    await page.screenshot({ path: screenshotPath, fullPage: true  });
  
    await browser.close();
  
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
  
    return screenshotPath;
  };