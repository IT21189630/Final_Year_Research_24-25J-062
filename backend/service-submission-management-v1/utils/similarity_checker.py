# utils/similarity_checker.py
import sys
import json
import torch
import torchvision.models as models
from torchvision.models import resnet50, ResNet50_Weights
import torchvision.transforms as transforms
from PIL import Image
from scipy.spatial.distance import cosine

def extract_features(image_path):
    """Extract features from an image using ResNet-50."""
    # Load ResNet model
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    model.eval()

    # Image preprocessing
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    try:
        image = Image.open(image_path).convert("RGB")
        tensor = transform(image).unsqueeze(0)
        with torch.no_grad():
            features = model(tensor)
        return features.numpy().flatten()
    except Exception as e:
        print(f"Error extracting features from {image_path}: {e}", file=sys.stderr)
        raise

def compute_similarity(image1, image2):
    """Compute similarity between two images."""
    try:
        features1 = extract_features(image1)
        features2 = extract_features(image2)
        similarity = 1 - cosine(features1, features2)
        return max(0, min(similarity, 1))  # Ensure score is between 0 and 1
    except Exception as e:
        print(f"Error computing similarity: {e}", file=sys.stderr)
        return 0

if __name__ == "__main__":
    try:
        # Ensure command-line arguments are provided
        if len(sys.argv) < 2:
            raise ValueError("Please provide the input JSON as a command-line argument.")
        
        # Parse input JSON
        input_data = json.loads(sys.argv[1])
        image1_path = input_data.get("userImage")
        image2_path = input_data.get("referenceImage")
        
        # Ensure both paths are provided
        if not image1_path or not image2_path:
            raise ValueError("Both 'userImage' and 'referenceImage' paths must be provided in the input JSON.")
        
        # Compute similarity
        similarity_score = compute_similarity(image1_path, image2_path)
        print(json.dumps({"similarity": similarity_score}))
    
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input", "similarity": 0}))
    except FileNotFoundError as e:
        print(json.dumps({"error": f"File not found - {str(e)}", "similarity": 0}))
    except ValueError as e:
        print(json.dumps({"error": str(e), "similarity": 0}))
    except Exception as e:
        print(json.dumps({"error": f"An unexpected error occurred: {str(e)}", "similarity": 0}))