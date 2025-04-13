import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

const NutritionPieChart = () => {
  const [nutrientData, setNutrientData] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
  });

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
    const fetchData = async () => {
      const q = query(
        collection(db, "foodEntries"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);

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
        const timestamp = data.timestamp?.toDate?.(); // convert Firestore timestamp

        if (timestamp && dayjs(timestamp).isAfter(today)) {
          const nutrition = extractNutrients(data.nutritionInfo);
          totalNutrients.calories += nutrition.calories;
          totalNutrients.protein += nutrition.protein;
          totalNutrients.fat += nutrition.fat;
          totalNutrients.carbs += nutrition.carbs;
          totalNutrients.fiber += nutrition.fiber;
        }
      });

      setNutrientData({
        calories: Number(totalNutrients.calories.toFixed(1)),
        protein: Number(totalNutrients.protein.toFixed(1)),
        fat: Number(totalNutrients.fat.toFixed(1)),
        carbs: Number(totalNutrients.carbs.toFixed(1)),
        fiber: Number(totalNutrients.fiber.toFixed(1)),
      });
    };

    fetchData();
  }, []);

  const chartData = [
    { name: "Calories", value: nutrientData.calories },
    { name: "Protein", value: nutrientData.protein },
    { name: "Fat", value: nutrientData.fat },
    { name: "Carbs", value: nutrientData.carbs },
    { name: "Fiber", value: nutrientData.fiber },
  ];

  const COLORS = ["#f43f5e", "#4CAF50", "#FFC107", "#2196F3", "#9C27B0"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">
        🍽️ Today's Nutrition Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center mt-4 text-lg font-semibold text-rose-700">
        <p>Total Calories: {nutrientData.calories.toFixed(1)} kcal</p>
        <p>Total Protein: {nutrientData.protein.toFixed(1)} g</p>
        <p>Total Fat: {nutrientData.fat.toFixed(1)} g</p>
        <p>Total Carbs: {nutrientData.carbs.toFixed(1)} g</p>
        <p>Total Fiber: {nutrientData.fiber.toFixed(1)} g</p>
      </div>
    </div>
  );
};

export default NutritionPieChart;
