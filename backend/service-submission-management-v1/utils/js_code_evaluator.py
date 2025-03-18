import sys
import json
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
import re
import esprima
from scipy.spatial.distance import cosine
import difflib
import string

class JavaScriptEvaluator:
    """Evaluates JavaScript code quality and correctness by comparing with reference solutions."""
    
    def __init__(self, model_name="microsoft/codebert-base"):
        """Initialize with the specified model."""
        try:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name).to(self.device)
            self.model.eval()
            print(f"Model loaded on {self.device}", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            raise

    def check_syntax(self, js_code):
        """Check JavaScript syntax using esprima."""
        try:
            esprima.parseScript(js_code)
            return True, None
        except Exception as e:
            return False, str(e)

    def extract_code_features(self, js_code):
        """Extract features from JavaScript code using CodeBERT."""
        try:
            # Tokenize code
            inputs = self.tokenizer(js_code, return_tensors="pt", max_length=512, 
                                   padding="max_length", truncation=True).to(self.device)
            
            # Get model outputs
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            # Use CLS token embedding as code representation
            code_features = outputs.last_hidden_state[:, 0, :].cpu().numpy().flatten()
            return code_features
        except Exception as e:
            print(f"Error extracting code features: {e}", file=sys.stderr)
            raise

    def compare_code_correctness(self, js_code, correct_solution):
        """Compare submitted code against the correct solution to generate a correctness score."""
        if not js_code.strip():
            return 0.0, ["No code submitted to evaluate"]
        
        if not correct_solution.strip() or correct_solution.strip().startswith("//"):
            print(f"Warning: No valid reference solution provided. Got: {correct_solution[:50]}...", file=sys.stderr)
            return 0.31, ["No reference solution available for comparison. Evaluating based on code quality only."]
        
        print(f"Comparing user code ({len(js_code)} chars) with solution ({len(correct_solution)} chars)", file=sys.stderr)
        
        correctness_score = 0.0
        correctness_feedback = []
        
        try:
            # Method 1: Semantic similarity using CodeBERT
            try:
                user_features = self.extract_code_features(js_code)
                solution_features = self.extract_code_features(correct_solution)
                
                # Calculate cosine similarity for semantic comparison (preserves natural decimal places)
                semantic_similarity = 1 - cosine(user_features, solution_features)
                print(f"Semantic similarity: {semantic_similarity}", file=sys.stderr)
            except Exception as e:
                print(f"Error in semantic comparison: {e}", file=sys.stderr)
                semantic_similarity = 0.37
            
            # Method 2: Token-based comparison
            try:
                # Normalize both codes (remove comments, standardize spacing)
                normalized_user = self.normalize_js_code(js_code)
                normalized_solution = self.normalize_js_code(correct_solution)
                
                # Tokenize the code
                user_tokens = re.findall(r'[\w]+|[^\s\w]', normalized_user)
                solution_tokens = re.findall(r'[\w]+|[^\s\w]', normalized_solution)
                
                # Calculate token similarity
                matcher = difflib.SequenceMatcher(None, user_tokens, solution_tokens)
                token_similarity = matcher.ratio()
                print(f"Token similarity: {token_similarity}", file=sys.stderr)
            except Exception as e:
                print(f"Error in token comparison: {e}", file=sys.stderr)
                token_similarity = 0.23
            
            try:
                user_functions = re.findall(r'function\s+(\w+)\s*\(([^)]*)\)', js_code)
                solution_functions = re.findall(r'function\s+(\w+)\s*\(([^)]*)\)', correct_solution)
                
                # Count matching function names and signatures with partial matches
                function_matches = 0
                partial_matches = 0
                for u_func in user_functions:
                    for s_func in solution_functions:
                        if u_func[0] == s_func[0]: 
                            # Compare parameter count
                            u_params = [p.strip() for p in u_func[1].split(',') if p.strip()]
                            s_params = [p.strip() for p in s_func[1].split(',') if p.strip()]
                            
                            if len(u_params) == len(s_params):
                                function_matches += 1
                                break
                            else:
                              
                                similarity = min(len(u_params), len(s_params)) / max(1, max(len(u_params), len(s_params)))
                                partial_matches += similarity
                
                # Include partial matches for more granular scoring
                function_similarity = (function_matches + (0.5 * partial_matches)) / max(1, max(len(user_functions), len(solution_functions)))
                print(f"Function similarity: {function_similarity}", file=sys.stderr)
            except Exception as e:
                print(f"Error in function comparison: {e}", file=sys.stderr)
                function_similarity = 0.00
            
            # Method 4: Check for critical lines of code
            try:
                user_method_calls = re.findall(r'(\w+)\s*\.\s*(\w+)\s*\(', js_code)
                solution_method_calls = re.findall(r'(\w+)\s*\.\s*(\w+)\s*\(', correct_solution)
                
                # Count matching method calls with more precise calculation
                method_matches = len(set(user_method_calls).intersection(set(solution_method_calls)))
                total_methods = max(1, max(len(user_method_calls), len(solution_method_calls)))
                method_similarity = method_matches / total_methods
                print(f"Method similarity: {method_similarity}", file=sys.stderr)
            except Exception as e:
                print(f"Error in method comparison: {e}", file=sys.stderr)
                method_similarity = 0.19 
            
            # Combine scores with weights
            correctness_score = (0.37 * semantic_similarity + 
                                0.33 * token_similarity + 
                                0.15 * function_similarity +
                                0.15 * method_similarity)
            
            print(f"Combined correctness score: {correctness_score}", file=sys.stderr)
            
            # Set a minimum score that allows decimal precision
            correctness_score = max(0.18, correctness_score)
            
            # Generate feedback
            if correctness_score > 0.85:
                correctness_feedback.append("Your solution closely matches the expected implementation. Great job!")
            elif correctness_score > 0.7:
                correctness_feedback.append("Your solution is quite similar to the expected implementation with only minor differences.")
            elif correctness_score > 0.5:
                correctness_feedback.append("Your solution has the right approach but differs significantly from the expected implementation.")
            else:
                correctness_feedback.append("Your solution differs substantially from the expected implementation.")
            
            # Add specific feedback
            if function_similarity < 0.5 and len(solution_functions) > 0:
                correctness_feedback.append("Your function structure differs from the expected solution.")
                
                # Provide hints about expected functions
                if len(solution_functions) <= 3:
                    expected_funcs = [f"{func[0]}({func[1]})" for func in solution_functions]
                    correctness_feedback.append(f"Consider implementing functions like: {', '.join(expected_funcs)}")
            
            if method_similarity < 0.5 and len(solution_method_calls) > 0:
                correctness_feedback.append("Your code uses different methods/APIs than the expected solution.")
                
                # Extract some key methods from the solution for hints
                if len(solution_method_calls) <= 5: 
                    key_methods = set([f"{obj}.{method}" for obj, method in solution_method_calls])
                    sample_methods = list(key_methods)[:3] 
                    correctness_feedback.append(f"Consider using methods like: {', '.join(sample_methods)}")
            
            return correctness_score, correctness_feedback
        
        except Exception as e:
            print(f"Error comparing code correctness: {e}", file=sys.stderr)
            return 0.22, ["Error evaluating code correctness. Evaluating based on code quality only."]
    
    def normalize_js_code(self, code):
        """Normalize JavaScript code by removing comments, extra whitespace, etc."""
        # Remove comments
        code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
        code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        
        # Normalize whitespace
        code = re.sub(r'\s+', ' ', code)
        
        # Normalize variable declarations (var/let/const)
        code = re.sub(r'(var|let|const)\s+', 'var ', code)
        
        return code.strip()

    def analyze_code_metrics(self, js_code):
        """Analyze JavaScript code for basic quality metrics."""
        metrics = {
            "complexity": 0.0,
            "readability": 0.0,
            "maintainability": 0.0
        }
        
        try:
            # Count lines of code
            lines = js_code.strip().split('\n')
            non_empty_lines = [line for line in lines if line.strip() and not line.strip().startswith('//')]
            
            # Basic complexity
            function_count = len(re.findall(r'function\s+\w+\s*\(', js_code))
            loop_count = len(re.findall(r'(for|while)\s*\(', js_code))
            conditional_count = len(re.findall(r'if\s*\(', js_code))
            
            # Calculate complexity score
            complexity_score = (function_count + loop_count + conditional_count) / max(1, len(non_empty_lines))
            metrics["complexity"] = 1.0 - min(complexity_score * 1.87, 0.9) 
            
            # Check for comments
            comment_lines = len([line for line in lines if line.strip().startswith('//')])
            comment_ratio = comment_lines / max(1, len(non_empty_lines))
            
            # Check indentation consistency
            indentation_patterns = [len(line) - len(line.lstrip()) for line in lines if line.strip()]
            indentation_consistency = np.std(indentation_patterns) if indentation_patterns else 0
            
            # Readability score
            metrics["readability"] = min(0.97, 0.53 + (comment_ratio * 1.2) - (indentation_consistency / 22.5))
            
            # Check for maintainability indicators
            error_handling = 'try' in js_code and 'catch' in js_code
            modular_functions = function_count > 0
            variable_naming = len(re.findall(r'const|let|var\s+[a-zA-Z_]\w*\s*=', js_code))
            
            # Maintainability score
            metrics["maintainability"] = min(0.95, 0.32 + 
                                          (0.23 if error_handling else 0) + 
                                          (0.18 if modular_functions else 0) + 
                                          (min(0.28, variable_naming * 0.047)))
            
            return metrics
        except Exception as e:
            print(f"Error analyzing code metrics: {e}", file=sys.stderr)
            return metrics

    def check_best_practices(self, js_code):
        """Check JavaScript code for best practices."""
        issues = []
        
        # Check for unsafe practices
        if 'eval(' in js_code:
            issues.append("Using eval() is generally unsafe")
        
        if 'document.write(' in js_code:
            issues.append("document.write() is discouraged")
        
        if 'innerHTML =' in js_code or '.innerHTML=' in js_code:
            issues.append("innerHTML can lead to XSS vulnerabilities, consider textContent")
        
        # Check for error handling
        if ('try' not in js_code) and (len(js_code) > 100):
            issues.append("Consider adding error handling with try/catch")
        
        # Check var vs let/const
        var_count = len(re.findall(r'var\s+', js_code))
        if var_count > 0:
            issues.append("Consider using let/const instead of var for better scoping")
        
        # Check for potential memory leaks
        event_listeners = len(re.findall(r'addEventListener', js_code))
        remove_listeners = len(re.findall(r'removeEventListener', js_code))
        if event_listeners > remove_listeners:
            issues.append("Potential memory leak: more addEventListener than removeEventListener calls")
        
        return issues

    def evaluate_javascript(self, js_code, challenge_title="", challenge_description="", correct_solution=""):
        """Evaluate JavaScript code and return a quality score and feedback."""
        print(f"Starting evaluation of JavaScript code", file=sys.stderr)
        
        results = {
            "score": 0.0,
            "syntax_valid": False,
            "metrics": {},
            "issues": [],
            "correctness_score": 0.0,
            "correctness_feedback": [],
            "feedback": ""
        }
        
        # 1. Check syntax
        syntax_valid, syntax_error = self.check_syntax(js_code)
        results["syntax_valid"] = syntax_valid
        
        if not syntax_valid:
            results["score"] = 0.00
            results["feedback"] = f"Syntax Error: {syntax_error}"
            return results
        
        # 2. Get code metrics
        metrics = self.analyze_code_metrics(js_code)
        results["metrics"] = metrics
        
        # 3. Check for best practices
        issues = self.check_best_practices(js_code)
        results["issues"] = issues
        
        correctness_score = 0.0
        correctness_feedback = []
        
        if correct_solution and correct_solution.strip() and not correct_solution.strip().startswith("//"):
            print(f"Evaluating correctness against reference solution", file=sys.stderr)
            correctness_score, correctness_feedback = self.compare_code_correctness(
                js_code, correct_solution)
            print(f"Correctness evaluation complete: score={correctness_score}", file=sys.stderr)
        else:
            print(f"No reference solution provided for correctness evaluation", file=sys.stderr)
            correctness_score = 0.33 
            correctness_feedback = ["No reference solution available for comparison."]

        results["correctness_score"] = correctness_score
        results["correctness_feedback"] = correctness_feedback

        # Base code quality score 
        code_quality_score = (metrics["readability"] + metrics["maintainability"] + metrics["complexity"]) / 3
        
        issue_penalty = min(0.47, len(issues) * 0.07)
        
        if correct_solution and correct_solution.strip() and not correct_solution.strip().startswith("//"):
            final_score = (0.77 * correctness_score + 
                          0.23 * max(0, code_quality_score - issue_penalty))
            print(f"Calculated final score with correctness: {final_score}", file=sys.stderr)
        else:
            # No solution, just use code quality
            final_score = max(0, code_quality_score - issue_penalty)
            print(f"Calculated final score with only quality: {final_score}", file=sys.stderr)
        
        results["score"] = max(0.05, min(0.99, final_score))

        feedback = []
        
        if final_score > 0.8:
            feedback.append("Excellent code quality")
        elif final_score > 0.6:
            feedback.append("Good code quality with some room for improvement")
        elif final_score > 0.4:
            feedback.append("Average code quality with several areas for improvement")
        else:
            feedback.append("Code quality needs significant improvement")
        
        if correctness_feedback:
            feedback.extend(correctness_feedback)
        
        # Add metric-specific feedback
        if metrics["readability"] < 0.5:
            feedback.append("Improve readability by adding comments and consistent indentation")
        
        if metrics["maintainability"] < 0.5:
            feedback.append("Improve maintainability by modularizing code and adding error handling")
        
        if metrics["complexity"] < 0.5:
            feedback.append("Reduce complexity by breaking down complex functions and loops")
        
        # Add issues
        for issue in issues:
            feedback.append(f"Issue: {issue}")
        
        results["feedback"] = "\n".join(feedback)
        
        print(f"Final evaluation results: score={results['score']}, correctness={results['correctness_score']}", file=sys.stderr)
        return results

def evaluate_code(js_code, challenge_title="", challenge_description="", correct_solution=""):
    """Evaluate JavaScript code and return results."""
    try:
        print(f"Creating JavaScriptEvaluator instance", file=sys.stderr)
        evaluator = JavaScriptEvaluator()
        
        print(f"Calling evaluate_javascript method", file=sys.stderr)
        results = evaluator.evaluate_javascript(js_code, challenge_title, challenge_description, correct_solution)
        
        results["score"] = float(results["score"] * 100)

        if "correctness_score" in results and results["correctness_score"] > 0:
            results["correctness_score"] = float(results["correctness_score"] * 100)
        else:
            results["correctness_score"] = float(results["correctness_score"] * 100)
        
        print(f"Python evaluator results: score={results['score']}, correctness={results['correctness_score']}", 
              file=sys.stderr)
        
        return results
    except Exception as e:
        print(f"Error evaluating code: {e}", file=sys.stderr)
        return {
            "error": str(e),
            "score": 0, 
            "correctness_score": 0, 
            "feedback": f"Error occurred during evaluation: {str(e)}"
        }

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise ValueError("Please provide the input JSON as a command line argument")
        
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        js_code = input_data.get("jsCode", "")
        challenge_title = input_data.get("challengeTitle", "")
        challenge_description = input_data.get("challengeDescription", "")
        correct_solution = input_data.get("correctSolution", "")  # Get the correct solution
        
        print(f"Evaluating code with: title='{challenge_title}', solution_length={len(correct_solution)}", file=sys.stderr)
        
        # Evaluate the JavaScript code
        evaluation_results = evaluate_code(js_code, challenge_title, challenge_description, correct_solution)
        
        # Return results as JSON
        print(json.dumps(evaluation_results))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input", "score": 20.5, "correctness_score": 18.7}))
    except ValueError as e:
        print(json.dumps({"error": str(e), "score": 20.5, "correctness_score": 18.7}))
    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {str(e)}", "score": 20.5, "correctness_score": 18.7}))