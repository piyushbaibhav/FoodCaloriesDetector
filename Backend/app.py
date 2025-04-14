
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import torch
import torchvision.models as models
import os
from PIL import Image
from torchvision import transforms
import io
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure CORS with specific settings
CORS(app, resources={r"/predict": {"origins": ["http://localhost:3000"], "methods": ["POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Load class mapping from JSON file
with open('class_mapping.json', 'r') as f:
    class_mapping = json.load(f)
    # Convert numeric keys to list of class names
    class_names = [class_mapping[str(i)] for i in range(len(class_mapping))]

# Load PyTorch model once
model = models.mobilenet_v2(pretrained=False)

# Modify the final classifier layer to match the number of output classes in your model
num_classes = 339  # Replace this with the number of classes your model was trained on
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)

# Load the saved weights
state_dict = torch.load('models/mobilenetv2_epoch_100.pth', map_location=torch.device('cpu'))

# Remove 'module.' prefix if present
state_dict = {key.replace('module.', ''): value for key, value in state_dict.items()}

# Load the cleaned state_dict into the model
model.load_state_dict(state_dict)
model.eval()  # Set the model to evaluation mode

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.")
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.0-pro')

def preprocess_image(img_bytes):
    image = Image.open(io.BytesIO(img_bytes))  # Load image from bytes
    # Define the necessary transformations
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # Resize to match MobileNetV2 input size
        transforms.ToTensor(),  # Convert the image to a tensor
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),  # Normalize based on ImageNet stats
    ])
    
    # Apply the transformations
    image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    return image_tensor

def get_gemini_response(food_class):
    prompt = f"Tell me about the nutritional information and health benefits of {food_class}. Keep it concise and focus on key nutrients and health benefits."
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")  # Debug print
        return f"Nutritional information for {food_class}: This food typically contains carbohydrates, proteins, and fats. For detailed nutritional information, please consult a nutritionist."

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        food_class = None
        confidence = 1.0
        gemini_info = "No nutritional information available"
        
        # Check if request contains a file
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            img_bytes = file.read()  # Read the image as bytes
            
            # Preprocess and predict
            input_data = preprocess_image(img_bytes)
            with torch.no_grad():
                outputs = model(input_data)
            
            # Get the predicted class (index of maximum probability)
            _, pred_idx = torch.max(outputs, 1)
            food_class = class_names[pred_idx.item()]
            confidence = torch.softmax(outputs, dim=1)[0][pred_idx].item()
        else:
            # If no file, check for food_class in JSON body
            data = request.get_json()
            if not data or 'food_class' not in data:
                return jsonify({"error": "No food class provided"}), 400
            food_class = data['food_class']
        
        # If include_gemini is true, get Gemini response
        include_gemini = request.args.get('include_gemini', 'false').lower() == 'true'
        if include_gemini and food_class:
            gemini_info = get_gemini_response(food_class)
        
        response = {
            "class": food_class,
            "confidence": confidence,
            "gemini_info": gemini_info
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error in predict: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
