const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const fs = require('fs');

/**
 * Compare two images and calculate a similarity score
 * @param {string} referenceImagePath - Path to reference image
 * @param {string} submissionImagePath - Path to submission image
 * @returns {number} - Similarity score (0-100)
 */
const compareImages = async (referenceImagePath, submissionImagePath) => {
  // Read the images
  const img1 = PNG.sync.read(fs.readFileSync(referenceImagePath));
  const img2 = PNG.sync.read(fs.readFileSync(submissionImagePath));
  
  // Images should have the same dimensions
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  // Compare images pixel by pixel
  const mismatchedPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );
  
  // Calculate similarity score (inverse of difference percentage)
  const totalPixels = width * height;
  const diffPercentage = (mismatchedPixels / totalPixels) * 100;
  const similarityScore = Math.max(0, Math.min(100, 100 - diffPercentage));
  
  return Math.round(similarityScore);
};

module.exports = {
  compareImages
};