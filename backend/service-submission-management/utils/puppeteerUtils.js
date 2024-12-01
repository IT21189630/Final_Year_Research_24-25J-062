const puppeteer = require("puppeteer");
const path = require("path");

const renderHtmlCss = async (htmlContent, cssContent, outputPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${cssContent}</style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  await page.setContent(fullHtml);
  await page.setViewport({ width: 800, height: 600 });

  await page.screenshot({ path: outputPath });
  await browser.close();
};

module.exports = { renderHtmlCss };


// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// exports.renderHtmlCss = async (htmlCode, cssCode, challengeId) => {
//     const tempFilePath = path.join(__dirname, `../temp/${challengeId}.html`);
//     const screenshotPath = path.join(__dirname, `../screenshots/${challengeId}.png`);
  
//     // Combine HTML and CSS into a single file
//     const htmlContent = `
//       <html>
//         <head>
//           <style>${cssCode}</style>
//         </head>
//         <body>${htmlCode}</body>
//       </html>`;
//     fs.writeFileSync(tempFilePath, htmlContent);
  
//     // Launch Puppeteer and render the HTML
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(`file://${tempFilePath}`);  
//     await page.screenshot({ path: screenshotPath, fullPage: true  });
  
//     await browser.close();
  
//     // Clean up the temporary file
//     fs.unlinkSync(tempFilePath);
  
//     return screenshotPath;
//   };