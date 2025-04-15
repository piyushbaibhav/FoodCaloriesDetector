import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useDarkMode } from "../context/DarkModeContext";

// Goal Icon Component
const GoalIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);

const GoalSetting = ({ setDailyGoals, setGoalsSet }) => {
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useDarkMode();

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      const todayKey = new Date().toISOString().split("T")[0];
      const goalRef = doc(db, "users", user.uid, "dailyGoals", todayKey);

      try {
        const goalDoc = await getDoc(goalRef);
        if (goalDoc.exists()) {
          const goals = goalDoc.data();
          setCarbs(goals.carbs);
          setProtein(goals.protein);
          setFat(goals.fat);
          setCalories(goals.calories);
          setDailyGoals(goals);
          setGoalsSet(true);
        }
      } catch (err) {
        console.error("Failed to fetch goals ❌", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user, setDailyGoals, setGoalsSet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const goals = {
      carbs: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
      calories: Number(calories),
    };

    if (user) {
      const todayKey = new Date().toISOString().split("T")[0];
      const goalRef = doc(db, "users", user.uid, "dailyGoals", todayKey);

      try {
        await setDoc(goalRef, goals);
        setDailyGoals(goals);
        setGoalsSet(true);
        console.log("Goals saved to Firestore ✅");
      } catch (err) {
        console.error("Failed to save goals ❌", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${isDarkMode ? 'bg-dark-card' : 'bg-white'} p-6 rounded-xl shadow-md`}>
      <div className="flex items-center justify-center mb-6">
        <div className={`w-12 h-12 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-xl flex items-center justify-center mr-3`}>
          <GoalIcon className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
        </div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text' : 'text-gray-800'}`}>
          Set Your <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>Daily Goals</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Carbs (g)
          </label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            required
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Protein (g)
          </label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            required
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Fat (g)
          </label>
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            required
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Calories (kcal)
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
        >
          Save Goals
        </button>
      </form>
    </div>
  );
};

export default GoalSetting;
