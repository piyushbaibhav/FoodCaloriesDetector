import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import FoodInput from "../components/FoodInput";
import Sidebar from "../components/Sidebar";
import CalorieChart from "../components/Charts/CalorieChart";
import BMICalculator from "../components/BMI";
import GoalSetting from "../components/GoalSetting";
import NutrientProgress from "../components/NutrientProgress";
import NutritionPieChart from "../components/Charts/NutritionPieChart";
import NutritionalFactFinder from "../components/NutritionalFactFinder";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("input");
  const [dailyGoals, setDailyGoals] = useState({
    carbs: 0,
    protein: 0,
    fat: 0,
    calories: 0,
  });
  const [goalsSet, setGoalsSet] = useState(false);

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
      case "progress":
        if (!goalsSet) {
          return (
            <GoalSetting
              setDailyGoals={setDailyGoals}
              setGoalsSet={setGoalsSet}
            />
          );
        } else {
          return (
            <div className="flex flex-col lg:flex-row w-full gap-6 mt-10">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-center text-rose-700 mb-4">
                  🏅 Progress Toward Daily Goals
                </h1>
                <p className="text-center text-gray-700 mb-6">
                  Track your progress toward achieving daily nutritional goals.
                </p>
                <NutrientProgress />
              </div>
              <div className="w-full lg:w-[400px]">
                <CalorieChart />
              </div>
            </div>
          );
        }
      case "facts":
        return (
          <div className="mt-10 w-full max-w-5xl">
            <NutritionalFactFinder />
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
              <NutritionPieChart />
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
