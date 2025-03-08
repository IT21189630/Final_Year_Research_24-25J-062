# from flask import Flask, request, jsonify
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# import torch
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend-backend communication

# # Load CodeBERT model
# model_name = "microsoft/codebert-base"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForSequenceClassification.from_pretrained(model_name)

# @app.route("/analyze", methods=["POST"])
# def analyze_code():
#     data = request.json
#     code_snippet = data.get("code", "")

#     inputs = tokenizer(code_snippet, return_tensors="pt", truncation=True)
#     outputs = model(**inputs)
#     probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
#     error_score = probabilities[0][1].item()

#     response = {
#         "error_score": error_score,
#         "message": "High error probability" if error_score > 0.5 else "Code looks fine",
#     }
#     return jsonify(response)

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)


from flask import Flask, request, jsonify
from transformers import AutoTokenizer, RobertaForSequenceClassification
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Define paths and model details
model_name = "microsoft/codebert-base"  # Base model for architecture
model_path = "model/codebert_model.pth"  # Path to your saved .pth file

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Define the model architecture and load weights
model = RobertaForSequenceClassification.from_pretrained(model_name, num_labels=5)  # Ensure num_labels matches training
model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))  # Load model weights
model.eval()  # Set the model to evaluation mode

@app.route("/analyze", methods=["POST"])
def analyze_code():
    try:
        # Get the code snippet from the request
        data = request.json
        code_snippet = data.get("code", "")

        if not code_snippet.strip():
            return jsonify({"error": "Code snippet cannot be empty"}), 400

        # Tokenize the input
        inputs = tokenizer(code_snippet, return_tensors="pt", truncation=True, padding=True, max_length=128)

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_label = torch.argmax(probabilities, dim=-1).item()

        # Define error types (same as used in training)
        error_types = ["Syntax Error", "Runtime Error", "Logical Error", "Typographical Error", "Structural Error"]

        # Prepare the response
        response = {
            "predicted_label": error_types[predicted_label],
            "probabilities": probabilities.tolist(),
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
