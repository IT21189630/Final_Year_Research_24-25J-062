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
import hashlib
from functools import lru_cache
import threading
import time

class JavaScriptEvaluator:
    """Optimized JavaScript code evaluator with caching and early exit strategies."""
    
    def __init__(self, model_name="microsoft/codebert-base"):
        """Initialize with the specified model."""
        try:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name).to(self.device)
            self.model.eval()
            
            # Enable CUDA optimizations if available
            if torch.cuda.is_available():
                torch.backends.cudnn.benchmark = True
                torch.backends.cudnn.deterministic = False
            
            # Cache for code embeddings
            self._embedding_cache = {}
            self._normalized_cache = {}
            
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

    def _get_code_hash(self, code):
        """Generate a hash for code to use as cache key."""
        return hashlib.md5(code.encode()).hexdigest()

    @lru_cache(maxsize=128)
    def normalize_js_code(self, code):
        """Normalize JavaScript code with caching."""
        # Remove comments
        code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
        code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        
        # Normalize whitespace
        code = re.sub(r'\s+', ' ', code)
        
        # Normalize variable declarations (var/let/const)
        code = re.sub(r'\b(var|let|const)\s+', 'var ', code)
        
        # Remove semicolons and extra spaces
        code = re.sub(r';\s*', ' ', code)
        code = re.sub(r'\s*([{}()[\],])\s*', r'\1', code)
        
        return code.strip()

    def extract_code_features(self, js_code):
        """Extract features with caching to avoid recomputation."""
        code_hash = self._get_code_hash(js_code)
        
        if code_hash in self._embedding_cache:
            return self._embedding_cache[code_hash]
        
        try:
            # Tokenize code
            inputs = self.tokenizer(js_code, return_tensors="pt", max_length=512, 
                                   padding="max_length", truncation=True).to(self.device)
            
            # Get model outputs
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            # Use CLS token embedding as code representation
            code_features = outputs.last_hidden_state[:, 0, :].cpu().numpy().flatten()
            
            # Cache the result
            self._embedding_cache[code_hash] = code_features
            
            return code_features
        except Exception as e:
            print(f"Error extracting code features: {e}", file=sys.stderr)
            raise

    def quick_exact_match_check(self, js_code, correct_solution):
        """Quick check for exact or near-exact matches."""
        # Normalize both codes
        norm_user = self.normalize_js_code(js_code)
        norm_solution = self.normalize_js_code(correct_solution)
        
        # Check for exact match after normalization
        if norm_user == norm_solution:
            return True, 1.0
        
        # Quick similarity check
        matcher = difflib.SequenceMatcher(None, norm_user, norm_solution)
        ratio = matcher.ratio()
        
        # If very high similarity, return early
        if ratio > 0.95:
            return True, ratio
            
        return False, ratio

    def compare_code_correctness(self, js_code, correct_solution):
        """Optimized code comparison with early exit strategies."""
        if not js_code.strip():
            return 0.0, ["No code submitted to evaluate"]
        
        if not correct_solution.strip() or correct_solution.strip().startswith("//"):
            return 0.31, ["No reference solution available for comparison."]
        
        # OPTIMIZATION 1: Check for exact/near-exact match first
        is_exact_match, quick_ratio = self.quick_exact_match_check(js_code, correct_solution)
        if is_exact_match:
            # score = min(1.0, 0.95 + (quick_ratio * 0.04))  # 95-99% for exact matches
            score = min(1.0, quick_ratio)
            return score, ["Your solution matches the expected implementation perfectly!"]
        
        correctness_score = 0.0
        correctness_feedback = []
        
        # OPTIMIZATION 2: Run comparisons in parallel where possible
        results = {}
        
        # If quick ratio is very low, skip expensive semantic comparison
        if quick_ratio < 0.2:
            semantic_similarity = 0.15
        else:
            try:
                # Semantic similarity using CodeBERT
                user_features = self.extract_code_features(js_code)
                solution_features = self.extract_code_features(correct_solution)
                semantic_similarity = 1 - cosine(user_features, solution_features)
            except Exception as e:
                print(f"Error in semantic comparison: {e}", file=sys.stderr)
                semantic_similarity = 0.37
        
        # OPTIMIZATION 3: Reuse normalized code from quick check
        normalized_user = self.normalize_js_code(js_code)
        normalized_solution = self.normalize_js_code(correct_solution)
        
        # Token-based comparison (already computed in quick check)
        token_similarity = quick_ratio
        
        # OPTIMIZATION 4: Compile regex patterns once
        func_pattern = re.compile(r'function\s+(\w+)\s*\(([^)]*)\)')
        method_pattern = re.compile(r'(\w+)\s*\.\s*(\w+)\s*\(')
        
        # Function structure comparison
        try:
            user_functions = func_pattern.findall(js_code)
            solution_functions = func_pattern.findall(correct_solution)
            
            if not solution_functions:
                function_similarity = 1.0 if not user_functions else 0.5
            else:
                function_matches = 0
                partial_matches = 0
                
                # Create a dict for O(1) lookup
                solution_func_dict = {f[0]: f[1] for f in solution_functions}
                
                for u_func in user_functions:
                    if u_func[0] in solution_func_dict:
                        s_params = solution_func_dict[u_func[0]]
                        u_params = [p.strip() for p in u_func[1].split(',') if p.strip()]
                        s_params = [p.strip() for p in s_params.split(',') if p.strip()]
                        
                        if len(u_params) == len(s_params):
                            function_matches += 1
                        else:
                            similarity = min(len(u_params), len(s_params)) / max(1, max(len(u_params), len(s_params)))
                            partial_matches += similarity
                
                function_similarity = (function_matches + (0.5 * partial_matches)) / max(1, len(solution_functions))
        except Exception as e:
            print(f"Error in function comparison: {e}", file=sys.stderr)
            function_similarity = 0.5
        
        # Method call comparison
        try:
            user_method_calls = set(method_pattern.findall(js_code))
            solution_method_calls = set(method_pattern.findall(correct_solution))
            
            if not solution_method_calls:
                method_similarity = 1.0 if not user_method_calls else 0.5
            else:
                method_matches = len(user_method_calls.intersection(solution_method_calls))
                method_similarity = method_matches / len(solution_method_calls)
        except Exception as e:
            print(f"Error in method comparison: {e}", file=sys.stderr)
            method_similarity = 0.5
        
        # Combine scores with adjusted weights
        correctness_score = (
            0.40 * semantic_similarity +    # Increased weight for semantic understanding
            0.30 * token_similarity +        # Decreased weight for token matching
            0.15 * function_similarity +
            0.15 * method_similarity
        )
        
        # Ensure minimum score
        correctness_score = max(0.05, min(0.99, correctness_score))
        
        # Generate feedback
        if correctness_score > 0.90:
            correctness_feedback.append("Your solution is nearly identical to the expected implementation!")
        elif correctness_score > 0.80:
            correctness_feedback.append("Your solution closely matches the expected implementation.")
        elif correctness_score > 0.65:
            correctness_feedback.append("Your solution is quite similar to the expected implementation.")
        elif correctness_score > 0.45:
            correctness_feedback.append("Your solution has the right approach but differs from the expected implementation.")
        else:
            correctness_feedback.append("Your solution differs significantly from the expected implementation.")
        
        # Add specific feedback only if needed
        if function_similarity < 0.7 and len(solution_functions) > 0:
            correctness_feedback.append("Consider reviewing your function structure.")
        
        if method_similarity < 0.7 and len(solution_method_calls) > 0:
            correctness_feedback.append("You might be using different methods than expected.")
        
        return correctness_score, correctness_feedback

    def analyze_code_metrics(self, js_code):
        """Optimized code metrics analysis."""
        metrics = {
            "complexity": 0.0,
            "readability": 0.0,
            "maintainability": 0.0
        }
        
        try:
            # Pre-compile regex patterns
            patterns = {
                'function': re.compile(r'function\s+\w+\s*\('),
                'loop': re.compile(r'\b(for|while)\s*\('),
                'conditional': re.compile(r'\bif\s*\('),
                'variable': re.compile(r'\b(const|let|var)\s+[a-zA-Z_]\w*\s*='),
                'try': re.compile(r'\btry\s*{'),
                'catch': re.compile(r'\bcatch\s*\(')
            }
            
            lines = js_code.strip().split('\n')
            non_empty_lines = [line for line in lines if line.strip() and not line.strip().startswith('//')]
            
            if not non_empty_lines:
                return metrics
            
            # Count occurrences using compiled patterns
            counts = {name: len(pattern.findall(js_code)) for name, pattern in patterns.items()}
            
            # Calculate complexity score
            complexity_factor = (counts['function'] + counts['loop'] + counts['conditional']) / len(non_empty_lines)
            metrics["complexity"] = max(0.1, 1.0 - min(complexity_factor * 2, 0.9))
            
            # Readability score
            comment_lines = sum(1 for line in lines if line.strip().startswith('//'))
            comment_ratio = comment_lines / len(non_empty_lines)
            metrics["readability"] = min(0.95, 0.5 + (comment_ratio * 2))
            
            # Maintainability score
            error_handling = counts['try'] > 0 and counts['catch'] > 0
            modular_functions = counts['function'] > 0
            
            metrics["maintainability"] = min(0.95, 0.3 + 
                                          (0.25 if error_handling else 0) + 
                                          (0.2 if modular_functions else 0) + 
                                          (min(0.25, counts['variable'] * 0.05)))
            
            return metrics
        except Exception as e:
            print(f"Error analyzing code metrics: {e}", file=sys.stderr)
            return metrics

    def check_best_practices(self, js_code):
        """Comprehensive best practices check with detailed feedback."""
        issues = []
        
        # Security issues (highest priority)
        security_patterns = [
            (r'\beval\s*\(', "Security Risk: Using eval() is dangerous and can lead to code injection attacks. Use JSON.parse() for JSON data or Function constructor for dynamic code."),
            (r'\.innerHTML\s*=', "Security Risk: Setting innerHTML can lead to XSS vulnerabilities. Use textContent for text or createElement() for HTML elements."),
            (r'document\.write\s*\(', "Bad Practice: document.write() can overwrite entire page content. Use DOM manipulation methods like appendChild() instead."),
            (r'__proto__', "Security Risk: Modifying __proto__ can lead to prototype pollution. Use Object.create() or Object.setPrototypeOf() instead.")
        ]
        
        for pattern, message in security_patterns:
            if re.search(pattern, js_code):
                issues.append(message)
        
        # Code quality issues - FIXED REGEX PATTERNS
        quality_patterns = [
            (r'\bvar\s+', "Code Quality: Using 'var' can cause scope issues. Use 'let' for variables that change or 'const' for constants."),
            (r'(?<![=!])={2}(?!=)', "Code Quality: Using == can cause type coercion issues. Use === for strict equality checks."),
            (r'(?<![=!])!={1}(?!=)', "Code Quality: Using != can cause type coercion issues. Use !== for strict inequality checks."),
            (r'new Array\(\)', "Code Quality: Use array literal [] instead of new Array() for better readability."),
            (r'new Object\(\)', "Code Quality: Use object literal {} instead of new Object() for better readability.")
        ]
        
        for pattern, message in quality_patterns:
            matches = re.findall(pattern, js_code)
            if matches and len(matches) > 0:
                if len(matches) > 1:
                    issues.append(f"{message} (Found {len(matches)} occurrences)")
                else:
                    issues.append(message)
        
        # Error handling check
        code_length = len(js_code)
        has_async = re.search(r'\basync\s+function|\basync\s*\(|\.then\s*\(|await\s+', js_code)
        has_try = re.search(r'\btry\s*{', js_code)
        has_catch = re.search(r'\bcatch\s*\(', js_code)
        
        if code_length > 200 and not has_try:
            if has_async:
                issues.append("Error Handling: Async code should include try/catch blocks to handle potential Promise rejections.")
            else:
                issues.append("Error Handling: Consider adding try/catch blocks for better error handling, especially around external API calls or user input processing.")
        
        # Memory leak detection
        add_listener_count = len(re.findall(r'addEventListener\s*\(', js_code))
        remove_listener_count = len(re.findall(r'removeEventListener\s*\(', js_code))
        
        if add_listener_count > remove_listener_count + 1:
            issues.append(f"Memory Leak Risk: Found {add_listener_count} addEventListener calls but only {remove_listener_count} removeEventListener calls. Remove event listeners when they're no longer needed.")
        
        # Performance issues
        performance_patterns = [
            (r'\.forEach\s*\([^)]*\)\s*\.forEach', "Performance: Nested forEach loops can be inefficient. Consider using a single loop or map/reduce."),
            (r'document\.querySelector[All]*\s*\([^)]+\)[^;]*inside\s*(for|while)', "Performance: Avoid DOM queries inside loops. Store the element reference outside the loop."),
            (r'\\s*\+\s*=.*\\s*\+\s*=.*\\s*\+\s*=', "Performance: Multiple string concatenations in a loop are inefficient. Use array.join() or template literals.")
        ]
        
        for pattern, message in performance_patterns:
            if re.search(pattern, js_code, re.IGNORECASE):
                issues.append(message)
        
        # Code style issues - FIXED FUNCTION NAME CHECK
        if not re.search(r'(const|let|var)\s+[a-z][a-zA-Z0-9]*', js_code) and code_length > 100:
            issues.append("Naming Convention: Use camelCase for variable names (e.g., 'userName' instead of 'user_name').")
        
        # Check for function names that DON'T follow camelCase (start with uppercase)
        uppercase_functions = re.findall(r'function\s+[A-Z]\w*\s*\(', js_code)
        if uppercase_functions:
            issues.append(f"Naming Convention: Function names should start with lowercase letters in camelCase (e.g., 'calculateTotal' not 'CalculateTotal'). Found {len(uppercase_functions)} function(s) starting with uppercase.")
        
        # Missing semicolons (if using them inconsistently)
        lines_with_semicolon = len(re.findall(r';\s*$', js_code, re.MULTILINE))
        total_statements = len(re.findall(r'(let|const|var|return|break|continue|throw)\s+[^;]+$', js_code, re.MULTILINE))
        
        if total_statements > 5 and lines_with_semicolon > 0 and lines_with_semicolon < total_statements * 0.8:
            issues.append("Code Style: Inconsistent use of semicolons. Either use them consistently or omit them entirely.")
        
        # Check for console.log in production code
        console_count = len(re.findall(r'console\.(log|error|warn|info)', js_code))
        if console_count > 3:
            issues.append(f"Production Ready: Found {console_count} console statements. Remove or replace with proper logging for production code.")
        
        # Sort issues by priority (security > errors > performance > style)
        return issues  # Return all issues, not limited

    def evaluate_javascript(self, js_code, challenge_title="", challenge_description="", correct_solution=""):
        """Optimized evaluation with early exits."""
        start_time = time.time()
        
        results = {
            "score": 0.0,
            "syntax_valid": False,
            "metrics": {},
            "issues": [],
            "correctness_score": 0.0,
            "correctness_feedback": [],
            "feedback": ""
        }
        
        # 1. Check syntax first (fast fail)
        syntax_valid, syntax_error = self.check_syntax(js_code)
        results["syntax_valid"] = syntax_valid
        
        if not syntax_valid:
            results["score"] = 0.00
            results["feedback"] = f"Syntax Error: {syntax_error}"
            return results
        
        # 2. Run correctness check first if solution exists
        has_solution = correct_solution and correct_solution.strip() and not correct_solution.strip().startswith("//")
        
        if has_solution:
            correctness_score, correctness_feedback = self.compare_code_correctness(js_code, correct_solution)
            results["correctness_score"] = correctness_score
            results["correctness_feedback"] = correctness_feedback
            
            # Early exit for perfect matches
            if correctness_score > 0.95:
                results["score"] = correctness_score
                results["metrics"] = {"complexity": 0.9, "readability": 0.9, "maintainability": 0.9}
                results["issues"] = []
                results["feedback"] = "\n".join(correctness_feedback)
                print(f"Evaluation completed in {time.time() - start_time:.2f}s", file=sys.stderr)
                return results
        else:
            correctness_score = 0.33
            correctness_feedback = ["No reference solution available for comparison."]
            results["correctness_score"] = correctness_score
            results["correctness_feedback"] = correctness_feedback
        
        # 3. Analyze code quality (only if not perfect match)
        metrics = self.analyze_code_metrics(js_code)
        results["metrics"] = metrics
        
        issues = self.check_best_practices(js_code)
        results["issues"] = issues
        
        # 4. Calculate final score
        code_quality_score = (metrics["readability"] + metrics["maintainability"] + metrics["complexity"]) / 3
        issue_penalty = min(0.3, len(issues) * 0.05)
        
        if has_solution:
            final_score = (0.80 * correctness_score + 0.20 * max(0, code_quality_score - issue_penalty))
        else:
            final_score = max(0, code_quality_score - issue_penalty)
        
        results["score"] = max(0.05, min(0.99, final_score))
        
        # 5. Generate feedback
        feedback = []
        
        # Overall score feedback
        if final_score > 0.85:
            feedback.append("✅ Excellent code quality!")
        elif final_score > 0.70:
            feedback.append("👍 Good code quality with minor improvements possible.")
        elif final_score > 0.50:
            feedback.append("📝 Decent code quality with room for improvement.")
        else:
            feedback.append("⚠️ Code quality needs improvement.")
        
        # Add correctness feedback
        if correctness_feedback:
            feedback.append("\n**Correctness Analysis:**")
            feedback.extend(correctness_feedback)
        
        # Add specific metric feedback if there are issues
        if metrics["readability"] < 0.6 or metrics["maintainability"] < 0.6 or metrics["complexity"] < 0.6:
            feedback.append("\n**Code Metrics:**")
            
            if metrics["readability"] < 0.6:
                feedback.append(f"- Readability Score: {metrics['readability']:.1%} - Add more comments and improve code structure")
            
            if metrics["maintainability"] < 0.6:
                feedback.append(f"- Maintainability Score: {metrics['maintainability']:.1%} - Add error handling and modularize your code")
            
            if metrics["complexity"] < 0.6:
                feedback.append(f"- Complexity Score: {metrics['complexity']:.1%} - Consider breaking down complex functions")
        
        # Add all code quality issues with proper formatting
        if issues:
            feedback.append(f"\n**Code Quality Issues Found ({len(issues)}):**")
            
            # Group issues by type
            security_issues = [issue for issue in issues if "Security Risk:" in issue]
            quality_issues = [issue for issue in issues if "Code Quality:" in issue]
            performance_issues = [issue for issue in issues if "Performance:" in issue]
            style_issues = [issue for issue in issues if any(x in issue for x in ["Naming Convention:", "Code Style:", "Production Ready:"])]
            other_issues = [issue for issue in issues if issue not in security_issues + quality_issues + performance_issues + style_issues]
            
            # Add issues by priority
            if security_issues:
                feedback.append("\n🔒 **Security Issues (High Priority):**")
                for issue in security_issues:
                    feedback.append(f"   • {issue}")
            
            if quality_issues:
                feedback.append("\n🔧 **Code Quality Issues:**")
                for issue in quality_issues:
                    feedback.append(f"   • {issue}")
            
            if performance_issues:
                feedback.append("\n⚡ **Performance Issues:**")
                for issue in performance_issues:
                    feedback.append(f"   • {issue}")
            
            if other_issues:
                feedback.append("\n📋 **Other Issues:**")
                for issue in other_issues:
                    feedback.append(f"   • {issue}")
            
            if style_issues:
                feedback.append("\n✨ **Style & Convention Issues:**")
                for issue in style_issues:
                    feedback.append(f"   • {issue}")
        
        # Add suggestions for improvement
        if final_score < 0.85 and (issues or metrics["readability"] < 0.7):
            feedback.append("\n**Suggestions for Improvement:**")
            
            suggestions = []
            if any("Security Risk:" in issue for issue in issues):
                suggestions.append("1. Address security vulnerabilities immediately")
            
            if metrics["readability"] < 0.7:
                suggestions.append(f"{len(suggestions)+1}. Add meaningful comments to explain complex logic")
            
            if not has_solution or correctness_score < 0.7:
                suggestions.append(f"{len(suggestions)+1}. Review the problem requirements and ensure your solution addresses all aspects")
            
            if any("var " in issue for issue in issues):
                suggestions.append(f"{len(suggestions)+1}. Modernize your code by using 'const' and 'let' instead of 'var'")
            
            feedback.extend(suggestions)
        
        results["feedback"] = "\n".join(feedback)
        
        print(f"Evaluation completed in {time.time() - start_time:.2f}s", file=sys.stderr)
        return results

def evaluate_code(js_code, challenge_title="", challenge_description="", correct_solution=""):
    """Evaluate JavaScript code and return results."""
    try:
        evaluator = JavaScriptEvaluator()
        results = evaluator.evaluate_javascript(js_code, challenge_title, challenge_description, correct_solution)
        
        # Convert to percentages
        results["score"] = float(results["score"] * 100)
        results["correctness_score"] = float(results.get("correctness_score", 0) * 100)
        
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
      
        input_data = json.loads(sys.argv[1])
        js_code = input_data.get("jsCode", "")
        challenge_title = input_data.get("challengeTitle", "")
        challenge_description = input_data.get("challengeDescription", "")
        correct_solution = input_data.get("correctSolution", "")
        
        # Evaluate the JavaScript code
        evaluation_results = evaluate_code(js_code, challenge_title, challenge_description, correct_solution)
        
        print(json.dumps(evaluation_results))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input", "score": 0, "correctness_score": 0}))
    except ValueError as e:
        print(json.dumps({"error": str(e), "score": 0, "correctness_score": 0}))
    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {str(e)}", "score": 0, "correctness_score": 0}))