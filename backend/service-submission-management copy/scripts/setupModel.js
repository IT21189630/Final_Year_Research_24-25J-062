const tf = require('@tensorflow/tfjs');
const fs = require('fs-extra');
const path = require('path');

async function setupResNetModel() {
  try {
    console.log('Setting up ResNet model...');
    
    // Create model directory
    const modelDir = path.join(__dirname, '../models/resnet50');
    await fs.ensureDir(modelDir);
    
    // Load pre-trained ResNet50 model
    const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/imagenet/resnet_v2_50/feature_vector/1/default/1';
    const model = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });
    
    // Save model to local directory
    await model.save(`file://${modelDir}`);
    
    console.log('ResNet model setup complete!');
  } catch (error) {
    console.error('Error setting up ResNet model:', error);
    process.exit(1);
  }
}

// Run setup
setupResNetModel();