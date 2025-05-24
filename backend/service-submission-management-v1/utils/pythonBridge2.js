// utils/pythonBridge.js

// Add these at the very top to suppress warnings
process.env.HF_HUB_DISABLE_SYMLINKS_WARNING = "1";
process.env.TF_ENABLE_ONEDNN_OPTS = "0";
process.env.TF_CPP_MIN_LOG_LEVEL = "2";
process.env.PYTHONWARNINGS = "ignore::UserWarning";

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
      console.log('Python stderr:', data.toString());
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

/**
 * Evaluate JavaScript code quality using CodeBERT via Python
 * @param {string} jsCode - JavaScript code to evaluate
 * @param {string} challengeTitle - The title of the challenge (optional)
 * @param {string} challengeDescription - The description of the challenge (optional)
 * @param {string} correctSolution - The correct solution to compare against (optional)
 * @returns {Promise<Object>} - Evaluation results with score and feedback
 */
async function evaluateJavaScriptWithCodeBERT(
  jsCode, 
  challengeTitle = "", 
  challengeDescription = "", 
  correctSolution = ""
) {
  try {
    const scriptPath = path.join(__dirname, 'js_code_evaluator.py');
    
    const result = await executePythonScript(scriptPath, {
      jsCode: jsCode,
      challengeTitle: challengeTitle,
      challengeDescription: challengeDescription,
      correctSolution: correctSolution // Pass the correct solution to Python
    });
    
    // Ensure we're working with numeric values
    const correctnessScore = result.correctness_score ? parseFloat(result.correctness_score) / 100 : 0;
    const finalScore = result.score ? parseFloat(result.score) / 100 : 0;
    
    console.log('Python evaluation result:', {
      originalScore: result.score,
      originalCorrectnessScore: result.correctness_score,
      calculatedScore: finalScore,
      calculatedCorrectnessScore: correctnessScore
    });
    
    return {
      score: finalScore,
      correctnessScore: correctnessScore,
      feedback: result.feedback,
      details: {
        syntax_valid: result.syntax_valid,
        metrics: result.metrics,
        issues: result.issues || []
      }
    };
  } catch (error) {
    console.error('Error evaluating JavaScript with CodeBERT:', error);
    return {
      score: 0,
      correctnessScore: 0,
      feedback: `Evaluation error: ${error.message}`,
      details: {
        syntax_valid: false,
        metrics: {},
        issues: [`Error: ${error.message}`]
      }
    };
  }
}

module.exports = { 
  compareImagesWithResNet,
  evaluateJavaScriptWithCodeBERT
};