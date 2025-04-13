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
          <div className="mt-10 w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Calorie History
            </h1>
            <CalorieChart />
          </div>
        );
      case "bmi":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              BMI Calculator
            </h1>
            <BMICalculator />
          </div>
        );
      case "progress":
        if (!goalsSet) {
          return (
            <div className="mt-10 w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
              <GoalSetting
                setDailyGoals={setDailyGoals}
                setGoalsSet={setGoalsSet}
              />
            </div>
          );
        } else {
          return (
            <div className="flex flex-col lg:flex-row w-full gap-6 mt-10">
              <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-green-700 mb-4">
                  Daily Progress
                </h1>
                <p className="text-gray-600 mb-6">
                  Track your progress toward achieving daily nutritional goals.
                </p>
                <NutrientProgress />
              </div>
              <div className="w-full lg:w-[400px] bg-white p-6 rounded-xl shadow-md">
                <CalorieChart />
              </div>
            </div>
          );
        }
      case "facts":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Nutritional Fact Finder
            </h1>
            <NutritionalFactFinder />
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <div className="w-full max-w-3xl text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-green-700">
                  Hello, {username}!
                </h1>
                <h2 className="text-xl text-gray-600">
                  What food are you having today?
                </h2>
              </div>
              <FoodInput />
            </div>
            <div className="w-full lg:w-[400px] bg-white p-6 rounded-xl shadow-md">
              <NutritionPieChart />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-green-100">
      <Sidebar setSection={setSection} />
      <main className="flex flex-col items-center w-full ml-0 md:ml-20 lg:ml-64 p-4 md:p-8 transition-all duration-300">
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;