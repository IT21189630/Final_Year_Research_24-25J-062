// utils/jsEvaluation.js
const { NodeVM } = require('vm2');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

/**
 * Evaluates JavaScript code for complexity, functionality, and best practices
 * @param {string} jsCode - The JavaScript code to evaluate
 * @param {string} expectedFunctionality - Optional expected functionality description
 * @returns {Object} - Evaluation results including score and feedback
 */
const evaluateJavaScript = async (jsCode, expectedFunctionality = '') => {
  try {
    if (!jsCode || jsCode.trim() === '' || jsCode.trim() === '// Your JavaScript here') {
      return {
        score: 0,
        evaluation: 'No JavaScript code provided.',
        details: {
          syntax: { score: 0, feedback: 'No code to check.' },
          complexity: { score: 0, feedback: 'No code to evaluate.' },
          bestPractices: { score: 0, feedback: 'No code to analyze.' }
        }
      };
    }

    // Results object to build
    const results = {
      score: 0,
      evaluation: '',
      details: {
        syntax: { score: 0, feedback: '' },
        complexity: { score: 0, feedback: '' },
        bestPractices: { score: 0, feedback: '' }
      }
    };

    // 1. Check syntax
    try {
      const ast = esprima.parseScript(jsCode, { tolerant: true });
      results.details.syntax.score = 100;
      results.details.syntax.feedback = 'No syntax errors detected.';
      
      // If there were any syntax errors caught in tolerant mode
      if (ast.errors && ast.errors.length > 0) {
        results.details.syntax.score = Math.max(50, 100 - (ast.errors.length * 10));
        results.details.syntax.feedback = `Found ${ast.errors.length} potential syntax issues.`;
      }
    } catch (syntaxError) {
      results.details.syntax.score = 0;
      results.details.syntax.feedback = `Syntax error: ${syntaxError.message}`;
      
      // Early return if code can't be parsed at all
      results.score = 0;
      results.evaluation = `JavaScript code couldn't be executed due to syntax errors: ${syntaxError.message}`;
      return results;
    }

    // 2. Evaluate code complexity and organization
    try {
      const ast = esprima.parseScript(jsCode);
      
      // Count different node types
      const counts = {
        functions: 0,
        conditionals: 0,
        loops: 0,
        variables: 0,
        comments: 0,
        eventListeners: 0
      };
      
      // Extract comments from the code
      const comments = jsCode.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || [];
      counts.comments = comments.length;
      
      // Traverse the AST to count various code structures
      estraverse.traverse(ast, {
        enter: function(node) {
          switch(node.type) {
            case 'FunctionDeclaration':
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
              counts.functions++;
              break;
            case 'IfStatement':
            case 'ConditionalExpression':
            case 'SwitchStatement':
              counts.conditionals++;
              break;
            case 'ForStatement':
            case 'WhileStatement':
            case 'DoWhileStatement':
            case 'ForInStatement':
            case 'ForOfStatement':
              counts.loops++;
              break;
            case 'VariableDeclaration':
              counts.variables += node.declarations.length;
              break;
            case 'CallExpression':
              // Check for event listeners
              if (node.callee.property && 
                 (node.callee.property.name === 'addEventListener' || 
                  node.callee.property.name === 'on')) {
                counts.eventListeners++;
              }
              break;
          }
        }
      });
      
      // Calculate complexity score based on counts
      const complexityScore = Math.min(100, 
        20 + // Base score
        counts.functions * 10 +
        counts.conditionals * 5 +
        counts.loops * 5 +
        counts.variables * 2 +
        counts.comments * 5 +
        counts.eventListeners * 10
      );
      
      results.details.complexity.score = complexityScore;
      results.details.complexity.feedback = generateComplexityFeedback(counts, complexityScore);
    } catch (complexityError) {
      results.details.complexity.score = 50; // Default to average if analysis fails
      results.details.complexity.feedback = 'Unable to analyze code complexity.';
    }

    // 3. Check best practices
    const bestPractices = checkBestPractices(jsCode);
    results.details.bestPractices = bestPractices;

    // 4. Try executing the code in a sandbox
    let executionResult = { success: false, error: null };
    try {
      const vm = new NodeVM({
        console: 'redirect',
        sandbox: { window: {} },
        require: {
          external: false,
          builtin: ['util'],
          root: "./",
          mock: {
            document: {
              querySelector: () => ({}),
              querySelectorAll: () => ([]),
              getElementById: () => ({}),
              createElement: () => ({
                setAttribute: () => {},
                style: {}
              }),
              addEventListener: () => {}
            },
            window: {
              addEventListener: () => {}
            }
          }
        }
      });
      
      let consoleOutput = [];
      vm.on('console.log', (message) => consoleOutput.push(message));
      vm.on('console.error', (message) => consoleOutput.push(`ERROR: ${message}`));
      
      // Execute code
      vm.run(`
        try {
          ${jsCode}
          console.log("Code executed successfully");
        } catch (error) {
          console.error(error.toString());
        }
      `);
      
      executionResult = { 
        success: !consoleOutput.some(msg => msg.startsWith('ERROR:')),
        output: consoleOutput
      };
    } catch (executionError) {
      executionResult = { 
        success: false, 
        error: executionError.message 
      };
    }

    // Calculate overall score
    const overallScore = Math.round(
      (results.details.syntax.score * 0.3) +
      (results.details.complexity.score * 0.4) +
      (results.details.bestPractices.score * 0.3)
    );
    
    results.score = executionResult.success ? overallScore : Math.floor(overallScore * 0.7);
    
    // Generate evaluation summary
    results.evaluation = generateEvaluationSummary(results, executionResult);
    
    return results;
  } catch (error) {
    console.error('Error in JavaScript evaluation:', error);
    return {
      score: 0,
      evaluation: `Failed to evaluate JavaScript: ${error.message}`,
      details: {
        syntax: { score: 0, feedback: 'Evaluation error' },
        complexity: { score: 0, feedback: 'Evaluation error' },
        bestPractices: { score: 0, feedback: 'Evaluation error' }
      }
    };
  }
};

/**
 * Generate feedback for code complexity
 */
function generateComplexityFeedback(counts, score) {
  if (score < 30) {
    return 'Code is very simple. Consider adding more functionality.';
  } else if (score < 60) {
    return `Code has basic structure with ${counts.functions} functions, ${counts.conditionals} conditionals, and ${counts.loops} loops.`;
  } else if (score < 85) {
    return `Good code organization with ${counts.functions} functions, ${counts.variables} variables, and ${counts.comments} comments.`;
  } else {
    return `Excellent code complexity and organization. Contains ${counts.functions} functions, ${counts.conditionals} conditionals, ${counts.loops} loops, ${counts.comments} comments, and ${counts.eventListeners} event listeners.`;
  }
}

/**
 * Check best practices in JavaScript code
 */
function checkBestPractices(jsCode) {
  const issues = [];
  let score = 100;
  
  // Check for var usage instead of let/const
  const varCount = (jsCode.match(/\bvar\s+/g) || []).length;
  if (varCount > 0) {
    issues.push('Consider using let/const instead of var for better scoping.');
    score -= Math.min(20, varCount * 5);
  }
  
  // Check for commented out code
  const commentedCodeLines = (jsCode.match(/\/\/.*\w+\s*\(|\/\/.*\w+\s*=|\/\/.*\bif\b|\/\/.*\bfor\b/g) || []).length;
  if (commentedCodeLines > 2) {
    issues.push('Consider removing commented out code before submission.');
    score -= Math.min(15, commentedCodeLines * 3);
  }
  
  // Check for console.log statements
  const consoleLogCount = (jsCode.match(/console\.log\(/g) || []).length;
  if (consoleLogCount > 3) {
    issues.push('Consider removing debug console.log statements before submission.');
    score -= Math.min(10, consoleLogCount * 2);
  }
  
  // Check for global variables
  const potentialGlobals = jsCode.match(/^(?!\s*(?:var|let|const|function|class|import|export)\b)[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/gm);
  if (potentialGlobals && potentialGlobals.length > 0) {
    issues.push('Avoid using global variables. Use let/const to declare variables.');
    score -= Math.min(20, potentialGlobals.length * 5);
  }
  
  // Check for use of addEventListener
  const hasEventListeners = jsCode.includes('addEventListener');
  if (!hasEventListeners && jsCode.includes('on') && jsCode.length > 100) {
    issues.push('Consider using addEventListener instead of on* attribute handlers.');
    score -= 10;
  }
  
  return {
    score: Math.max(0, score),
    feedback: issues.length > 0 ? issues.join(' ') : 'Code follows good practices.'
  };
}

/**
 * Generate overall evaluation summary
 */
function generateEvaluationSummary(results, executionResult) {
  let summary = '';
  
  // Execution status
  if (executionResult.success) {
    summary += '✅ Code executed successfully without errors.\n\n';
  } else {
    summary += `❌ Code execution failed: ${executionResult.error || 'Unknown error'}\n\n`;
  }
  
  // Syntax feedback
  summary += `Syntax: ${results.details.syntax.score}/100 - ${results.details.syntax.feedback}\n`;
  
  // Complexity feedback
  summary += `Complexity: ${results.details.complexity.score}/100 - ${results.details.complexity.feedback}\n`;
  
  // Best practices
  summary += `Best Practices: ${results.details.bestPractices.score}/100 - ${results.details.bestPractices.feedback}\n`;
  
  // Overall score explanation
  summary += `\nOverall JavaScript Score: ${results.score}/100`;
  
  return summary;
}

module.exports = { evaluateJavaScript };