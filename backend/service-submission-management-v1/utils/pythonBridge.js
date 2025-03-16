// utils/pythonBridge.js
const { spawn } = require('child_process');
const path = require('path');

/**
 * Executes a Python script with the given arguments and returns the result
 * @param {string} scriptPath - Path to the Python script
 * @param {Object} inputData - Data to pass to the Python script as JSON
 * @returns {Promise<any>} - The parsed JSON output from the Python script
 */
function executePythonScript(scriptPath, inputData) {
  return new Promise((resolve, reject) => {
    // Convert input data to JSON string
    const inputJson = JSON.stringify(inputData);
    
    // Spawn Python process
    const pythonProcess = spawn('python', [scriptPath, inputJson]);
    
    let outputData = '';
    let errorData = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Collect data from stderr
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Error output: ${errorData}`);
        return reject(new Error(`Python script failed with code ${code}: ${errorData}`));
      }

      try {
        // Try to parse the output as JSON
        const result = JSON.parse(outputData);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python script output as JSON:', outputData);
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Compare two images using ResNet-50 model via Python
 * @param {string} image1Path - Path to the first image
 * @param {string} image2Path - Path to the second image
 * @returns {Promise<number>} - Similarity score between 0 and 1
 */
async function compareImagesWithResNet(image1Path, image2Path) {
  try {
    const scriptPath = path.join(__dirname, 'similarity_checker.py');
    
    const result = await executePythonScript(scriptPath, {
      userImage: image1Path,
      referenceImage: image2Path
    });
    
    return result.similarity;
  } catch (error) {
    console.error('Error comparing images with ResNet:', error);
    return 0; // Return 0 score on error
  }
}

module.exports = { compareImagesWithResNet };