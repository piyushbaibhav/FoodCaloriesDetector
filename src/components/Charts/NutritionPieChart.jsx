import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { getAuth } from "firebase/auth";
import { useDarkMode } from "../../context/DarkModeContext";

// Chart Icon Component
const PieChartIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }) => {
  const { isDarkMode } = useDarkMode();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / data.total) * 100).toFixed(1);
    
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-chart-tooltip-bg text-dark-chart-tooltip-text border border-dark-chart-tooltip-border' : 'bg-white text-gray-800 border border-gray-200'}`}>
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm" style={{ color: data.color }}>
          {data.value}g ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const NutritionPieChart = () => {
  const [nutrientData, setNutrientData] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const auth = getAuth();
  const { isDarkMode } = useDarkMode();

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
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const foodEntriesRef = collection(userRef, "foodEntries");
    const q = query(foodEntriesRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let totalNutrients = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
      };

      const today = dayjs().startOf("day");

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.();

        if (timestamp && dayjs(timestamp).isAfter(today)) {
          const nutrition = extractNutrients(data.nutritionInfo);
          totalNutrients.calories += nutrition.calories;
          totalNutrients.protein += nutrition.protein;
          totalNutrients.fat += nutrition.fat;
          totalNutrients.carbs += nutrition.carbs;
          totalNutrients.fiber += nutrition.fiber;
        }
      });

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      setNutrientData({
        calories: Number(totalNutrients.calories.toFixed(1)),
        protein: Number(totalNutrients.protein.toFixed(1)),
        fat: Number(totalNutrients.fat.toFixed(1)),
        carbs: Number(totalNutrients.carbs.toFixed(1)),
        fiber: Number(totalNutrients.fiber.toFixed(1)),
      });
    }, (error) => {
      console.error('Error listening to food entries:', error);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const chartData = [
    { name: "Calories", value: nutrientData.calories, color: "#10b981" },
    { name: "Protein", value: nutrientData.protein, color: "#3b82f6" },
    { name: "Fat", value: nutrientData.fat, color: "#f59e0b" },
    { name: "Carbs", value: nutrientData.carbs, color: "#8b5cf6" },
    { name: "Fiber", value: nutrientData.fiber, color: "#ec4899" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => item.total = total);

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="text-green-600 dark:text-green-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
          Nutrition Distribution
        </h2>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              animationDuration={isAnimating ? 1000 : 0}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => (
                <span className={isDarkMode ? "text-dark-text" : "text-gray-600"}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className={`flex flex-col items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all duration-1000 ${
              isAnimating ? 'scale-105' : 'scale-100'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full mb-1"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {item.name}
            </span>
            <span className="text-base font-semibold text-gray-800 dark:text-dark-text">
              {item.value}g
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionPieChart;
