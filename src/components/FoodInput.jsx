import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useDarkMode } from "../context/DarkModeContext";
import Spline from '@splinetool/react-spline';

const GEMINI_API_KEY = "AIzaSyA40OoIi5AEkJhyehzX_1hvXGlSAL-DEJE";

// Food Icon Component
const FoodIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/>
  </svg>
);

// Camera Icon Component
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1h-1V9c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM9 9h6v2H9V9zm9 8H6v-4h12v4z"/>
  </svg>
);

// Upload Icon Component
const UploadIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
  </svg>
);

const FoodInput = () => {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    stopCamera();
  };

  const startCamera = async () => {
    try {
      setCameraOn(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setCameraOn(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 300, 200);
    
    // Convert canvas to blob and create a file
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
      setImage(file);
      console.log("Captured image:", file); // Debug log
    }, "image/jpeg", 0.95);
    stopCamera();
  };

  const getNutritionFromGemini = async (food, qty) => {
    const prompt = `
You are a certified dietitian and nutritionist.

Given the food item and its specific quantity, provide the nutritional breakdown based on standard global nutritional databases (like USDA) and common recipes.

For complex dishes (like curries, mixed dishes, or restaurant-style foods), provide approximate values based on typical/common recipes and ingredients. If exact values aren't available, estimate based on similar dishes or main ingredients.

⚠️ Only respond in the **exact format** below and based on the **given quantity**.

Format:
Calories: __ kcal  
Protein: __ g  
Fat: __ g  
Carbohydrates: __ g  
Fiber: __ g

Food: ${food}  
Quantity: ${qty}

Note: For complex dishes, provide approximate values based on typical recipes and main ingredients.
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini nutrition response:", data);

      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return result || "Could not fetch nutritional info 😓";
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      return "Error fetching nutrition 😓";
    }
  };

  const handleSubmit = async () => {
    if ((!image && !foodName) || !quantity) {
      alert("Please fill at least food name or image, and enter quantity.");
      return;
    }

    setLoading(true);

    try {
      // Create a promise that resolves after 2 seconds
      const minimumLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));

      let foodClass = foodName;
      let confidence = 1.0;
      let geminiInfo = "No nutritional information available";

      // If image is provided, send it to Flask backend for classification
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const response = await fetch('http://localhost:5000/predict?include_gemini=true', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to classify image');
        }

        const data = await response.json();
        foodClass = data.class;
        setFoodName(foodClass);
        confidence = data.confidence;
      }

      // Get nutrition information from Gemini
      const geminiPromise = getNutritionFromGemini(foodClass, quantity);
      
      // Wait for both the minimum loading time and the API response
      const [geminiResponse] = await Promise.all([geminiPromise, minimumLoadingTime]);
      
      geminiInfo = geminiResponse;
      
      // Set the nutrition data
      setNutritionData(geminiInfo);

      // Save to Firebase
      const base64Image = image ? await convertToBase64(image) : "";
      await saveData(base64Image, foodClass, confidence, geminiInfo);

      // Reset form
      setQuantity("");
      setImage(null);
      setFoodName("");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const saveData = async (base64Image = "", foodClass, confidence, nutritionInfo) => {
    const username = localStorage.getItem("username") || "Anonymous";
    const userId = localStorage.getItem("userId"); // Get the current user's ID
    
    const foodData = {
      foodName: foodClass,
      quantity,
      image: base64Image,
      username,
      userId, // Add the user's ID
      timestamp: serverTimestamp(),
      nutritionInfo: nutritionInfo || "No nutritional information available",
      confidence: confidence
    };

    try {
      // Save to the user's subcollection
      if (userId) {
        const userRef = doc(db, "users", userId);
        const foodEntriesRef = collection(userRef, "foodEntries");
        await addDoc(foodEntriesRef, foodData);
        console.log("Food entry saved to user's subcollection");
      } else {
        console.error("No user ID found");
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Error saving food entry:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Food Name Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Food Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FoodIcon className={isDarkMode ? "text-green-400" : "text-green-600"} />
            </div>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Enter food name"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-dark-input border-gray-700 text-gray-200 placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Quantity
          </label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g., 1 cup, 200g, 2 pieces"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-dark-input border-gray-700 text-gray-200 placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Food Image (Optional)
        </label>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Camera Button */}
          <button
            type="button"
            onClick={startCamera}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm ${
              isDarkMode 
                ? 'bg-dark-input border-gray-700 text-gray-200 hover:bg-gray-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CameraIcon className={isDarkMode ? "text-green-400" : "text-green-600"} />
            <span>Take Photo</span>
          </button>
          
          {/* Upload Button */}
          <label className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm cursor-pointer ${
            isDarkMode 
              ? 'bg-dark-input border-gray-700 text-gray-200 hover:bg-gray-700' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <UploadIcon className={isDarkMode ? "text-green-400" : "text-green-600"} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Camera Preview */}
        {cameraOn && (
          <div className="mt-4 space-y-4">
            <video
              ref={videoRef}
              autoPlay
              className={`w-full max-w-md mx-auto rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            />
            <canvas ref={canvasRef} className="hidden" width="300" height="200" />
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {image && !cameraOn && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(image)}
              alt="Food"
              className={`w-full max-w-md mx-auto rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            />
            <button
              onClick={() => setImage(null)}
              className={`mt-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isDarkMode 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        Add Food Entry
      </button>

      {/* Nutrition Data Display */}
      {loading ? (
        <div className={`mt-6 p-4 lg:p-6 rounded-lg border flex flex-col items-center justify-center gap-4 ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-green-50 border-green-100'
        }`}>
          <div className="hidden lg:block w-full h-64">
            <Spline scene="https://prod.spline.design/wsu-PDzgyPSpoKcr/scene.splinecode" />
          </div>
          <p className={`text-center text-sm lg:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Analyzing your food and fetching nutritional information...
          </p>
        </div>
      ) : nutritionData ? (
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-green-50 border-green-100'
        }`}>
          <h3 className={`text-lg font-medium mb-2 ${
            isDarkMode ? 'text-green-400' : 'text-green-800'
          }`}>
            Nutritional Information
          </h3>
          <pre className={`whitespace-pre-wrap ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>{nutritionData}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default FoodInput;
