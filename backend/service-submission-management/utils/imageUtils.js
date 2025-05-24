const pixelmatch = require("pixelmatch");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

exports.compareImages = async (image1Path, image2Path, userHtml) => {

    // Check for blank submission
    if (!userHtml.trim()) {
        return 0; // Directly return 0% similarity for blank HTML
    }

    // // Normalize images
    // const normalizeImage = async (imagePath) => {
    //     return await sharp(imagePath)
    //         .flatten({ background: "#ffffff" }) // Ensure consistent background
    //         .toBuffer();
    // };

    // const img1Buffer = await normalizeImage(image1Path);
    // const img2Buffer = await normalizeImage(image2Path);

    const img1 = await loadImage(image1Path);
    const img2 = await loadImage(image2Path);
  
    // Standardize canvas dimensions (e.g., 800x600)
    const width = Math.max(img1.width, img2.width);  // Choose the larger width
    const height = Math.max(img1.height, img2.height); // Choose the larger height
  
    // Create canvases with the standardized dimensions
    const canvas1 = createCanvas(width, height);
    const canvas2 = createCanvas(width, height);
  
    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");
  
    // Draw the images onto canvases, resized to match the standard dimensions
    ctx1.drawImage(img1, 0, 0, width, height);
    ctx2.drawImage(img2, 0, 0, width, height);
  
    // Get the pixel data for both images
    const imgData1 = ctx1.getImageData(0, 0, width, height);
    const imgData2 = ctx2.getImageData(0, 0, width, height);
  
    // Create a canvas for the difference image
    const diffCanvas = createCanvas(width, height);
    const diffCtx = diffCanvas.getContext("2d");
    const diffImage = diffCtx.createImageData(width, height);
  
    // Compare the images using Pixelmatch
    const diff = pixelmatch(
        imgData1.data,
        imgData2.data,
        diffImage.data,
        width,
        height,
        { threshold: 0.1 } // Adjust threshold as needed
    );
  
    // Calculate similarity score
    const similarity = 1 - diff / (width * height);
  
    return similarity;
};