import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const GoalSetting = ({ setDailyGoals, setGoalsSet }) => {
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(true);

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
        <p className="text-center">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-4">Set Your Daily Goals</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Carbs (g)</label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Protein (g)</label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fat (g)</label>
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Calories</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-rose-500 text-white p-2 rounded-lg hover:bg-rose-600"
        >
          Update Goals
        </button>
      </form>
    </div>
  );
};

export default GoalSetting;
