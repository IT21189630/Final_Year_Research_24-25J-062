# import sys
# import json
# import torch
# import torchvision.models as models
# from torchvision.models import resnet50, ResNet50_Weights

# import torchvision.transforms as transforms
# from PIL import Image
# from scipy.spatial.distance import cosine

# # Load ResNet model
# #model = models.resnet50(pretrained=True)
# model = resnet50(weights=ResNet50_Weights.DEFAULT)
# model.eval()

# # Image preprocessing
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
# ])

# def extract_features(image_path):
#     image = Image.open(image_path).convert("RGB")
#     tensor = transform(image).unsqueeze(0)
#     with torch.no_grad():
#         features = model(tensor)
#     return features.numpy().flatten()

# def compute_similarity(image1, image2):
#     features1 = extract_features(image1)
#     features2 = extract_features(image2)
#     similarity = 1 - cosine(features1, features2)
#     return similarity

# if __name__ == "__main__":
#     # Read paths from command line arguments
#     input_data = json.loads(sys.argv[1])
#     image1_path = input_data["userImage"]
#     image2_path = input_data["referenceImage"]
    
#     similarity_score = compute_similarity(image1_path, image2_path)
#     print(json.dumps({"similarity": similarity_score}))

import sys
import json
import torch
import torchvision.models as models
from torchvision.models import resnet50, ResNet50_Weights
import torchvision.transforms as transforms
from PIL import Image
from scipy.spatial.distance import cosine

# Load ResNet model
model = resnet50(weights=ResNet50_Weights.DEFAULT)
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def extract_features(image_path):
    """Extract features from an image using ResNet-50."""
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        features = model(tensor)
    return features.numpy().flatten()

def compute_similarity(image1, image2):
    """Compute similarity between two images."""
    features1 = extract_features(image1)
    features2 = extract_features(image2)
    similarity = 1 - cosine(features1, features2)
    return similarity

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
        print("Error: Invalid JSON input. Ensure you pass valid JSON.")
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

