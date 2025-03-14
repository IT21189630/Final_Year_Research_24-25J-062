const tf = require('@tensorflow/tfjs');
const fs = require('fs-extra');
const path = require('path');

// Define the ResNet model architecture for feature extraction
async function createAndSaveResNetModel() {
  try {
    console.log('Creating and saving ResNet model for image comparison...');
    
    // Create model directory
    const modelDir = path.join(__dirname, '../models/resnet');
    await fs.ensureDir(modelDir);
    
    // Base ResNet50 model
    const baseModel = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfhub/resnet_v2_50/1/default/1/model.json');
    
    // Create feature extractor by removing the classification head
    const featureExtractor = tf.sequential();
    
    // Add convolutional layers from ResNet50
    for (let i = 0; i < baseModel.layers.length - 1; i++) {
      featureExtractor.add(baseModel.layers[i]);
    }
    
    // Freeze the weights of the feature extractor
    for (const layer of featureExtractor.layers) {
      layer.trainable = false;
    }
    
    // Save the feature extractor model
    await featureExtractor.save(`file://${modelDir}`);
    
    console.log('ResNet feature extractor model saved successfully!');
    return true;
  } catch (error) {
    console.error('Error creating and saving ResNet model:', error);
    return false;
  }
}

// Function to test the model on sample images
async function testModel() {
  try {
    console.log('Testing ResNet model with sample images...');
    
    // Load the saved model
    const modelDir = path.join(__dirname, '../models/resnet');
    const model = await tf.loadLayersModel(`file://${modelDir}/model.json`);
    
    // Create sample tensors (dummy images)
    const sampleImageA = tf.ones([1, 224, 224, 3]);
    const sampleImageB = tf.ones([1, 224, 224, 3]).mul(0.5);
    
    // Extract features
    const featuresA = model.predict(sampleImageA);
    const featuresB = model.predict(sampleImageB);
    
    console.log('Feature extraction successful!');
    console.log('Feature shape:', featuresA.shape);
    
    // Calculate cosine similarity between features
    const flatA = featuresA.reshape([featuresA.shape[1] * featuresA.shape[2] * featuresA.shape[3]]);
    const flatB = featuresB.reshape([featuresB.shape[1] * featuresB.shape[2] * featuresB.shape[3]]);
    
    const dotProduct = tf.sum(flatA.mul(flatB));
    const normA = tf.sqrt(tf.sum(flatA.square()));
    const normB = tf.sqrt(tf.sum(flatB.square()));
    
    const similarity = dotProduct.div(normA.mul(normB));
    
    console.log('Sample similarity score:', similarity.dataSync()[0]);
    
    // Clean up tensors
    tf.dispose([sampleImageA, sampleImageB, featuresA, featuresB, flatA, flatB]);
    
    return true;
  } catch (error) {
    console.error('Error testing model:', error);
    return false;
  }
}

// Main function to run the setup
async function main() {
  try {
    await createAndSaveResNetModel();
    await testModel();
    
    console.log('ResNet model setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('ResNet model setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();