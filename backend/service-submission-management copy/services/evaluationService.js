const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas } = require('canvas');
const pixelmatch = require('pixelmatch');

class EvaluationService {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.modelPath = path.join(__dirname, '../models/resnet/model.json');
  }

  async initialize() {
    try {
      if (!this.initialized) {
        console.log('Initializing AI evaluation service...');
        
        // Check if model exists
        if (!fs.existsSync(this.modelPath)) {
          throw new Error('ResNet model not found! Please run the setup script first.');
        }
        
        // Load the model
        this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
        this.initialized = true;
        console.log('AI evaluation service initialized successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize AI evaluation service:', error);
      throw error;
    }
  }

  async preprocessImage(imagePath) {
    try {
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      
      // Process image to match model requirements (224x224)
      const processedImage = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .toBuffer();
      
      // Convert to tensor
      const tensor = tf.node.decodeImage(processedImage, 3);
      
      // Normalize pixel values to [0, 1]
      const normalized = tensor.div(255.0);
      
      // Expand dimensions to match model input shape [1, 224, 224, 3]
      return normalized.expandDims(0);
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  async extractFeatures(imagePath) {
    await this.initialize();
    
    try {
      const preprocessedImage = await this.preprocessImage(imagePath);
      
      // Extract features using the model
      const features = this.model.predict(preprocessedImage);
      
      // Clean up tensor
      preprocessedImage.dispose();
      
      // Return the features as a regular array
      const flattenedFeatures = features.mean([1, 2]).dataSync();
      features.dispose();
      
      return flattenedFeatures;
    } catch (error) {
      console.error('Error extracting features:', error);
      throw error;
    }
  }

  calculateCosineSimilarity(featuresA, featuresB) {
    // Calculate cosine similarity between two feature vectors
    const dotProduct = featuresA.reduce((sum, a, i) => sum + a * featuresB[i], 0);
    const magnitudeA = Math.sqrt(featuresA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(featuresB.reduce((sum, b) => sum + b * b, 0));
    
    // Handle potential division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async calculatePixelSimilarity(referenceImagePath, submissionImagePath) {
    try {
      // Process both images to the same dimensions
      const width = 800;
      const height = 600;
      
      const referenceBuffer = await sharp(referenceImagePath)
        .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .raw()
        .toBuffer();
        
      const submissionBuffer = await sharp(submissionImagePath)
        .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
        .raw()
        .toBuffer();
      
      // Create canvas for pixelmatch
      const diffCanvas = createCanvas(width, height);
      const diffContext = diffCanvas.getContext('2d');
      const diffImageData = diffContext.createImageData(width, height);
      
      // Calculate pixel differences
      const numDiffPixels = pixelmatch(
        referenceBuffer, 
        submissionBuffer,
        diffImageData.data,
        width,
        height,
        { threshold: 0.1 }
      );
      
      // Calculate similarity percentage (inverse of difference)
      const totalPixels = width * height;
      const pixelSimilarity = 100 - (numDiffPixels / totalPixels * 100);
      
      return pixelSimilarity;
    } catch (error) {
      console.error('Error calculating pixel similarity:', error);
      throw error;
    }
  }

  async evaluateSubmission(referenceImagePath, submissionImagePath) {
    try {
      // Extract features from both images
      const referenceFeatures = await this.extractFeatures(referenceImagePath);
      const submissionFeatures = await this.extractFeatures(submissionImagePath);
      
      // Calculate semantic similarity using the ResNet model
      const semanticSimilarity = this.calculateCosineSimilarity(referenceFeatures, submissionFeatures);
      
      // Calculate pixel-level similarity
      const pixelSimilarity = await this.calculatePixelSimilarity(referenceImagePath, submissionImagePath);
      
      // Combine both scores with weights (semantic similarity is given more weight)
      const combinedScore = (semanticSimilarity * 0.7 + (pixelSimilarity / 100) * 0.3);
      
      // Scale to percentage and round to nearest integer
      const finalScore = Math.round(combinedScore * 100);
      
      // Generate detailed feedback based on the score
      let feedback = this.generateFeedback(finalScore, semanticSimilarity * 100, pixelSimilarity);
      
      return {
        similarityScore: finalScore,
        semanticScore: Math.round(semanticSimilarity * 100),
        pixelScore: Math.round(pixelSimilarity),
        feedback
      };
    } catch (error) {
      console.error('Error evaluating submission:', error);
      throw error;
    }
  }

  generateFeedback(finalScore, semanticScore, pixelScore) {
    let feedback = '';
    
    // Base feedback on the final score
    if (finalScore >= 90) {
      feedback = `Excellent job! Your solution is very similar to the reference design (${finalScore}% match). `;
    } else if (finalScore >= 75) {
      feedback = `Good work! Your solution closely resembles the reference design (${finalScore}% match). `;
    } else if (finalScore >= 60) {
      feedback = `Nice attempt! Your solution has some similarities to the reference design (${finalScore}% match). `;
    } else if (finalScore >= 40) {
      feedback = `You're on the right track, but there are significant differences from the reference design (${finalScore}% match). `;
    } else {
      feedback = `Your solution differs substantially from the reference design (${finalScore}% match). `;
    }
    
    // Add more specific feedback based on semantic vs. pixel scores
    if (semanticScore > pixelScore + 15) {
      feedback += "Your design captures the overall structure well, but there are differences in the details or positioning of elements. ";
    } else if (pixelScore > semanticScore + 15) {
      feedback += "The pixel-level details of your design match well, but there may be differences in the overall structure or organization. ";
    }
    
    // Add suggestions based on the score range
    if (finalScore < 50) {
      feedback += "Try examining the layout, spacing, colors, and fonts in the reference image more closely. ";
    } else if (finalScore < 75) {
      feedback += "Consider fine-tuning the positioning, spacing, and styling of elements to more closely match the reference. ";
    } else if (finalScore < 90) {
      feedback += "To improve further, focus on the finer details like exact spacing, font sizes, and color values. ";
    }
    
    return feedback;
  }
}

module.exports = new EvaluationService();