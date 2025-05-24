// scripts/setup-resnet.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Configuration
const MODEL_DIR = path.join(__dirname, '../models');
const MODEL_URL = 'https://github.com/onnx/models/raw/main/vision/classification/resnet/model/resnet18-v1-7.onnx';
const MODEL_PATH = path.join(MODEL_DIR, 'resnet18.onnx');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log(`Created models directory: ${MODEL_DIR}`);
}

// Download ResNet model if it doesn't exist
if (!fs.existsSync(MODEL_PATH)) {
  console.log(`Downloading ResNet model from ${MODEL_URL}...`);
  
  const file = fs.createWriteStream(MODEL_PATH);
  
  https.get(MODEL_URL, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download model: ${response.statusCode} ${response.statusMessage}`);
      fs.unlinkSync(MODEL_PATH);
      process.exit(1);
    }
    
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Model downloaded to ${MODEL_PATH}`);
    });
  }).on('error', (err) => {
    fs.unlinkSync(MODEL_PATH);
    console.error(`Error downloading model: ${err.message}`);
  });
} else {
  console.log(`ResNet model already exists at ${MODEL_PATH}`);
}

// Install required packages
console.log('Installing required packages...');
exec('npm install onnxruntime-web --save', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing packages: ${error.message}`);
    return;
  }
  
  console.log('Packages installed successfully');
  console.log('Setup complete! You can now use ResNet for image comparison.');
});