# utils/js_code_evaluator.py
import sys
import json
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
import re
import esprima
from scipy.spatial.distance import cosine
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import string

# Download NLTK resources on first run
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

class JavaScriptEvaluator:
    """Evaluates JavaScript code quality using CodeBERT and checks challenge relevance."""
    
    def __init__(self, model_name="microsoft/codebert-base"):
        """Initialize with the specified model."""
        try:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name).to(self.device)
            self.model.eval()
            print(f"Model loaded on {self.device}", file=sys.stderr)
            self.stop_words = set(stopwords.words('english'))
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

    def extract_text_features(self, text):
        """Extract features from text using CodeBERT."""
        try:
            # Tokenize text
            inputs = self.tokenizer(text, return_tensors="pt", max_length=512, 
                                   padding="max_length", truncation=True).to(self.device)
            
            # Get model outputs
            with torch.no_grad():
                outputs = self.model(**inputs)
                
            # Use CLS token embedding as text representation
            text_features = outputs.last_hidden_state[:, 0, :].cpu().numpy().flatten()
            return text_features
        except Exception as e:
            print(f"Error extracting text features: {e}", file=sys.stderr)
            raise

    def extract_keywords(self, text):
        """Extract keywords from text after removing stopwords."""
        # Simple tokenization by splitting on whitespace and punctuation
        text = text.lower()
        # Replace punctuation with spaces
        for char in string.punctuation:
            text = text.replace(char, ' ')
        # Split on whitespace
        tokens = text.split()
        
        # Remove stopwords and very short words
        tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
        
        return tokens

    def check_code_relevance(self, js_code, challenge_title, challenge_description):
        """Check if JavaScript code is relevant to the challenge."""
        if not js_code.strip() or not challenge_description.strip():
            return 0.0, []
        
        relevance_score = 0.0
        relevance_feedback = []
        
        try:
            # Method 1: Semantic similarity using CodeBERT
            code_features = self.extract_code_features(js_code)
            desc_features = self.extract_text_features(challenge_title + " " + challenge_description)
            
            # Calculate cosine similarity
            semantic_similarity = 1 - cosine(code_features, desc_features)
            
            # Method 2: Keyword matching
            challenge_keywords = self.extract_keywords(challenge_title + " " + challenge_description)
            js_code_lower = js_code.lower()
            
            # Count how many keywords are found in the code
            matched_keywords = []
            for keyword in challenge_keywords:
                if keyword in js_code_lower:
                    matched_keywords.append(keyword)
            
            keyword_match_ratio = len(matched_keywords) / max(1, len(challenge_keywords))
            
            # Method 3: Code analysis for specific features mentioned in description
            # Parse code to find functions, variables, etc.
            try:
                parsed_code = esprima.parseScript(js_code)
                
                # Extract variable and function names
                code_identifiers = []
                
                # Simple extraction of identifiers (this could be improved with a proper AST walker)
                function_matches = re.findall(r'function\s+(\w+)', js_code)
                var_matches = re.findall(r'(const|let|var)\s+(\w+)', js_code)
                code_identifiers.extend(function_matches)
                code_identifiers.extend([m[1] for m in var_matches])
                
                # Check if code identifiers match challenge keywords
                identifier_matches = [ident for ident in code_identifiers 
                                     if any(keyword in ident.lower() for keyword in challenge_keywords)]
                
                identifier_match_score = len(identifier_matches) / max(1, len(code_identifiers))
            except:
                # If parsing fails, just set these scores to 0
                identifier_match_score = 0
            
            # Combine scores with weights
            relevance_score = (0.4 * semantic_similarity + 
                              0.4 * keyword_match_ratio + 
                              0.2 * identifier_match_score)
            
            # Generate feedback
            if relevance_score > 0.7:
                relevance_feedback.append("Code appears to be highly relevant to the challenge requirements")
            elif relevance_score > 0.4:
                relevance_feedback.append("Code appears to be somewhat relevant to the challenge requirements")
            else:
                relevance_feedback.append("Code doesn't seem to address the specific challenge requirements")
            
            # Add specific feedback
            if matched_keywords:
                relevance_feedback.append(f"Matched challenge keywords: {', '.join(matched_keywords[:5])}")
            else:
                relevance_feedback.append("No specific challenge keywords found in your code")
            
            # Feature-specific feedback based on challenge description
            challenge_text = (challenge_title + " " + challenge_description).lower()
            
            # Check for event handling if mentioned in challenge
            if "event" in challenge_text or "click" in challenge_text or "interact" in challenge_text:
                if "addEventListener" in js_code or "onclick" in js_code:
                    relevance_feedback.append("✓ Includes event handling as required")
                else:
                    relevance_feedback.append("✗ Missing event handling which appears to be required")
            
            # Check for DOM manipulation if mentioned
            if "dom" in challenge_text or "element" in challenge_text or "html" in challenge_text:
                if "document.getElement" in js_code or "document.query" in js_code:
                    relevance_feedback.append("✓ Includes DOM manipulation as required")
                else:
                    relevance_feedback.append("✗ Missing DOM manipulation which appears to be required")
            
            # Check for animation if mentioned
            if "animation" in challenge_text or "animate" in challenge_text or "transition" in challenge_text:
                if "requestAnimationFrame" in js_code or "transition" in js_code or "animation" in js_code:
                    relevance_feedback.append("✓ Includes animation features as required")
                else:
                    relevance_feedback.append("✗ Missing animation features which appear to be required")
                    
            return relevance_score, relevance_feedback
        
        except Exception as e:
            print(f"Error checking code relevance: {e}", file=sys.stderr)
            return 0.0, ["Error evaluating code relevance"]

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
            
            # Basic complexity: function/loop/conditional density
            function_count = len(re.findall(r'function\s+\w+\s*\(', js_code))
            loop_count = len(re.findall(r'(for|while)\s*\(', js_code))
            conditional_count = len(re.findall(r'if\s*\(', js_code))
            
            # Calculate complexity score (higher is more complex)
            complexity_score = (function_count + loop_count + conditional_count) / max(1, len(non_empty_lines))
            metrics["complexity"] = 1.0 - min(complexity_score * 2, 0.9)  # Lower complexity is better
            
            # Check for comments
            comment_lines = len([line for line in lines if line.strip().startswith('//')])
            comment_ratio = comment_lines / max(1, len(non_empty_lines))
            
            # Check indentation consistency
            indentation_patterns = [len(line) - len(line.lstrip()) for line in lines if line.strip()]
            indentation_consistency = np.std(indentation_patterns) if indentation_patterns else 0
            
            # Readability score
            metrics["readability"] = min(1.0, 0.5 + comment_ratio - (indentation_consistency / 20))
            
            # Check for maintainability indicators
            error_handling = 'try' in js_code and 'catch' in js_code
            modular_functions = function_count > 0
            variable_naming = len(re.findall(r'const|let|var\s+[a-zA-Z_]\w*\s*=', js_code))
            
            # Maintainability score
            metrics["maintainability"] = min(1.0, 0.3 + 
                                          (0.2 if error_handling else 0) + 
                                          (0.2 if modular_functions else 0) + 
                                          (min(0.3, variable_naming * 0.05)))
            
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

    def evaluate_javascript(self, js_code, challenge_title="", challenge_description=""):
        """Evaluate JavaScript code and return a quality score and feedback."""
        results = {
            "score": 0.0,
            "syntax_valid": False,
            "metrics": {},
            "issues": [],
            "relevance_score": 0.0,
            "relevance_feedback": [],
            "feedback": ""
        }
        
        # 1. Check syntax
        syntax_valid, syntax_error = self.check_syntax(js_code)
        results["syntax_valid"] = syntax_valid
        
        if not syntax_valid:
            results["score"] = 0.2  # Very low score for syntax errors
            results["feedback"] = f"Syntax Error: {syntax_error}"
            return results
        
        # 2. Get code metrics
        metrics = self.analyze_code_metrics(js_code)
        results["metrics"] = metrics
        
        # 3. Check for best practices
        issues = self.check_best_practices(js_code)
        results["issues"] = issues
        
        # 4. Check code relevance to challenge
        relevance_score, relevance_feedback = self.check_code_relevance(
            js_code, challenge_title, challenge_description)
        results["relevance_score"] = relevance_score
        results["relevance_feedback"] = relevance_feedback
        
        # 5. Calculate overall score
        # Base code quality score
        code_quality_score = (metrics["readability"] + metrics["maintainability"] + metrics["complexity"]) / 3
        
        # Deduct for issues
        issue_penalty = min(0.5, len(issues) * 0.1)
        
        # Combine quality and relevance with weights
        # If we have challenge info, weight relevance more heavily
        if challenge_title or challenge_description:
            # 60% relevance, 40% code quality
            final_score = (0.6 * relevance_score + 
                          0.4 * max(0, code_quality_score - issue_penalty))
        else:
            # No challenge info, just use code quality
            final_score = max(0, code_quality_score - issue_penalty)
        
        # Ensure score is between 0 and 1
        results["score"] = max(0, min(1, final_score))
        
        # 6. Generate feedback
        feedback = []
        
        # Code quality feedback
        if final_score > 0.8:
            feedback.append("Excellent code quality")
        elif final_score > 0.6:
            feedback.append("Good code quality with some room for improvement")
        elif final_score > 0.4:
            feedback.append("Average code quality with several areas for improvement")
        else:
            feedback.append("Code quality needs significant improvement")
        
        # Add relevance feedback
        if challenge_title or challenge_description:
            feedback.extend(relevance_feedback)
        
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
        
        return results

def evaluate_code(js_code, challenge_title="", challenge_description=""):
    """Evaluate JavaScript code and return results."""
    try:
        evaluator = JavaScriptEvaluator()
        results = evaluator.evaluate_javascript(js_code, challenge_title, challenge_description)
        
        # Convert score to percentage for consistency with the image similarity
        results["score"] = float(results["score"] * 100)
        results["relevance_score"] = float(results["relevance_score"] * 100) if "relevance_score" in results else 0
        
        return results
    except Exception as e:
        print(f"Error evaluating code: {e}", file=sys.stderr)
        return {
            "error": str(e),
            "score": 0,
            "feedback": "Error occurred during evaluation"
        }

if __name__ == "__main__":
    try:
        # Check if command line arguments are provided
        if len(sys.argv) < 2:
            raise ValueError("Please provide the input JSON as a command line argument")
        
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        js_code = input_data.get("jsCode", "")
        challenge_title = input_data.get("challengeTitle", "")
        challenge_description = input_data.get("challengeDescription", "")
        
        # Evaluate the JavaScript code
        evaluation_results = evaluate_code(js_code, challenge_title, challenge_description)
        
        # Return results as JSON
        print(json.dumps(evaluation_results))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input", "score": 0}))
    except ValueError as e:
        print(json.dumps({"error": str(e), "score": 0}))
    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {str(e)}", "score": 0}))