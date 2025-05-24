from flask import Flask, request, jsonify #Used to create the REST API
import tensorflow as tf # Provides the pretrained ResNet50 model and preprocessing tools.
import numpy as np #Used for numerical operations
import cv2 #Handles image loading and resizing.

app = Flask(__name__) #Initializing Flask App

# Load ResNet model
model = tf.keras.applications.ResNet50(weights="imagenet", include_top=False, pooling="avg")

def preprocess_image(image_path):
    image = cv2.imread(image_path) #Load the image using OpenCV
    image = cv2.resize(image, (224, 224)) #Resize it to match the ResNet50 input dimensions (224x224 pixels).
    image = tf.keras.applications.resnet50.preprocess_input(image)
    return np.expand_dims(image, axis=0)

#Both images are preprocessed and passed through the ResNet model to extract feature vectors.
def calculate_similarity(img1_path, img2_path):
    img1_features = model.predict(preprocess_image(img1_path))
    img2_features = model.predict(preprocess_image(img2_path))

    # Cosine similarity
    similarity = np.dot(img1_features, img2_features.T) / (
        np.linalg.norm(img1_features) * np.linalg.norm(img2_features)
    )
    return float(similarity)

#Flask API Endpoint
@app.route("/evaluate", methods=["POST"])#accepts POST requests
def evaluate():
    data = request.json
    user_image = data["user_image"]
    reference_image = data["reference_image"]

    similarity = calculate_similarity(user_image, reference_image)
    similarity_rounded = round(similarity, 4)
    return jsonify({"similarity": similarity_rounded})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001) #Starts the Flask server
