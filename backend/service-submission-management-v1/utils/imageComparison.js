const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const path = require('path');

/**
 * Compare two images and return a similarity score from 0 to 1
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @returns {Promise<number>} - Similarity score (0-1, where 1 is perfect match)
 */
const compareImages = async (referenceImagePath, submissionImagePath) => {
  try {
    console.log('Comparing images:');
    console.log('Reference:', referenceImagePath);
    console.log('Submission:', submissionImagePath);
    
    // Check if files exist
    if (!fs.existsSync(referenceImagePath) || !fs.existsSync(submissionImagePath)) {
      console.error('One or both image files do not exist');
      return 0;
    }
    
    // Load both images
    const referenceImg = await loadImage(referenceImagePath);
    const submissionImg = await loadImage(submissionImagePath);
    
    console.log('Reference image dimensions:', referenceImg.width, 'x', referenceImg.height);
    console.log('Submission image dimensions:', submissionImg.width, 'x', submissionImg.height);
    
    // Create canvases with the same size (using reference image dimensions)
    const width = referenceImg.width;
    const height = referenceImg.height;
    
    const referenceCanvas = createCanvas(width, height);
    const submissionCanvas = createCanvas(width, height);
    
    // Draw images on their respective canvases
    const referenceCtx = referenceCanvas.getContext('2d');
    referenceCtx.drawImage(referenceImg, 0, 0, width, height);
    
    const submissionCtx = submissionCanvas.getContext('2d');
    
    // Scale the submission image to match the reference image size
    submissionCtx.drawImage(
      submissionImg, 
      0, 
      0, 
      submissionImg.width, 
      submissionImg.height, 
      0, 
      0, 
      width, 
      height
    );
    
    // Get the pixel data
    const referenceImgData = referenceCtx.getImageData(0, 0, width, height);
    const submissionImgData = submissionCtx.getImageData(0, 0, width, height);
    
    // Create an output canvas to show the difference
    const diffCanvas = createCanvas(width, height);
    const diffCtx = diffCanvas.getContext('2d');
    const diff = diffCtx.createImageData(width, height);
    
    // Compare the images pixel by pixel
    const mismatchedPixels = pixelmatch(
      referenceImgData.data,
      submissionImgData.data,
      diff.data,
      width,
      height,
      { 
        threshold: 0.2,  // More tolerant threshold
        includeAA: true, // Handle anti-aliasing
        alpha: 0.1       // Lower alpha threshold
      }
    );
    
    // Save the diff image for debugging
    const diffImagePath = path.join(
      path.dirname(submissionImagePath),
      `diff_${path.basename(submissionImagePath)}`
    );
    
    const diffStream = diffCanvas.createPNGStream();
    const out = fs.createWriteStream(diffImagePath);
    diffStream.pipe(out);
    
    // Calculate similarity score (0 to 1)
    const totalPixels = width * height;
    const similarityScore = Math.max(0, 1 - (mismatchedPixels / totalPixels));
    
    console.log(`Comparison complete. Mismatched pixels: ${mismatchedPixels}/${totalPixels}`);
    console.log(`Similarity score: ${similarityScore.toFixed(4)}`);
    
    return similarityScore;
  } catch (error) {
    console.error('Error comparing images:', error);
    return 0; // Return 0 score on error
  }
};

module.exports = { compareImages };