// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");
// const pixelmatch = require("pixelmatch");
// const { createCanvas, loadImage } = require("canvas");
// // const connectDB = require("./config/connectDb");

// // connectDB();
// const app = express();
// app.use(bodyParser.json());

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// // API endpoint to handle HTML/CSS submissions
// app.post("/api/submit-html-css", async (req, res) => {
//   const { htmlCode, cssCode, challengeId } = req.body;

//   try {
//     // Render the HTML/CSS and capture screenshot
//     const screenshotPath = await renderHtmlCss(htmlCode, cssCode, challengeId);

//     // Compare with reference image
//     const referencePath = path.join(__dirname, `reference-images/${challengeId}.png`);
//     const similarity = await compareImages(referencePath, screenshotPath);

//     res.status(200).send({ screenshotPath, similarity });
//   } catch (error) {
//     console.error("Error processing submission:", error);
//     res.status(500).send({ error: "Failed to process submission" });
//   }
// });

// // Function to render HTML/CSS and capture a screenshot
// const renderHtmlCss = async (htmlCode, cssCode, challengeId) => {
//   const tempFilePath = path.join(__dirname, `temp/${challengeId}.html`);
//   const screenshotPath = path.join(__dirname, `screenshots/${challengeId}.png`);

//   // Combine HTML and CSS into a single file
//   const htmlContent = `
//     <html>
//       <head>
//         <style>${cssCode}</style>
//       </head>
//       <body>${htmlCode}</body>
//     </html>`;
//   fs.writeFileSync(tempFilePath, htmlContent);

//   // Launch Puppeteer and render the HTML
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(`file://${tempFilePath}`);  
//   await page.screenshot({ path: screenshotPath, fullPage: true  });

//   await browser.close();

//   // Clean up the temporary file
//   fs.unlinkSync(tempFilePath);

//   return screenshotPath;
// };

// // Function to compare two images and calculate similarity
// const compareImages = async (image1Path, image2Path) => {
//   const img1 = await loadImage(image1Path);
//   const img2 = await loadImage(image2Path);

//   // Standardize canvas dimensions (e.g., 800x600)
//   const width = Math.max(img1.width, img2.width);  // Choose the larger width
//   const height = Math.max(img1.height, img2.height); // Choose the larger height

//   // Create canvases with the standardized dimensions
//   const canvas1 = createCanvas(width, height);
//   const canvas2 = createCanvas(width, height);

//   const ctx1 = canvas1.getContext("2d");
//   const ctx2 = canvas2.getContext("2d");

//   // Draw the images onto canvases, resized to match the standard dimensions
//   ctx1.drawImage(img1, 0, 0, width, height);
//   ctx2.drawImage(img2, 0, 0, width, height);

//   // Get the pixel data for both images
//   const imgData1 = ctx1.getImageData(0, 0, width, height);
//   const imgData2 = ctx2.getImageData(0, 0, width, height);

//   // Create a canvas for the difference image
//   const diffCanvas = createCanvas(width, height);
//   const diffCtx = diffCanvas.getContext("2d");
//   const diffImage = diffCtx.createImageData(width, height);

//   // Compare the images using Pixelmatch
//   const diff = pixelmatch(
//       imgData1.data,
//       imgData2.data,
//       diffImage.data,
//       width,
//       height,
//       { threshold: 0.1 } // Adjust threshold as needed
//   );

//   // Calculate similarity score
//   const similarity = 1 - diff / (width * height);

//   return similarity;
// };

// // Start the server
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// module.exports = { app };



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDb");

connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/gamified-learning/api/submission-management", (req, res) => {
  res.send("submission managers service responded");
});

app.use(
  "/gamified-learning/api/submission-management/challenge",
  require("./routes/challenge.routes")
);

app.use(
  "/gamified-learning/api/submission-management/submission",
  require("./routes/submission.routes")
);

let serverPromise = new Promise((resolve, reject) => {
  mongoose.connection.once("open", () => {
    console.log(`🚀 data connection with users collection established! 🚀`);
    const server = app.listen(PORT, () => {
      console.log(
        `👦 Submission management service is up and running on port: ${PORT} 👦`
      );
      resolve(server);
    });
  });
});

module.exports = { app, serverPromise };
