// utils/resnetImageComparison.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * ResNet-based image comparison utility
 * Uses a lightweight implementation without tensorflow dependencies
 */

// Import ONNX Runtime for JavaScript (needs to be installed)
// npm install onnxruntime-web --save
const ort = require('onnxruntime-web');

// Configuration
const MODEL_PATH = path.join(__dirname, '../models/resnet18.onnx');
const FEATURE_DIMENSION = 512; // ResNet-18 feature dimension

/**
 * Preprocess image for ResNet model
 * @param {Buffer} imageBuffer - Raw image data
 * @returns {Promise<Float32Array>} - Preprocessed tensor
 */
async function preprocessImage(imageBuffer) {
  try {
    // Resize image to 224x224 (standard ResNet input size)
    const resizedImage = await sharp(imageBuffer)
      .resize(224, 224, { fit: 'cover' })
      .raw()
      .toBuffer();
    
    // Convert to RGB float32 tensor and normalize
    const tensor = new Float32Array(224 * 224 * 3);
    const pixels = new Uint8Array(resizedImage);
    
    // Normalize using ImageNet mean and std
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    for (let i = 0; i < pixels.length / 3; i++) {
      // Get RGB values
      const r = pixels[i * 3] / 255;
      const g = pixels[i * 3 + 1] / 255;
      const b = pixels[i * 3 + 2] / 255;
      
      // Normalize and convert to CHW format (channels first)
      tensor[i] = (r - mean[0]) / std[0];
      tensor[i + 224 * 224] = (g - mean[1]) / std[1];
      tensor[i + 2 * 224 * 224] = (b - mean[2]) / std[2];
    }
    
    return tensor;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
}

/**
 * Extract features from an image using ResNet model
 * @param {string} imagePath - Path to the image
 * @returns {Promise<Float32Array>} - Feature vector
 */
async function extractFeatures(imagePath) {
  try {
    // Check if the model file exists
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`Model file not found: ${MODEL_PATH}. Please download the ResNet-18 ONNX model.`);
    }
    
    // Read and preprocess the image
    const imageBuffer = fs.readFileSync(imagePath);
    const inputTensor = await preprocessImage(imageBuffer);
    
    // Create ONNX Runtime session
    const session = await ort.InferenceSession.create(MODEL_PATH);
    
    // Run inference
    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];
    
    const feeds = {};
    feeds[inputName] = new ort.Tensor('float32', inputTensor, [1, 3, 224, 224]);
    
    const results = await session.run(feeds);
    const outputTensor = results[outputName].data;
    
    // Return feature vector
    return outputTensor;
  } catch (error) {
    console.error('Error extracting features:', error);
    
    // Return null to indicate failure
    return null;
  }
}

/**
 * Calculate cosine similarity between two feature vectors
 * @param {Float32Array} features1 - First feature vector
 * @param {Float32Array} features2 - Second feature vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(features1, features2) {
  // If either feature extraction failed, return 0
  if (!features1 || !features2) return 0;
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < features1.length; i++) {
    dotProduct += features1[i] * features2[i];
    magnitude1 += features1[i] * features1[i];
    magnitude2 += features2[i] * features2[i];
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return (dotProduct / (magnitude1 * magnitude2) + 1) / 2; // Normalize to 0-1
}

/**
 * Compare two images using ResNet feature extraction
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @returns {Promise<number>} - Similarity score (0-1)
 */
async function compareImagesWithResNet(referenceImagePath, submissionImagePath) {
  try {
    console.log('Comparing images with ResNet:');
    console.log('Reference:', referenceImagePath);
    console.log('Submission:', submissionImagePath);
    
    // Extract features from both images
    const refFeatures = await extractFeatures(referenceImagePath);
    const subFeatures = await extractFeatures(submissionImagePath);
    
    // Calculate similarity
    const similarity = cosineSimilarity(refFeatures, subFeatures);
    
    console.log(`ResNet similarity score: ${similarity.toFixed(4)}`);
    
    return similarity;
  } catch (error) {
    console.error('Error comparing images with ResNet:', error);
    return 0;
  }
}

/**
 * Fallback to MobileNet if ResNet fails
 * More lightweight but less accurate
 */
async function compareImagesWithMobileNet(referenceImagePath, submissionImagePath) {
  // Simplified MobileNet implementation
  // This could be expanded if needed
  
  try {
    // Use the feature-based comparison as a fallback
    const { compareImagesWithFeatures } = require('./cloudImageComparison');
    return await compareImagesWithFeatures(referenceImagePath, submissionImagePath);
  } catch (error) {
    console.error('Error in MobileNet fallback:', error);
    return 0;
  }
}

/**
 * Enhanced hybrid comparison with ResNet
 * @param {string} referenceImagePath - Path to the reference image
 * @param {string} submissionImagePath - Path to the submission image
 * @param {Object} options - Configuration options
 * @returns {Promise<number>} - Combined similarity score (0-1)
 */
async function enhancedCompareImages(referenceImagePath, submissionImagePath, options = {}) {
  const { 
    pixelWeight = 0.3, 
    resnetWeight = 0.7,
    useMobileNetFallback = true
  } = options;

  try {
    // Run pixel-based comparison (from existing code)
    const { compareImages } = require('./imageComparison');
    const pixelScore = await compareImages(referenceImagePath, submissionImagePath);
    
    // Run ResNet-based comparison
    let deepScore = await compareImagesWithResNet(referenceImagePath, submissionImagePath);
    
    // Fallback to MobileNet if ResNet failed and fallback is enabled
    if (deepScore === 0 && useMobileNetFallback) {
      console.log('ResNet failed, falling back to MobileNet...');
      deepScore = await compareImagesWithMobileNet(referenceImagePath, submissionImagePath);
    }
    
    // Weighted combination
    const combinedScore = deepScore === 0 
      ? pixelScore
      : (pixelScore * pixelWeight) + (deepScore * resnetWeight);
    
    console.log(`Enhanced comparison scores - Pixel: ${pixelScore.toFixed(2)}, ResNet: ${deepScore.toFixed(2)}, Combined: ${combinedScore.toFixed(2)}`);
    
    return combinedScore;
  } catch (error) {
    console.error('Error in enhanced image comparison:', error);
    
    // Fallback to original comparison if all else fails
    try {
      const { compareImages } = require('./imageComparison');
      return await compareImages(referenceImagePath, submissionImagePath);
    } catch {
      return 0; // Return 0 score on complete failure
    }
  }
}

module.exports = { 
  compareImagesWithResNet,
  compareImagesWithMobileNet,
  enhancedCompareImages
};