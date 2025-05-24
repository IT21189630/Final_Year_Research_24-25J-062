from flask import Flask, request, jsonify
from routes.predict import predict_next_error
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "LSTM Prediction API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    error_sequence = data.get("errors", [])

    if not error_sequence:
        return jsonify({"error": "No input sequence provided"}), 400

    predictions = predict_next_error(error_sequence)
    return jsonify({"predictions": predictions})

if __name__ == "__main__":
    app.run(debug=True, port=5010)
