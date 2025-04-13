import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FoodInput from "../components/FoodInput";
import Sidebar from "../components/Sidebar";
import CalorieChart from "../components/Charts/CalorieChart";
import BMICalculator from "../components/BMI";
import NutritionPieChart from "../components/Charts/NutritionPieChart"; // 👈 Pie Chart Import

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("input");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email.split("@")[0];
        setUsername(name);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderSection = () => {
    switch (section) {
      case "calorie":
        return (
          <div className="mt-10 w-full max-w-5xl">
            <CalorieChart />
          </div>
        );
      case "bmi":
        return (
          <div className="mt-10 w-full max-w-5xl">
            <BMICalculator />
          </div>
        );
      case "effect":
        return (
          <div className="mt-10 w-full max-w-5xl">
            <div className="bg-white shadow-xl rounded-xl p-6 text-gray-700">
              <h2 className="text-2xl font-bold mb-3 text-center">
                🧠 Gemini AI Prediction (Coming Soon)
              </h2>
              <p className="text-center">
                Gemini AI will analyze the food image and quantity to predict calorie intake and its effect on your BMI.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="flex-1">
              <div className="w-full max-w-3xl text-center">
                <h1 className="text-3xl font-bold mb-2 text-rose-700">
                  👋 Hello, {username}
                </h1>
                <h2 className="text-xl mb-6 text-gray-700">
                  🍽️ What food are you having?
                </h2>
              </div>
              <FoodInput />
            </div>
            <div className="w-full lg:w-[400px]">
              <NutritionPieChart /> {/* ✅ Right side pie chart */}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-100 to-pink-200">
      <Sidebar setSection={setSection} />
      <main className="flex flex-col items-center justify-start w-full ml-16 p-6 transition-all duration-300">
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;
