from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import onnxruntime as ort
from PIL import Image
import io
import json
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure CORS with specific settings
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load class mapping from JSON file
with open('class_mapping.json', 'r') as f:
    class_mapping = json.load(f)
    # Convert numeric keys to list of class names
    class_names = [class_mapping[str(i)] for i in range(len(class_mapping))]

# Load ONNX model once
session = ort.InferenceSession("models/mobilenetv2_food.onnx")
input_name = session.get_inputs()[0].name

# Configure Gemini
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.0-pro')

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.resize((224, 224))  # Adjust to your model's expected input
    img_array = np.array(img).astype(np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))  # HWC to CHW
    return np.expand_dims(img_array, axis=0)  # Add batch dimension

def get_gemini_response(food_class):
    prompt = f"Tell me about the nutritional information and health benefits of {food_class}. Keep it concise and focus on key nutrients and health benefits."
    try:
        response = model.generate_content(prompt)
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
                
            img_bytes = file.read()
            
            # Preprocess and predict
            input_data = preprocess_image(img_bytes)
            outputs = session.run(None, {input_name: input_data})
            pred_idx = np.argmax(outputs[0])
            food_class = class_names[pred_idx]
            confidence = float(outputs[0][0][pred_idx])
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