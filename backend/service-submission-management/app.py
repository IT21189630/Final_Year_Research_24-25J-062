from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2

app = Flask(__name__)

# Load ResNet model
model = tf.keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")

def preprocess_image(image_path):
    image = cv2.imread(image_path)
    image = cv2.resize(image, (224, 224))
    image = tf.keras.applications.resnet50.preprocess_input(image)
    return np.expand_dims(image, axis=0)

def calculate_similarity(img1_path, img2_path):
    img1_features = model.predict(preprocess_image(img1_path))
    img2_features = model.predict(preprocess_image(img2_path))

    # Cosine similarity
    similarity = np.dot(img1_features, img2_features.T) / (
        np.linalg.norm(img1_features) * np.linalg.norm(img2_features)
    )
    return float(similarity)

@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.json
    user_image = data["user_image"]
    reference_image = data["reference_image"]

    similarity = calculate_similarity(user_image, reference_image)
    return jsonify({"similarity": similarity})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
