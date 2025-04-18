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
import FoodLog from "../components/FoodLog";
import AINutritionistChat from "../components/AINutritionistChat";
import TrackerDashboard from "../components/TrackerDashboard";
import DarkModeToggle from "../components/DarkModeToggle";

// Decorative SVG Vector
const WaveVector = () => (
  <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" opacity="0.1"></path>
    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.47,89.67-39.8V0Z" fill="currentColor" opacity="0.1"></path>
  </svg>
);

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
      case "tracker":
        return (
          <div className="mt-10 w-full max-w-5xl">
            <TrackerDashboard />
          </div>
        );
      case "nutritionist":
        return (
          <div className="mt-10 w-full max-w-7xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
              AI Nutritionist Chat
            </h1>
            <div className="flex h-[calc(100vh-250px)]">
              <AINutritionistChat />
            </div>
          </div>
        );
      case "foodlog":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
              Food Log
            </h1>
            <FoodLog />
          </div>
        );
      case "calorie":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
              Calorie History
            </h1>
            <CalorieChart />
          </div>
        );
      case "bmi":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
              BMI Calculator
            </h1>
            <BMICalculator />
          </div>
        );
      case "progress":
        if (!goalsSet) {
          return (
            <div className="mt-10 w-full max-w-5xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
              <GoalSetting
                setDailyGoals={setDailyGoals}
                setGoalsSet={setGoalsSet}
              />
            </div>
          );
        } else {
          return (
            <div className="w-full bg-white dark:bg-dark-card p-6 rounded-xl shadow-md mt-10">
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
                Daily Progress
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Track your progress toward achieving daily nutritional goals.
              </p>
              <NutrientProgress />
            </div>
          );
        }
      case "facts":
        return (
          <div className="mt-10 w-full max-w-5xl bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-6">
              Nutritional Fact Finder
            </h1>
            <NutritionalFactFinder />
          </div>
        );
      default:
        return (
          <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="flex-1 bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
              <div className="w-full max-w-3xl text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-green-700 dark:text-green-400">
                  Hello, {username}!
                </h1>
                <h2 className="text-xl text-gray-600 dark:text-gray-300">
                  What food are you having today?
                </h2>
              </div>
              <FoodInput />
            </div>
            <div className="w-full lg:w-[400px] bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
              <NutritionPieChart />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      <DarkModeToggle />
      <Sidebar setSection={setSection} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;