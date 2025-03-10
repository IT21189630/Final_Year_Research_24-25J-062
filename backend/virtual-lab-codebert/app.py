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






# from flask import Flask, request, jsonify
# from transformers import AutoTokenizer, RobertaForSequenceClassification
# import torch
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend-backend communication

# # Define paths and model details
# model_name = "microsoft/codebert-base"  # Base model for architecture
# model_path = "model/codebert_model.pth"  # Path to your saved .pth file

# # Load tokenizer
# tokenizer = AutoTokenizer.from_pretrained(model_name)

# # Define the model architecture and load weights
# model = RobertaForSequenceClassification.from_pretrained(model_name, num_labels=5)  # Ensure num_labels matches training
# model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))  # Load model weights
# model.eval()  # Set the model to evaluation mode

# @app.route("/analyze", methods=["POST"])
# def analyze_code():
#     try:
#         # Get the code snippet from the request
#         data = request.json
#         code_snippet = data.get("code", "")

#         if not code_snippet.strip():
#             return jsonify({"error": "Code snippet cannot be empty"}), 400

#         # Tokenize the input
#         inputs = tokenizer(code_snippet, return_tensors="pt", truncation=True, padding=True, max_length=128)

#         # Perform inference
#         with torch.no_grad():
#             outputs = model(**inputs)
#             probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
#             predicted_label = torch.argmax(probabilities, dim=-1).item()

#         # Define error types (same as used in training)
#         error_types = ["Syntax Error", "Runtime Error", "Logical Error", "Typographical Error", "Structural Error"]

#         # Prepare the response
#         response = {
#             "predicted_label": error_types[predicted_label],
#             "probabilities": probabilities.tolist(),
#         }
#         return jsonify(response)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)



from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig
from safetensors import safe_open
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load from local directory
model_path = "model/codebert-error-classifier"  # Path to your model directory

# Load tokenizer and config
tokenizer = AutoTokenizer.from_pretrained(model_path)
config = AutoConfig.from_pretrained(model_path)

# Load model weights
model = AutoModelForSequenceClassification.from_pretrained(
    "microsoft/codebert-base",  # Base architecture
    config=config,
    ignore_mismatched_sizes=True
)

# Load custom weights
with safe_open(f"{model_path}/model.safetensors", framework="pt") as f:
    for key in f.keys():
        model.state_dict()[key].copy_(f.get_tensor(key))

model.eval()

# Define error types (MUST match training order)
error_types = ["Syntax Error", "Runtime Error", "Logical Error", 
              "Typographical Error", "Structural Error"]

@app.route("/analyze", methods=["POST"])
def analyze_code():
    try:
        data = request.json
        code = data.get("code", "").strip()
        
        if not code:
            return jsonify({"error": "Empty code snippet"}), 400

        # Tokenize with original settings
        inputs = tokenizer(
            code,
            padding="max_length",
            truncation=True,
            max_length=256,
            return_tensors="pt"
        )

        # Inference
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.sigmoid(outputs.logits)

        # Process results
        probabilities = probs[0].tolist()
        prediction = error_types[probs.argmax().item()]

        return jsonify({
            "prediction": prediction,
            "confidence": round(probabilities[probs.argmax()], 4),
            "probabilities": dict(zip(error_types, probabilities))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)