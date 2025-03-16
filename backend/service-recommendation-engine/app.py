from flask import Flask, jsonify, request
from flask_cors import CORS
from lesson_recommendations import generateRecommendations
from lesson_recommendations import populateRecommendationDescriptions

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

@app.route('/recommendation_engine/v1/populate', methods=['GET'])
def populate_target_field():
    data = populateRecommendationDescriptions()
    return jsonify(data)

@app.route('/recommendation_engine/v1/recommendations', methods=['POST'])
def create_recommendations():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required_fields = ["performance_score", "lesson_scope", "checkpoint"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    performance_score = data["performance_score"]
    lesson_scope = data["lesson_scope"]
    checkpoint = data["checkpoint"]

    if(performance_score < 65):
        difficulty = "easy / easier"
        score_level = "lower"
    else:
        difficulty = "difficult / challenging"
        score_level = "higher"

    prompt = f"{difficulty} project related to {lesson_scope} and suitable for {score_level} performance score and lessons covered until checkpoint {checkpoint}"
    results = list(generateRecommendations(prompt))
    response = {"message": "Resource created!", "data": results}
    return jsonify(response), 201

if __name__ == '__main__':
    app.run(port=8080, debug=True)