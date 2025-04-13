import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

const NutrientProgress = () => {
  const [goals, setGoals] = useState(null);
  const [consumed, setConsumed] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const extractNutrients = (nutritionInfo) => {
    if (!nutritionInfo || typeof nutritionInfo !== "string") {
      return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    }

    const nutritionRegex =
      /Calories:\s*(\d+)\s*kcal\s*Protein:\s*([\d.]+)\s*g\s*Fat:\s*([\d.]+)\s*g\s*Carbohydrates:\s*([\d.]+)\s*g\s*Fiber:\s*([\d.]+)\s*g/;
    const match = nutritionInfo.match(nutritionRegex);

    if (match) {
      return {
        calories: parseInt(match[1], 10),
        protein: parseFloat(match[2]),
        fat: parseFloat(match[3]),
        carbs: parseFloat(match[4]),
        fiber: parseFloat(match[5]),
      };
    }

    return { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
  };

  useEffect(() => {
    if (!user) return;

    const todayKey = new Date().toISOString().split('T')[0];
    
    // Listen to goals
    const goalsUnsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'dailyGoals', todayKey),
      (doc) => {
        if (doc.exists()) {
          setGoals(doc.data());
        }
      }
    );

    // Function to calculate daily totals from food entries
    const calculateDailyTotals = async () => {
      const startOfDay = dayjs().startOf('day');
      
      const foodEntriesRef = collection(db, "foodEntries");
      const q = query(foodEntriesRef, where('timestamp', '>=', startOfDay.toDate()));
      
      const querySnapshot = await getDocs(q);
      let dailyTotals = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nutrition = extractNutrients(data.nutritionInfo);
        const quantity = parseFloat(data.quantity) / 100; // Convert to percentage

        dailyTotals.calories += nutrition.calories * quantity;
        dailyTotals.protein += nutrition.protein * quantity;
        dailyTotals.fat += nutrition.fat * quantity;
        dailyTotals.carbs += nutrition.carbs * quantity;
        dailyTotals.fiber += nutrition.fiber * quantity;
      });

      setConsumed({
        calories: Number(dailyTotals.calories.toFixed(1)),
        protein: Number(dailyTotals.protein.toFixed(1)),
        fat: Number(dailyTotals.fat.toFixed(1)),
        carbs: Number(dailyTotals.carbs.toFixed(1)),
        fiber: Number(dailyTotals.fiber.toFixed(1)),
      });
    };

    // Initial calculation
    calculateDailyTotals();

    // Set up real-time listener for food entries
    const foodEntriesRef = collection(db, "foodEntries");
    const q = query(foodEntriesRef, where('timestamp', '>=', dayjs().startOf('day').toDate()));
    
    const unsubscribe = onSnapshot(q, () => {
      calculateDailyTotals();
    });

    return () => {
      goalsUnsubscribe();
      unsubscribe();
    };
  }, [user]);

  if (!goals || !consumed) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const nutrients = [
    { name: 'Carbs', consumed: consumed.carbs, goal: goals.carbs, color: '#FF6B6B', unit: 'g' },
    { name: 'Protein', consumed: consumed.protein, goal: goals.protein, color: '#4ECDC4', unit: 'g' },
    { name: 'Fat', consumed: consumed.fat, goal: goals.fat, color: '#45B7D1', unit: 'g' },
    { name: 'Calories', consumed: consumed.calories, goal: goals.calories, color: '#96CEB4', unit: 'kcal' },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {nutrients.map((nutrient) => (
        <div key={nutrient.name} className="flex flex-col items-center">
          <div className="w-32 h-32">
            <CircularProgressbar
              value={Math.min((nutrient.consumed / nutrient.goal) * 100, 100)}
              text={`${Math.round((nutrient.consumed / nutrient.goal) * 100)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: nutrient.color,
                textColor: '#374151',
                trailColor: '#f3f4f6',
              })}
            />
          </div>
          <div className="mt-2 text-center">
            <h3 className="font-medium text-gray-900">{nutrient.name}</h3>
            <p className="text-sm text-gray-500">
              {`${nutrient.consumed.toFixed(1)}/${nutrient.goal}${nutrient.unit}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NutrientProgress; 