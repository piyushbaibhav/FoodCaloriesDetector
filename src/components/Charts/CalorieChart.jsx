import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const CalorieChart = () => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [filter, setFilter] = useState("today");
  const [chartData, setChartData] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState("calories");

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
      let fromDate = new Date();

      if (filter === "7days") {
        fromDate = dayjs().subtract(7, "day").toDate();
      } else if (filter === "30days") {
        fromDate = dayjs().subtract(30, "day").toDate();
      } else {
        fromDate.setHours(0, 0, 0, 0); // Start of today
      }

      const q = query(
        collection(db, "foodEntries"),
        where("timestamp", ">=", fromDate),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const foods = [];
      let total = 0;
      const chartTemp = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const nutrition = extractNutrients(data.nutritionInfo);

        let nutrientValue = 0;
        switch (selectedNutrient) {
          case "calories":
            nutrientValue = nutrition.calories;
            break;
          case "protein":
            nutrientValue = nutrition.protein;
            break;
          case "fat":
            nutrientValue = nutrition.fat;
            break;
          case "carbs":
            nutrientValue = nutrition.carbs;
            break;
          case "fiber":
            nutrientValue = nutrition.fiber;
            break;
          default:
            nutrientValue = nutrition.calories;
        }

        total += nutrientValue;

        const dateKey = dayjs(data.timestamp.toDate()).format("MM/DD/YYYY");

        // Group by date for bar chart
        if (!chartTemp[dateKey]) {
          chartTemp[dateKey] = 0;
        }
        chartTemp[dateKey] += nutrientValue;

        foods.push({
          name: data.foodName,
          nutrientValue: nutrientValue,
          quantity: data.quantity,
          timestamp: data.timestamp.toDate().toLocaleString(),
        });
      });

      const chartArray = Object.entries(chartTemp).map(([date, value]) => ({
        date,
        totalNutrientValue: value,
      }));

      setFoodEntries(foods);
      setTotalCalories(total);
      setChartData(chartArray);
    };

    fetchData();
  }, [filter, selectedNutrient]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-rose-600">🍱 Calorie History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      <div className="mb-4">
        <select
          value={selectedNutrient}
          onChange={(e) => setSelectedNutrient(e.target.value)}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700"
        >
          <option value="calories">Calories</option>
          <option value="protein">Protein</option>
          <option value="fat">Fat</option>
          <option value="carbs">Carbohydrates</option>
          <option value="fiber">Fiber</option>
        </select>
      </div>

      <div className="overflow-auto max-h-64 mb-6">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-rose-100">
            <tr>
              <th className="px-4 py-2">Food</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">
                {selectedNutrient.charAt(0).toUpperCase() +
                  selectedNutrient.slice(1)}
              </th>
              <th className="px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {foodEntries.map((item, index) => (
              <tr key={index} className="border-b border-rose-100">
                <td className="px-4 py-2 capitalize">{item.name}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">
                  {item.nutrientValue}{" "}
                  {selectedNutrient === "calories" ? "kcal" : "g"}
                </td>
                <td className="px-4 py-2">{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.slice(-7)}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="totalNutrientValue"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-center text-lg font-semibold text-rose-700">
        🔥 Total{" "}
        {selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)}{" "}
        Consumed: {totalCalories}{" "}
        {selectedNutrient === "calories" ? "kcal" : "g"}
      </p>
    </div>
  );
};

export default CalorieChart;
