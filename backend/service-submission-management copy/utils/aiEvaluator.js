const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class AIEvaluator {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Load pre-trained ResNet model
      this.model = await tf.loadLayersModel('file://./models/resnet50/model.json');
      this.initialized = true;
      console.log('AI Evaluator initialized with ResNet model');
    } catch (error) {
      console.error('Failed to initialize AI Evaluator:', error);
      throw error;
    }
  }

  async preprocessImage(imagePath) {
    try {
      // Resize image to 224x224 (ResNet input size)
      const imageBuffer = await sharp(imagePath)
        .resize(224, 224)
        .toBuffer();
      
      // Convert to tensor
      const tensor = tf.node.decodeImage(imageBuffer, 3);
      
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
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const preprocessedImage = await this.preprocessImage(imagePath);
      
      // Use intermediate layer as feature extractor
      const featureExtractor = tf.model({
        inputs: this.model.inputs,
        outputs: this.model.getLayer('conv5_block3_out').output
      });
      
      // Get feature vector
      const features = featureExtractor.predict(preprocessedImage);
      
      // Convert to array and flatten
      return features.mean([1, 2]).dataSync();
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
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async evaluateSubmission(referenceImagePath, submissionImagePath) {
    try {
      const referenceFeatures = await this.extractFeatures(referenceImagePath);
      const submissionFeatures = await this.extractFeatures(submissionImagePath);
      
      const similarity = this.calculateCosineSimilarity(referenceFeatures, submissionFeatures);
      
      // Convert similarity to percentage score (0-100)
      const score = Math.round((similarity + 1) / 2 * 100);
      
      // Generate feedback based on score
      let feedback = '';
      if (score >= 90) {
        feedback = 'Excellent! Your solution is very close to the reference design.';
      } else if (score >= 70) {
        feedback = 'Good job! Your solution resembles the reference design but has some differences.';
      } else if (score >= 50) {
        feedback = 'Nice attempt. There are noticeable differences from the reference design.';
      } else {
        feedback = 'Your solution differs significantly from the reference design. Try to look more closely at the details.';
      }
      
      return {
        similarityScore: score,
        feedback
      };
    } catch (error) {
      console.error('Error evaluating submission:', error);
      throw error;
    }
  }
}

module.exports = new AIEvaluator();