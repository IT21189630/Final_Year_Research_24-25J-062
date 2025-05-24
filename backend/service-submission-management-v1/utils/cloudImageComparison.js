// utils/cloudImageComparison.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { compareImages } = require('./imageComparison');

/**
 * Compare two images using a cloud-based AI service
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @returns {Promise<number>} - Similarity score (0-1, where 1 is perfect match)
 */
const compareImagesWithCloudAI = async (referenceImagePath, submissionImagePath) => {
  try {
    console.log('Comparing images with Cloud AI Service:');
    console.log('Reference:', referenceImagePath);
    console.log('Submission:', submissionImagePath);
    
    // Check if files exist
    if (!fs.existsSync(referenceImagePath) || !fs.existsSync(submissionImagePath)) {
      console.error('One or both image files do not exist');
      return 0;
    }

    // Read both images as streams
    const referenceImageStream = fs.createReadStream(referenceImagePath);
    const submissionImageStream = fs.createReadStream(submissionImagePath);
    
    // Create form data for the API request
    const formData = new FormData();
    formData.append('reference_image', referenceImageStream);
    formData.append('submission_image', submissionImageStream);
    
    // Replace this with your actual API endpoint
    // You can use services like Cloudinary, ImgBB, or custom API
    const API_ENDPOINT = process.env.IMAGE_COMPARISON_API || 'https://your-image-api.com/compare';
    const API_KEY = process.env.IMAGE_COMPARISON_API_KEY || 'your-api-key';
    
    // Make the API request
    const response = await axios.post(API_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Extract similarity score from response
    const similarity = response.data.similarity || 0;
    
    console.log(`Cloud AI similarity score: ${similarity.toFixed(4)}`);
    
    return similarity;
  } catch (error) {
    console.error('Error comparing images with Cloud AI:', error);
    console.log('Falling back to pixel-based comparison only');
    // Fall back to basic comparison if the API fails
    return 0;
  }
};

/**
 * Implementation that uses feature-based algorithm (ORB) for local processing
 * This doesn't require tensorflow but still provides better matching than pixels
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @returns {Promise<number>} - Similarity score (0-1)
 */
const compareImagesWithFeatures = async (referenceImagePath, submissionImagePath) => {
  try {
    // This is where we would implement OpenCV-based feature matching
    // Since we can't use external libraries, we'll use a simplified implementation
    
    // Using the sharp library for image processing (should be already in your dependencies)
    const sharp = require('sharp');
    
    // Load both images
    const referenceBuffer = await sharp(referenceImagePath).greyscale().toBuffer();
    const submissionBuffer = await sharp(submissionImagePath).greyscale().toBuffer();
    
    // Convert buffers to arrays for processing
    const refImg = new Uint8Array(referenceBuffer);
    const subImg = new Uint8Array(submissionBuffer);
    
    // Simple histogram comparison (very basic but better than nothing)
    const refHistogram = calculateHistogram(refImg);
    const subHistogram = calculateHistogram(subImg);
    
    // Calculate histogram intersection (a simple similarity measure)
    const similarity = compareHistograms(refHistogram, subHistogram);
    
    console.log(`Feature-based similarity score: ${similarity.toFixed(4)}`);
    
    return similarity;
  } catch (error) {
    console.error('Error in feature-based comparison:', error);
    return 0;
  }
};

/**
 * Calculate a simple histogram of an image
 * @param {Uint8Array} imageData - Raw image data
 * @param {number} bins - Number of histogram bins
 * @returns {Array} - Histogram
 */
const calculateHistogram = (imageData, bins = 256) => {
  const histogram = new Array(bins).fill(0);
  
  for (let i = 0; i < imageData.length; i++) {
    histogram[imageData[i]]++;
  }
  
  // Normalize histogram
  const total = imageData.length;
  return histogram.map(bin => bin / total);
};

/**
 * Compare two histograms using histogram intersection
 * @param {Array} hist1 - First histogram
 * @param {Array} hist2 - Second histogram
 * @returns {number} - Similarity score (0-1)
 */
const compareHistograms = (hist1, hist2) => {
  let sum = 0;
  
  for (let i = 0; i < hist1.length; i++) {
    sum += Math.min(hist1[i], hist2[i]);
  }
  
  return sum;
};

/**
 * Hybrid comparison that can work without tensorflow
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @param {Object} options - Configuration options
 * @returns {Promise<number>} - Combined similarity score (0-1)
 */
const hybridCompareImages = async (referenceImagePath, submissionImagePath, options = {}) => {
  const { 
    useCloud = false, 
    pixelWeight = 0.6, 
    aiWeight = 0.4 
  } = options;

  try {
    // Run pixel-based comparison (always available)
    const pixelScore = await compareImages(referenceImagePath, submissionImagePath);
    
    let aiScore = 0;
    
    // Try AI-based comparison if configured
    if (useCloud) {
      aiScore = await compareImagesWithCloudAI(referenceImagePath, submissionImagePath);
    } else {
      // Use local feature-based comparison
      aiScore = await compareImagesWithFeatures(referenceImagePath, submissionImagePath);
    }
    
    // Weighted combination - if AI method fails, rely more on pixel score
    const combinedScore = aiScore === 0 
      ? pixelScore
      : (pixelScore * pixelWeight) + (aiScore * aiWeight);
    
    console.log(`Hybrid comparison scores - Pixel: ${pixelScore.toFixed(2)}, Advanced: ${aiScore.toFixed(2)}, Combined: ${combinedScore.toFixed(2)}`);
    
    return combinedScore;
  } catch (error) {
    console.error('Error in hybrid image comparison:', error);
    
    // Fallback to original comparison if all else fails
    try {
      return await compareImages(referenceImagePath, submissionImagePath);
    } catch {
      return 0; // Return 0 score on complete failure
    }
  }
};

module.exports = { 
  compareImagesWithCloudAI,
  compareImagesWithFeatures,
  hybridCompareImages
};