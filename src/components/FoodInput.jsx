import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const GEMINI_API_KEY = "AIzaSyA40OoIi5AEkJhyehzX_1hvXGlSAL-DEJE";

const FoodInput = () => {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
      setImage(file);
    }, "image/jpeg");
    stopCamera();
  };

  const getNutritionFromGemini = async (food, qty) => {
    const prompt = `
You are a certified dietitian and nutritionist.

Given the food item and its specific quantity, return the accurate nutritional breakdown based on standard global nutritional databases (like USDA).

⚠️ Only respond in the **exact format** below and based on the **given quantity**.

Format:
Calories: __ kcal  
Protein: __ g  
Fat: __ g  
Carbohydrates: __ g  
Fiber: __ g

Food: ${food}  
Quantity: ${qty}
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

    const saveData = async (base64Image = "") => {
      try {
        const nutritionInfo = await getNutritionFromGemini(foodName, quantity);
        setNutritionData(nutritionInfo);

        await addDoc(collection(db, "foodEntries"), {
          foodName,
          quantity,
          image: base64Image,
          nutritionInfo,
          timestamp: serverTimestamp(),
        });

        alert("Saved ✅");
        setFoodName("");
        setQuantity("");
        setImage(null);
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        alert("Prediction or upload failed ❌");
      } finally {
        setLoading(false);
      }
    };

    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => saveData(reader.result);
      reader.readAsDataURL(image);
    } else {
      await saveData();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4">
      <input
        type="text"
        placeholder="🍲 Enter food name"
        className="input input-bordered w-full"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="file-input file-input-bordered w-full"
      />

      <button
        onClick={startCamera}
        className="bg-indigo-500 text-white py-2 rounded-xl hover:bg-indigo-600 transition-all"
      >
        📷 Capture from Camera
      </button>

      {cameraOn && (
        <div className="flex flex-col items-center gap-2">
          <video ref={videoRef} autoPlay className="w-full max-w-xs rounded-md border border-gray-300" />
          <button
            onClick={capturePhoto}
            className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
          >
            📸 Take Photo
          </button>
          <canvas ref={canvasRef} width="300" height="200" hidden />
        </div>
      )}

      <input
        type="text"
        placeholder="⚖️ Enter quantity (e.g., 100 grams)"
        className="input input-bordered w-full"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <button
        className={`${
          loading ? "bg-gray-400" : "bg-rose-500 hover:bg-rose-600"
        } text-white px-4 py-2 rounded-xl transition-all`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "⏳ Predicting..." : "🔍 Predict & Get Nutrition Info"}
      </button>

      {nutritionData && (
        <div className="mt-4 bg-green-100 text-green-800 p-3 rounded-xl text-left whitespace-pre-wrap">
          🧪 <strong>Nutrition Info:</strong>  
          <pre className="mt-1">{nutritionData}</pre>
        </div>
      )}
    </div>
  );
};

export default FoodInput;
